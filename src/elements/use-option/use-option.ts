import { LitElement, css, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import createId from "../../utils/create-id";

type HtmlTag = typeof html;
type IconOverride = ((html: HtmlTag) => TemplateResult | string) | TemplateResult | string;

/**
 * `use-option` is a custom element that represents an option in a `use-listbox-input` custom
 * element.
 *
 * The children of this element are the content of the option and must not contain any
 * interactive elements.
 *
 * Selection is shown by one of two indicators, swapped based on the option's `selected` state:
 * a checkmark when selected, nothing (a reserved-space placeholder) when not.
 *
 * Swapping an indicator **per instance** is a slot: put your own element in the `selected-indicator`
 * or `deselected-indicator` slot and it replaces `part(selected-indicator-default)` /
 * `part(deselected-indicator-default)` entirely for that option.
 *
 * Swapping an indicator **for every option in the app** doesn't need touching this component's
 * `render()` at all — style `::part(selected-indicator-default)` /
 * `::part(deselected-indicator-default)` from an outside stylesheet, the same way any shadow DOM
 * part is themed:
 *
 * ```css
 * use-option::part(selected-indicator-default) {
 *   mask-image: url("/icons/my-checkmark.svg");
 * }
 * ```
 *
 * (When the design system's `theme.css` is loaded, this is already wired to a pair of tokens —
 * `--usewc-effect-selected-indicator-mask-image` for the shape and
 * `--usewc-effect-selected-indicator-color` for what paints it (`--usewc-effect-deselected-…`
 * for the other state) — so redefining those custom properties has the same effect without
 * writing a `::part()` rule at all.)
 *
 * `::part()` only reaches CSS-expressible changes (a mask, a background, a transform). For
 * anything else — different markup, an icon font, logic beyond a mask — set the static
 * `selectedIcon` and `deselectedIcon` hooks. Every `<use-option>` in the page picks them up;
 * consumers keep writing the same tag, no new element to register or remember to use instead.
 * Set them once, as early as possible (an app's entry point, before any options connect) — Lit
 * calls `render()` fresh on every update, so an already-connected instance only reflects the
 * change once something causes it to re-render:
 *
 * ```ts
 * // A bare string or TemplateResult is used as-is, on every option:
 * UseOption.selectedIcon = "✓";
 * UseOption.deselectedIcon = "";
 *
 * // A function is called on every render instead:
 * UseOption.selectedIcon = (html) => html`<my-icon name="check"></my-icon>`;
 * ```
 *
 * The function form is called with the component's own `html` tag as its (optional) first
 * argument rather than requiring the caller to import one — a page can end up with more than one
 * copy of `lit-html` in its module graph, and a `TemplateResult` built from a *different* copy
 * than the one this component renders with can silently fail to render. Taking `html` in as a
 * parameter sidesteps that: whatever's returned is guaranteed to come from the same `lit-html`
 * this component already uses. A bare string skips the concern entirely.
 *
 * A set icon still renders under `part(selected-indicator-default)` /
 * `part(deselected-indicator-default)` — the same part the design system's theme masks into the
 * built-in glyph. Combining a static hook with `theme.css` means the theme's masking still
 * applies to the custom content; reset the relevant `mask-image` token or `::part()` rule if that
 * fights with what was set.
 *
 * Only need to change the icon on **some** options, not every one in the app? Extend the class,
 * override `render()` normally, and register the subclass under a different tag name so it
 * coexists with the built-in element instead of replacing it everywhere:
 *
 * ```ts
 * class MyOption extends UseOption {
 *   override render() {
 *     return html`<slot></slot><slot name="selected-indicator"><my-icon name="check"></my-icon></slot>`;
 *   }
 * }
 * customElements.define("my-option", MyOption);
 * ```
 *
 * @slot selected-indicator - Replaces the default checkmark shown when the option is selected.
 * @slot deselected-indicator - Replaces the default (empty) indicator shown when the option is not selected.
 * @slot default - Option content.
 */
@customElement("use-option")
export class UseOption extends LitElement {
  /**
   * Global override for the selected-state indicator. When set, every `<use-option>` in the page
   * renders this inside `part(selected-indicator-default)` instead of the built-in ✔ character.
   * Unset (the default) keeps the built-in checkmark.
   */
  static selectedIcon?: IconOverride;

  /**
   * Global override for the deselected-state indicator — the counterpart to {@link selectedIcon}.
   * Unset (the default) keeps the built-in (empty) placeholder.
   */
  static deselectedIcon?: IconOverride;

  @property({ type: Boolean })
  set selected(flag) {
    if (flag) {
      this.#internals.states.add("selected");
    } else {
      this.#internals.states.delete("selected");
    }
  }

  get selected() {
    return this.#internals.states.has("selected");
  }

  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add("disabled");
    } else {
      this.#internals.states.delete("disabled");
    }
  }

  get disabled() {
    return this.#internals.states.has("disabled");
  }

  @property()
  set value(v: string | null) {
    if (v != null) {
      this.setAttribute("value", v);
    }
  }

  get value() {
    return this.getAttribute("value") ?? this.textContent;
  }

  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();

    if (!this.id) {
      this.id = createId();
    }

    /**
     * Boolean attributes are reflected as true if they are present on the
     * element, we do not need to check for [attr]==='false'
     *
     * @link https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
     */
    if (this.hasAttribute("selected")) {
      this.#internals.states.add("selected");
    }

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  setActive(value: boolean) {
    if (value) {
      this.#internals.states.add("active");
    } else {
      this.#internals.states.delete("active");
    }
  }

  #iconContent(customIcon: IconOverride | undefined, fallback: TemplateResult | string) {
    if (typeof customIcon === "function") {
      return customIcon(html);
    }

    if (customIcon !== undefined) {
      return customIcon;
    }

    return fallback;
  }

  render() {
    return html`
      <slot part="selected-indicator" name="selected-indicator">
        <span part="selected-indicator-default" aria-hidden="true"
          >${this.#iconContent(UseOption.selectedIcon, "✔")}</span
        >
      </slot>
      <slot part="deselected-indicator" name="deselected-indicator">
        <span part="deselected-indicator-default" aria-hidden="true"
          >${this.#iconContent(UseOption.deselectedIcon, " ")}</span
        >
      </slot>
      <slot></slot>
    `;
  }

  /**
   * Consumers will need to override the `::after` pseudo-element if they want
   * to customize it until `:has-slotted` pseudo-class is available
   *
   * @link https://github.com/w3c/csswg-drafts/issues/6867
   */
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      cursor: default;
    }

    /* Sized and centered here, on the slot itself, rather than left to the assigned or default
     content's own metrics — a plain space and a ✔ glyph (or a consumer's own slotted icons)
     don't share a width otherwise, which shifted every option sideways depending on its
     selection state. */
    slot[name="selected-indicator"],
    slot[name="deselected-indicator"] {
      display: none;
      inline-size: 1lh;
      block-size: 1lh;
      align-items: center;
      justify-content: center;
    }

    :host(:state(selected)) slot[name="selected-indicator"] {
      display: inline-flex;
    }

    :host(:not(:state(selected))) slot[name="deselected-indicator"] {
      display: inline-flex;
    }

    :host(:state(disabled)) {
      opacity: 0.5;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-option": UseOption;
  }
}

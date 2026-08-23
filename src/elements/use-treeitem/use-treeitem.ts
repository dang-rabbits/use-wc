import { LitElement, css, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import createId from "../../utils/create-id";

type HtmlTag = typeof html;
type IconOverride = ((html: HtmlTag) => TemplateResult | string) | TemplateResult | string;

/**
 * `use-treeitem` is a custom element that represents a node in a `use-tree` custom element.
 *
 * The children of this element are the content of the item, plus any nested `use-treeitem`
 * elements representing its children, and must not otherwise contain interactive elements.
 *
 * Four indicators render alongside an item's content: an expanded/collapsed disclosure glyph
 * (only one of the pair shows, depending on state), and a selected/deselected glyph (same).
 *
 * Swapping an indicator **per instance** is a slot: put your own element in the
 * `expanded-indicator`, `collapsed-indicator`, `selected-indicator`, or `deselected-indicator`
 * slot and it replaces that indicator's `part(*-default)` entirely for that item. `use-tree`
 * also offers a shortcut for this: slot an icon into `use-tree` itself and it's cloned into every
 * item's matching slot — see `use-tree`'s own docs.
 *
 * Swapping an indicator **for every item in the app** doesn't need touching this component's
 * `render()` at all — style `::part(*-indicator-default)` from an outside stylesheet, the same
 * way any shadow DOM part is themed:
 *
 * ```css
 * use-treeitem::part(collapsed-indicator-default) {
 *   mask-image: url("/icons/my-chevron.svg");
 * }
 * ```
 *
 * (When the design system's `theme.css` is loaded, this is already wired to tokens — a
 * mask-image/color pair per indicator: `--usewc-effect-tree-item-expanded-indicator-mask-image`
 * / `-color`, `--usewc-effect-tree-item-collapsed-indicator-mask-image` / `-color`, and
 * `--usewc-effect-selected-indicator-mask-image` / `-color` (`--usewc-effect-deselected-…` for
 * the other state) — so redefining those custom properties has the same effect without writing a
 * `::part()` rule at all.)
 *
 * `::part()` only reaches CSS-expressible changes (a mask, a background, a transform). For
 * anything else — different markup, an icon font, logic beyond a mask — set the matching static
 * hook: `expandedIcon`, `collapsedIcon`, `selectedIcon`, `deselectedIcon`. Every `<use-treeitem>`
 * in the page picks them up; consumers keep writing the same tag, no new element to register or
 * remember to use instead. Set them once, as early as possible (an app's entry point, before any
 * items connect) — Lit calls `render()` fresh on every update, so an already-connected instance
 * only reflects the change once something causes it to re-render:
 *
 * ```ts
 * // A bare string or TemplateResult is used as-is, on every item:
 * UseTreeitem.collapsedIcon = "▸";
 * UseTreeitem.expandedIcon = "▾";
 *
 * // A function is called on every render instead:
 * UseTreeitem.collapsedIcon = (html) => html`<my-icon name="chevron-right"></my-icon>`;
 * ```
 *
 * The function form is called with the component's own `html` tag as its (optional) first
 * argument rather than requiring the caller to import one — a page can end up with more than one
 * copy of `lit-html` in its module graph, and a `TemplateResult` built from a *different* copy
 * than the one this component renders with can silently fail to render. Taking `html` in as a
 * parameter sidesteps that: whatever's returned is guaranteed to come from the same `lit-html`
 * this component already uses. A bare string skips the concern entirely.
 *
 * A set icon still renders under that indicator's own `part(*-indicator-default)` — the same part
 * the design system's theme masks into the built-in glyph. Combining a static hook with
 * `theme.css` means the theme's masking still applies to the custom content; reset the relevant
 * `mask-image` token or `::part()` rule if that fights with what was set.
 *
 * Only need to change an indicator on **some** items, not every one in the app? Extend the class,
 * override `render()` normally, and register the subclass under a different tag name so it
 * coexists with the built-in element instead of replacing it everywhere.
 *
 * ## To Do
 *
 * - [ ] When the parent is no longer disabled, update the items without their own `[disabled]`
 *
 * @slot expanded-indicator - Replaces the default disclosure glyph shown when the item is expanded.
 * @slot collapsed-indicator - Replaces the default disclosure glyph shown when the item is collapsed.
 * @slot selected-indicator - Replaces the default glyph shown when the item is selected.
 * @slot deselected-indicator - Replaces the default (empty) glyph shown when the item is not selected.
 * @slot default - Item content, plus any nested `use-treeitem` children.
 */
@customElement("use-treeitem")
export class UseTreeitem extends LitElement {
  /**
   * Global override for the expanded-state disclosure indicator. When set, every
   * `<use-treeitem>` in the page renders this inside `part(expanded-indicator-default)` instead
   * of the built-in `-` character. Unset (the default) keeps the built-in glyph.
   */
  static expandedIcon?: IconOverride;

  /**
   * Global override for the collapsed-state disclosure indicator — the counterpart to
   * {@link expandedIcon}. Unset (the default) keeps the built-in `+` character.
   */
  static collapsedIcon?: IconOverride;

  /**
   * Global override for the selected-state indicator. Unset (the default) keeps the built-in ✔
   * character.
   */
  static selectedIcon?: IconOverride;

  /**
   * Global override for the deselected-state indicator — the counterpart to
   * {@link selectedIcon}. Unset (the default) keeps the built-in (empty) placeholder.
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
    return this.#internals.states.has("disabled") || this.#isParentDisabled();
  }

  @property({ type: Boolean })
  set expanded(flag) {
    if (flag) {
      this.#internals.states.add("expanded");
    } else {
      this.#internals.states.delete("expanded");
    }
  }

  get expanded() {
    return this.#internals.states.has("expanded");
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

    if (this.hasAttribute("disabled") || this.#isParentDisabled()) {
      this.#internals.states.add("disabled");
    }

    if (this.parentElement instanceof UseTreeitem) {
      this.slot = "tree-items";
    }

    if (this.querySelector("use-treeitem")) {
      this.#internals.states.add("has-children");
    }
  }

  #isParentDisabled() {
    return this.parentElement instanceof UseTreeitem && this.parentElement.hasAttribute("disabled");
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  firstUpdated() {
    this.role = "treeitem";
  }

  updated() {
    const hasChildren = !!this.querySelector("use-treeitem");
    if (hasChildren) {
      this.setAttribute("aria-expanded", this.expanded ? "true" : "false");
    } else {
      this.removeAttribute("aria-expanded");
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
      <div part="content">
        <div part="toggle-indicator" aria-hidden="true" @click=${this.toggle}>
          <slot name="expanded-indicator" part="expanded-indicator">
            <span part="expanded-indicator-default"
              >${this.#iconContent(UseTreeitem.expandedIcon, "-")}</span
            >
          </slot>
          <slot name="collapsed-indicator" part="collapsed-indicator">
            <span part="collapsed-indicator-default"
              >${this.#iconContent(UseTreeitem.collapsedIcon, "+")}</span
            >
          </slot>
        </div>
        <slot name="selected-indicator" part="selected-indicator" aria-hidden="true">
          <span part="selected-indicator-default"
            >${this.#iconContent(UseTreeitem.selectedIcon, "✔")}</span
          >
        </slot>
        <slot name="deselected-indicator" part="deselected-indicator" aria-hidden="true">
          <span part="deselected-indicator-default"
            >${this.#iconContent(UseTreeitem.deselectedIcon, " ")}</span
          >
        </slot>
        <slot></slot>
      </div>
      <div part="tree-items" role="group">
        <slot name="tree-items"></slot>
      </div>
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
      display: block;
      cursor: default;
    }

    slot[name="selected-indicator"],
    slot[name="deselected-indicator"],
    slot[name="expanded-indicator"],
    slot[name="collapsed-indicator"] {
      font-family: monospace;
      display: none;
    }

    /* Sized and centered here, on the slot itself, rather than left to the assigned or default
     content's own metrics — a plain space and a ✔ glyph (or a consumer's own slotted icons)
     don't share a width otherwise, which shifted every item sideways depending on its selection
     state. */
    slot[name="selected-indicator"],
    slot[name="deselected-indicator"] {
      inline-size: 1lh;
      block-size: 1lh;
      align-items: center;
      justify-content: center;
    }

    [part="toggle-indicator"] {
      visibility: hidden;
      display: contents;
    }

    :host(:state(has-children)) [part="toggle-indicator"] {
      visibility: visible;
    }

    :host(:state(expanded)) slot[name="expanded-indicator"] {
      display: contents;
    }

    :host(:not(:state(expanded))) slot[name="collapsed-indicator"] {
      display: contents;
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

    ::slotted(use-treeitem) {
      padding-inline-start: 1rem;
      display: none;
    }

    :host(:state(expanded)) ::slotted(use-treeitem) {
      display: block;
    }

    [part="content"] {
      display: flex;
      align-items: center;
    }

    :host(:focus) [part="content"],
    [part="content"]:hover {
      outline: none;
      background-color: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-treeitem": UseTreeitem;
  }
}

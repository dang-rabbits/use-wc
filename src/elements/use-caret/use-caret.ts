import { LitElement, css, html } from "lit";
import type { TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

type HtmlTag = typeof html;

/**
 * `use-caret` supplies the caret icon and label layout for a consumer who wants to own the
 * invoking button itself. It renders inside a plain `<button>`
 * that carries the native `popovertarget` attribute, pointing at a `use-menu`:
 *
 * ```html
 * <button id="thing" popovertarget="thing-menu">
 *   <use-caret>Menu</use-caret>
 * </button>
 * <use-menu id="thing-menu" aria-label="Menu">
 *   <button role="menuitem">First thing</button>
 * </use-menu>
 * ```
 *
 * `use-menu` finds this button on its own via `popovertarget` and anchors to it — no
 * `anchortarget` needed here; that's only for a menu with more than one invoker. See `use-menu`'s
 * own docs for that case.
 *
 * The button is entirely the consumer's own element — their classes, their content, their event
 * handlers. `use-caret` contributes no interactivity of its own: no internal button, no focus
 * target, no state. It only renders the label and caret glyph, so consumers get a consistent
 * visual trigger without giving up control of the button.
 *
 * The caret direction is derived rather than configured: a trigger nested inside a `use-menu`
 * is understood to open a submenu and renders pointing sideways; a top-level trigger renders
 * pointing down.
 *
 * Swapping in a different caret **per instance** is a slot: put your own element in the `icon`
 * slot and it replaces `part(icon-default)` entirely for that trigger.
 *
 * Swapping the default caret **for every trigger in the app** doesn't need touching this
 * component's `render()` at all — style `::part(icon-default)` from an outside stylesheet, the
 * same way any shadow DOM part is themed:
 *
 * ```css
 * use-caret::part(icon-default) {
 *   mask-image: url("/icons/my-caret.svg");
 * }
 * ```
 *
 * (When the design system's `theme.css` is loaded, this is already wired to a token —
 * `--usewc-effect-dropdown-trigger-icon-mask-image` — so redefining that custom property has
 * the same effect without writing a `::part()` rule at all.)
 *
 * `::part()` only reaches CSS-expressible changes (a mask, a background, a transform). For
 * anything else — different markup, an icon font, logic beyond a mask — set the static
 * `customIcon` hook. Every `<use-caret>` in the page picks it up; consumers keep writing the
 * same tag, no new element to register or remember to use instead. Set it once, as early as
 * possible (an app's entry point, before any triggers connect) — Lit calls `render()` fresh on
 * every update, so an already-connected instance only reflects the change once something causes
 * it to re-render:
 *
 * ```ts
 * // A bare string or TemplateResult is used as-is, on every trigger, nested or not:
 * UseCaret.customIcon = "→";
 *
 * // A function is called on every render instead, and told whether this particular trigger is
 * // nested — the same distinction the built-in ▼/▶ caret already makes for submenus:
 * UseCaret.customIcon = (html, isNested) =>
 *   isNested
 *     ? html`<my-icon name="chevron-right"></my-icon>`
 *     : html`<my-icon name="chevron-down"></my-icon>`;
 * ```
 *
 * The function form is called with the component's own `html` tag as its (optional) first
 * argument rather than requiring the caller to import one — a page can end up with more than one
 * copy of `lit-html` in its module graph, and a `TemplateResult` built from a *different* copy
 * than the one this component renders with can silently fail to render. Taking `html` in as a
 * parameter sidesteps that: whatever's returned is guaranteed to come from the same `lit-html`
 * this component already uses. A bare string skips the concern entirely, at the cost of not
 * being able to vary by `isNested`.
 *
 * Only need to change the icon on **some** triggers, not every one in the app? Extend the
 * class, override `render()` normally, and register the subclass under a different tag name so
 * it coexists with the built-in element instead of replacing it everywhere:
 *
 * ```ts
 * class MyCaret extends UseCaret {
 *   override render() {
 *     return html`<slot></slot><slot name="icon"><my-icon name="chevron"></my-icon></slot>`;
 *   }
 * }
 * customElements.define("my-caret", MyCaret);
 * ```
 *
 * @slot default - Trigger label content.
 * @slot icon - Replaces the default caret glyph.
 */
@customElement("use-caret")
export class UseCaret extends LitElement {
  /**
   * Global override for the default caret. When set, every `<use-caret>` in the page
   * renders this inside `part(icon-default)` instead of the built-in ▼/▶ character. A plain
   * string or `TemplateResult` is used as-is for every trigger, nested or not — for a caret that
   * still needs to point sideways on a submenu trigger, use the function form instead: it's
   * called with the component's own `html` tag and whether *this* trigger is nested, so a
   * returned template is guaranteed to come from the same `lit-html` instance this component
   * renders with, and can still vary the same way the built-in caret does. Unset (the default)
   * keeps the built-in caret.
   */
  static customIcon?:
    | ((html: HtmlTag, isNested: boolean) => TemplateResult | string)
    | TemplateResult
    | string;

  get #isNested() {
    return this.closest("use-menu") != null;
  }

  get #iconContent(): TemplateResult | string {
    const customIcon = UseCaret.customIcon;

    if (typeof customIcon === "function") {
      return customIcon(html, this.#isNested);
    }

    if (customIcon !== undefined) {
      return customIcon;
    }

    return this.#isNested ? "▶" : "▼";
  }

  render() {
    // theme.css masks part(icon-default) into the built-in ▼/▶ glyph; a customIcon is real
    // content meant to be seen, so it renders under a different part name instead.
    const part = UseCaret.customIcon === undefined ? "icon-default" : "icon-custom";

    return html`
      <slot></slot>
      <slot name="icon" part="icon">
        <span part=${part} aria-hidden="true">${this.#iconContent}</span>
      </slot>
    `;
  }

  static styles = css`
    :host {
      display: contents;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-caret": UseCaret;
  }
}

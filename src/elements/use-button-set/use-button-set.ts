import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Groups adjacent button-like controls into one visual unit — shared borders between touching
 * children, rounded corners only on the two outer ends, and a hovered or focused child's border
 * lifted above its neighbors so the whole border reads clearly. A child is a `<button>`, or
 * anything wearing `.appearance-button`; a `select` or `use-listbox-input` isn't themed yet (see
 * `theme/button-set.css`).
 *
 * `use-button-set` renders no shadow DOM and no template of its own — it exists only as a
 * dedicated tag for `theme/button-set.css` to style, the same way `use-layout` is a bare
 * primitive rather than a specific look. A classic split button is a text button followed by an
 * icon-only trigger for a `use-menu`:
 *
 * ```html
 * <use-button-set>
 *   <button type="button">Save</button>
 *   <button type="button" popovertarget="save-options" aria-label="More save options">
 *     <use-caret></use-caret>
 *   </button>
 * </use-button-set>
 * <use-menu id="save-options" aria-label="More save options">
 *   <button role="menuitem">Save as&hellip;</button>
 * </use-menu>
 * ```
 *
 * How the touching sides render is themeable rather than fixed: `--usewc-layout-button-set-gap`
 * (default: a negative overlap equal to the button border, for a seamless merged line) and
 * `--usewc-effect-button-set-border-radius-sequential` (default: `0`, for square touching corners) can
 * both be overridden — a positive gap and a small radius reads as a looser, softer set instead of
 * a fused one.
 *
 * @slot - The grouped controls.
 */
@customElement("use-button-set")
export class UseButtonSet extends LitElement {
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-button-set": UseButtonSet;
  }
}

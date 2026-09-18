import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * Groups adjacent controls — buttons and text-style inputs alike — into one visual unit: shared
 * borders between touching children, rounded corners only on the two outer ends, and a hovered
 * or focused child's border lifted above its neighbors so the whole border reads clearly.
 *
 * `use-control-set` renders no shadow DOM and no template of its own — it exists only as a
 * dedicated tag for `theme/control-set.css` to style, the same way `use-layout` is a bare
 * primitive rather than a specific look. A classic split button is a text button followed by an
 * icon-only trigger for a `use-menu`:
 *
 * ```html
 * <use-control-set>
 *   <button type="button">Save</button>
 *   <button type="button" popovertarget="save-options" aria-label="More save options">
 *     <use-caret></use-caret>
 *   </button>
 * </use-control-set>
 * <use-menu id="save-options" aria-label="More save options">
 *   <button role="menuitem">Save as&hellip;</button>
 * </use-menu>
 * ```
 *
 * A search box with an attached submit button follows the same shape, mixing a text input with a
 * button:
 *
 * ```html
 * <use-control-set>
 *   <input type="search" placeholder="Search" />
 *   <button type="submit">Go</button>
 * </use-control-set>
 * ```
 *
 * A child is a `<button>`, anything wearing `.appearance-button`, an `<input>` (other than a
 * checkbox/radio/range/file), a `<select>`, a `<textarea>`, or anything wearing
 * `.appearance-input` — see `theme/control-set.css` for exactly which selectors read which
 * radius/border tokens.
 *
 * How the touching sides render is themeable rather than fixed: `--usewc-layout-control-set-gap`
 * (default: a negative overlap equal to the child's own border, for a seamless merged line) and
 * `--usewc-effect-control-set-border-radius-sequential` (default: `0`, for square touching
 * corners) can both be overridden — a positive gap and a small radius reads as a looser, softer
 * set instead of a fused one.
 *
 * @slot - The grouped controls.
 */
@customElement("use-control-set")
export class UseControlSet extends LitElement {
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-control-set": UseControlSet;
  }
}

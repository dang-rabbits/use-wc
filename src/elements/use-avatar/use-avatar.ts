import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * `use-avatar` renders a small, fixed-size, clipped container for a person or entity's
 * likeness. Slot in an `<img>` (or `<picture>`) for a photo, an inline `<svg>` for a
 * generated or stylized mark, or arbitrary markup (a `<div>` of initials, a calendar badge);
 * whatever is slotted is centered and clipped to the avatar's shape. With nothing slotted,
 * `use-avatar` falls back to initials derived from the `name` attribute.
 *
 * ```html
 * <use-avatar><img src="ada.jpg" alt="" /></use-avatar>
 * <use-avatar name="Riley Quinn"></use-avatar>
 * <use-avatar><svg viewBox="0 0 32 32">…</svg></use-avatar>
 * ```
 *
 * Size it with plain CSS — `inline-size` for the size and `aspect-ratio` for the proportions —
 * from a stylesheet, a style attribute, or the design system's theme layer. The element takes no
 * custom properties of its own: it is a query container, so the initials scale from whatever box
 * it ends up with. A non-square `aspect-ratio` suits a wide thumbnail or poster.
 *
 * The element clips its content but gives it no shape of its own — that is the theme's, through
 * the affordance classes it defines: `.circle` (the themed default), `.square`, `.squircle` in
 * `theme/avatar.css`. A circle only reads right at a `1` ratio, so a wide avatar wants one of the
 * others.
 *
 * The element takes no ARIA role of its own. A slotted `<img>` carries its own `alt`, and the
 * initials fallback is plain text in the accessibility tree — an avatar is decorative beside a
 * name far more often than it is the name itself, so labelling it here would mean announcing
 * that name twice.
 *
 * @slot - The avatar's content: an `<img>`/`<picture>`, an `<svg>`, or arbitrary markup. Left
 *   empty, the `name` attribute's initials are shown instead, as the slot's own fallback. A photo
 *   fills the frame and crops; anything else keeps its own size, capped at the frame. Give an
 *   `<svg>` a `width`/`height` — without one it defaults to filling the box, and a rounded shape
 *   will clip its corners.
 * @attr name - The full name, used for the initials fallback (first + last whitespace-separated
 *   token, uppercased) when the slot is empty.
 * @csspart initials - The span that renders the `name` fallback.
 */
@customElement("use-avatar")
export class UseAvatar extends LitElement {
  @property({ type: String, reflect: true })
  name = "";

  get #initials() {
    const tokens = this.name.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return "";
    }
    const first = tokens[0].charAt(0);
    const last = tokens.length > 1 ? tokens[tokens.length - 1].charAt(0) : "";
    return (first + last).toUpperCase();
  }

  render() {
    return html`<slot><span part="initials">${this.#initials}</span></slot>`;
  }

  static styles = css`
    :host {
      container-type: inline-size;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      inline-size: 2.5rem;
      block-size: auto;
      aspect-ratio: 1;
      overflow: hidden;
      background: color-mix(in oklab, currentColor 12%, transparent);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      user-select: none;
    }

    ::slotted(:is(img, picture)) {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }

    ::slotted(svg) {
      max-inline-size: 100%;
      max-block-size: 100%;
    }

    [part="initials"] {
      font-size: 38cqw;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-avatar": UseAvatar;
  }
}

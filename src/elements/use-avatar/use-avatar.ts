import { LitElement, css, html, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * `use-avatar` renders a small, fixed-size, clipped container for a person or entity's
 * likeness. Slot in an `<img>` (or `<picture>`) for a photo, an inline `<svg>` for a
 * generated or stylized mark, or arbitrary markup (a `<div>` of initials, a calendar badge);
 * whatever is slotted is centered and clipped to the avatar's shape. With nothing slotted,
 * `use-avatar` falls back to initials derived from the `name` attribute.
 *
 * ```html
 * <use-avatar><img src="ada.jpg" alt="" /></use-avatar>
 * <use-avatar name="Ada Lovelace"></use-avatar>
 * <use-avatar><svg viewBox="0 0 32 32">…</svg></use-avatar>
 * ```
 *
 * Size and proportions come from custom properties — `--usewc-avatar-size` is the inline size
 * (the font size scales with it) and `--usewc-avatar-ratio` is the aspect ratio (`1` by
 * default) — so an avatar is shaped by setting those on it or an ancestor, not by an
 * attribute. A non-square ratio suits a wide thumbnail or poster; pair it with `shape="square"`
 * since a circle only reads right at `1`.
 *
 * When `name` is set the host is given `role="img"` with `name` as its `aria-label`. A slotted
 * `<img>` should still carry its own `alt` (`alt=""` when `name` already covers it).
 *
 * @slot - The avatar's content: an `<img>`/`<picture>`, an `<svg>`, or arbitrary markup. Left
 *   empty, the `name` attribute's initials are shown instead.
 * @attr name - The full name. Used for the accessible name, and for the initials fallback
 *   (first + last whitespace-separated token, uppercased) when the slot is empty.
 * @attr shape - `"circle"` (default) or `"square"`.
 * @cssprop [--usewc-avatar-size=2.5rem] - The avatar's inline size.
 * @cssprop [--usewc-avatar-ratio=1] - The avatar's aspect ratio (e.g. `16 / 9`).
 * @csspart initials - The span that renders the `name` fallback.
 */
@customElement("use-avatar")
export class UseAvatar extends LitElement {
  @property({ type: String, reflect: true })
  name = "";

  @property({ type: String, reflect: true })
  shape: "circle" | "square" = "circle";

  @state()
  private hasSlottedContent = false;

  get #initials() {
    const tokens = this.name.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return "";
    }
    const first = tokens[0].charAt(0);
    const last = tokens.length > 1 ? tokens[tokens.length - 1].charAt(0) : "";
    return (first + last).toUpperCase();
  }

  firstUpdated() {
    this.#syncSlottedContent();
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has("name")) {
      const label = this.name.trim();
      if (label) {
        this.setAttribute("role", "img");
        this.setAttribute("aria-label", label);
      } else {
        this.removeAttribute("role");
        this.removeAttribute("aria-label");
      }
    }
  }

  #syncSlottedContent = () => {
    const slot = this.renderRoot.querySelector("slot");
    this.hasSlottedContent =
      slot?.assignedNodes().some((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return true;
        }
        return (node.textContent ?? "").trim().length > 0;
      }) ?? false;
  };

  render() {
    return html`<slot @slotchange=${this.#syncSlottedContent}></slot>${this.hasSlottedContent ||
      !this.#initials
        ? nothing
        : html`<span part="initials" aria-hidden="true">${this.#initials}</span>`}`;
  }

  static styles = css`
    :host {
      --usewc-avatar-size: 2.5rem;
      --usewc-avatar-ratio: 1;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      inline-size: var(--usewc-avatar-size);
      block-size: auto;
      aspect-ratio: var(--usewc-avatar-ratio);
      overflow: hidden;
      border-radius: 9999px;
      background: color-mix(in oklab, currentColor 12%, transparent);
      font-size: calc(var(--usewc-avatar-size) * 0.38);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      user-select: none;
    }

    :host([shape="square"]) {
      border-radius: 0.375rem;
    }

    ::slotted(:is(img, picture, svg)) {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-avatar": UseAvatar;
  }
}

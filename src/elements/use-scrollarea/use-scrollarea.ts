import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * A scroll container that exposes custom states for scroll edge detection.
 *
 * ## Custom States
 * The following CSS custom states are available for styling:
 *
 * - `:state(at-block-start)` — scrolled to the block-start edge (top in horizontal writing modes)
 * - `:state(at-block-end)` — scrolled to the block-end edge (bottom in horizontal writing modes)
 * - `:state(at-inline-start)` — scrolled to the inline-start edge (left in LTR)
 * - `:state(at-inline-end)` — scrolled to the inline-end edge (right in LTR)
 *
 * @slot - Scrollable content
 */
@customElement("use-scrollarea")
export class UseScrollarea extends LitElement {
  #internals: ElementInternals;
  #resizeObserver: ResizeObserver | null = null;
  #mutationObserver: MutationObserver | null = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#resizeObserver = new ResizeObserver(this.#updateScrollStates);
    this.#resizeObserver.observe(this);
    this.#mutationObserver = new MutationObserver(this.#updateScrollStates);
    this.#mutationObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.removeEventListener("scroll", this.#onScroll);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.#updateScrollStates();
  }

  #onScroll = () => {
    this.#updateScrollStates();
  };

  #updateScrollStates = () => {
    const atBlockStart = this.scrollTop <= 0;
    const atBlockEnd = Math.abs(this.scrollHeight - this.scrollTop - this.clientHeight) < 1;
    const absScrollLeft = Math.abs(this.scrollLeft);
    const atInlineStart = absScrollLeft <= 0;
    const atInlineEnd = Math.abs(absScrollLeft + this.clientWidth - this.scrollWidth) < 1;

    this.#internals.states[atBlockStart ? "add" : "delete"]("at-block-start");
    this.#internals.states[atBlockEnd ? "add" : "delete"]("at-block-end");
    this.#internals.states[atInlineStart ? "add" : "delete"]("at-inline-start");
    this.#internals.states[atInlineEnd ? "add" : "delete"]("at-inline-end");
  };

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-scrollarea": UseScrollarea;
  }
}

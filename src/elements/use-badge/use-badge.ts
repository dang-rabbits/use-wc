import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import createId from "../../utils/create-id";
import { AnchorController } from "../../utils/anchor-controller";

/**
 * `use-badge` renders a small indicator anchored to another element's corner, using
 * [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
 * instead of the classic `position: absolute` + negative-offset trick. This lets the badge live
 * anywhere in the DOM rather than being a child of the element it decorates. A badge's shape,
 * color, and positioning ship built in — reading from the design system's tokens when
 * `tokens.css` is loaded, and falling back to sensible defaults otherwise — so no theme is
 * required to get a working, visible badge.
 *
 * Point a badge at its target with the `anchortarget` attribute, set to the target's `id`
 * (named to avoid colliding with the `anchor` content attribute HTML is gaining natively):
 *
 * ```html
 * <button type="button" id="inbox">Inbox</button>
 * <use-badge anchortarget="inbox">99+</use-badge>
 * ```
 *
 * The badge and its anchor must live in the same DOM tree — a badge cannot reach an anchor
 * inside another component's shadow root, and an anchor's `anchor-name` set inside a shadow
 * tree's stylesheet is not visible here. No positioned ancestor or shared containing block is
 * required: anchor positioning resolves the badge's location straight from the anchor's own
 * geometry, so the badge can sit anywhere else in the DOM tree.
 *
 * Without a resolved anchor — `anchortarget` unset, pointing at a missing id, or `anchorElement`
 * never assigned — the badge has no `:state(anchored)` and renders as a plain inline chip in
 * normal document flow, still using the same color/shape styling.
 *
 * Some components render their host as `display: contents`, which has no box of its own for CSS
 * anchor positioning to resolve against. If the anchor computes a non-empty `--usewc-anchor-name`
 * custom property, the badge uses that dashed-ident as its `position-anchor` directly instead of
 * generating and writing its own onto the anchor — letting a component publish the name of a
 * real, box-generating part of itself (already established for its own purposes) for badges to
 * target instead of its host, even though that part lives inside the component's own shadow root.
 * This mechanism is shared with `use-menu`/`use-anchored` via `AnchorController`; components
 * without a `display: contents` host don't need to publish anything.
 *
 * **Known Firefox limitation:** anchoring across a shadow root boundary this way — the case
 * `--usewc-anchor-name` exists for — is mispositioned in Firefox as of this writing. Verified
 * directly: `anchor()`'s logical `start`/`end` keywords resolve backwards on both axes
 * specifically for a cross-shadow-root anchor reference, in Firefox only — the same anchor()
 * calls resolve correctly for a same-tree anchor in Firefox, and cross-shadow anchoring resolves
 * correctly in Chromium and Safari. A badge anchored to a plain element (button, input, anything
 * that isn't itself relying on this escape hatch) is unaffected in every engine, including
 * Firefox.
 *
 * ## Side effects
 *
 * The badge is a sibling of its anchor rather than a child, so **as a side effect, a badge
 * mutates its anchor element**: it appends its own id to the anchor's `aria-describedby`
 * (preserving any ids already there, the same way `anchor-name` is appended rather than
 * replaced) to keep its content connected to the anchor for assistive technology. This means a
 * badge's content, or its `aria-label` when set, is announced as part of interacting with the
 * anchor, e.g. "Inbox button, 3". A `dot` badge has no content of its own, so set `aria-label`
 * directly on `<use-badge>` for a meaningful description (e.g. `aria-label="3 unread messages"`);
 * without one, the description contributes nothing and the anchor announces as before.
 *
 * Avoid adding `aria-hidden` to `<use-badge>` if you rely on this: while the description
 * computation is specified to still read a hidden node when it's the direct target of
 * `aria-describedby`, support for that specific case is inconsistent across browsers and screen
 * readers.
 *
 * Set `options="noaria"` to opt a badge out of this and leave the anchor's `aria-describedby`
 * untouched, e.g. when the anchor already documents the badge's meaning some other way.
 *
 * @slot - Badge content, e.g. a count or short label. Ignored when `dot` is set.
 * @state anchored `use-badge:state(anchored)`: Set once the badge has a resolved anchor element;
 * this is what switches the badge from normal-flow to anchor-positioned.
 * @attr anchortarget - Id of the element to anchor to, resolved in the badge's own tree.
 * @attr dot - Renders as a fixed-size dot instead of the slotted content.
 * @attr blockalign `"start" | "end"`: Aligns the badge along the block axis relative to its anchor.
 * @attr inlinealign `"start" | "end"`: Aligns the badge along the inline axis relative to its anchor.
 * @attr options - Space-separated feature flags. `noaria` opts out of the automatic
 * `aria-describedby` wiring described above.
 */
@customElement("use-badge")
export class UseBadge extends LitElement {
  #internals: ElementInternals;
  #anchorController: AnchorController;

  @property({ type: String, reflect: true })
  anchortarget?: string;

  @property({ type: Boolean, reflect: true })
  dot = false;

  @property({ type: String, reflect: true })
  blockalign: "start" | "end" = "start";

  @property({ type: String, reflect: true })
  inlinealign: "start" | "end" = "end";

  @property({ type: String, reflect: true })
  options = "";

  get #noAria() {
    return this.options.split(/\s+/).includes("noaria");
  }

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#anchorController = new AnchorController(this, this.#internals, "--usewc-badge");

    if (!this.id) {
      this.id = createId();
    }
  }

  /**
   * The element this badge is anchored to. Reading returns whatever element was last resolved,
   * either from the `anchortarget` id or set here directly. Setting it anchors to that element
   * instead of resolving `anchortarget`, for cases where the target has no id to reference.
   */
  get anchorElement() {
    return this.#anchorController.anchorElement;
  }

  set anchorElement(element: Element | null) {
    const previousAnchor = this.#anchorController.anchorElement;
    this.#detachDescribedBy(previousAnchor);
    this.#anchorController.anchorElement = element;
    this.#attachDescribedBy(this.#anchorController.anchorElement);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#resolveAnchor();
  }

  disconnectedCallback() {
    this.#detachDescribedBy(this.#anchorController.anchorElement);
    super.disconnectedCallback();
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has("anchortarget")) {
      this.#resolveAnchor();
    } else if (changed.has("options")) {
      if (this.#noAria) {
        this.#detachDescribedBy(this.#anchorController.anchorElement);
      } else {
        this.#attachDescribedBy(this.#anchorController.anchorElement);
      }
    }
  }

  #resolveAnchor() {
    const previousAnchor = this.#anchorController.anchorElement;
    this.#detachDescribedBy(previousAnchor);
    this.#anchorController.resolve(this.anchortarget);
    this.#attachDescribedBy(this.#anchorController.anchorElement);
  }

  #attachDescribedBy(anchorElement: Element | null) {
    if (!(anchorElement instanceof HTMLElement) || this.#noAria) {
      return;
    }

    const describedByIds = (anchorElement.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean);
    if (!describedByIds.includes(this.id)) {
      describedByIds.push(this.id);
      anchorElement.setAttribute("aria-describedby", describedByIds.join(" "));
    }
  }

  #detachDescribedBy(anchorElement: Element | null) {
    if (!(anchorElement instanceof HTMLElement)) {
      return;
    }

    const describedByIds = (anchorElement.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id) => id && id !== this.id);
    if (describedByIds.length > 0) {
      anchorElement.setAttribute("aria-describedby", describedByIds.join(" "));
    } else {
      anchorElement.removeAttribute("aria-describedby");
    }
  }

  render() {
    return this.dot ? null : html`<slot></slot>`;
  }

  /* These are fixed, literal defaults — never design tokens. Tokens belong to theme.css, an
     opt-in layer that overrides the token-driven parts of this look by targeting `use-badge`
     from the outside; the component itself doesn't know the token system exists.

     A content badge is at least as wide as it is tall — `block-size: 1lh` fixes the height to
     one line so a longer count can't grow it, `min-inline-size: 1lh` makes a single-glyph badge
     a circle, and a longer count grows the width out into a pill while the height holds.
     `tabular-nums` keeps every digit the same advance width, so `1` and `8`, or `11` and `88`,
     are identical in size.

     Without a resolved anchor (:state(anchored) unset) the badge is a plain inline chip in
     normal flow, so it never needs an anchor to look reasonable.

     Once anchored, the badge pins to its anchor's corner and extends outward past it by
     --_badge-offset: half a line height for content badges, and a third of the dot's size for
     dots. The inline axis uses anchor(self-start|self-end) rather than anchor(start|end),
     because the latter take their direction from the badge's containing block (usually the LTR
     document root), not from the badge itself.

     The default corner is set in the base anchored rule and each alignment override is a plain
     attribute selector rather than an :is()/:not() compound, because at least one browser has
     been observed to mis-resolve which same-property declaration wins with compound selectors. */
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding-inline: 0.25em;
      border-radius: 9999px;
      background: CanvasText;
      border: 1px solid currentColor;
      color: Canvas;
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1.5;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    :host(:not([dot])) {
      --_badge-offset: 0.5lh;
      block-size: 1lh;
      min-inline-size: 1lh;
    }

    :host([dot]) {
      --_badge-offset: calc(0.5rem / 3);
      inline-size: 0.5rem;
      block-size: 0.5rem;
      min-inline-size: 0;
      min-block-size: 0;
      padding-inline: 0;
    }

    :host(:state(anchored)) {
      position: absolute;
      inset-inline-end: calc(anchor(self-end) - var(--_badge-offset));
      inset-block-start: calc(anchor(start) - var(--_badge-offset));
    }

    :host(:state(anchored)[inlinealign="start"]) {
      inset-inline-end: unset;
      inset-inline-start: calc(anchor(self-start) - var(--_badge-offset));
    }

    :host(:state(anchored)[blockalign="end"]) {
      inset-block-start: unset;
      inset-block-end: calc(anchor(end) - var(--_badge-offset));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-badge": UseBadge;
  }
}

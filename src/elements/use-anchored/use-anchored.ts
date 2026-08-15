import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AnchorController } from "../../utils/anchor-controller";
import { anchorPositioningStyles } from "../../utils/anchor-positioning-styles";

/**
 * `use-anchored` positions a single piece of dev-authored popover or dialog content relative to
 * another element on the page, using CSS anchor positioning. It doesn't render or manage the
 * popover or dialog itself — bring your own `<dialog>` or `[popover]` element as its one child,
 * and `use-anchored` handles the `anchor-name`/`position-anchor` plumbing and flip fallbacks:
 *
 * ```html
 * <button id="opener" popovertarget="thing">Open</button>
 * <use-anchored target="opener">
 *   <div id="thing" popover>Content</div>
 * </use-anchored>
 * ```
 *
 * `target`, an id resolved in `use-anchored`'s own root, is required — there's no invoker
 * discovery or single-invoker fallback here, unlike `use-menu`. Point it at whichever element
 * the anchored content should track.
 *
 * The wrapped element is resolved once, from `use-anchored`'s first element child, when
 * `use-anchored` connects to the DOM — it must already exist in the document by then, the same
 * assumption `use-menu` makes about its invokers.
 *
 * The positioning rules only apply while the wrapped element is open —
 * `::slotted(:is([open], :popover-open))`, matching both a `<dialog open>` and a `[popover]`
 * element while showing — so this works the same whether the wrapped element opens via
 * `dialog.show()`/`showModal()` or the Popover API's `showPopover()`.
 *
 * @slot default - A single `<dialog>` or `[popover]` element to position. Only the first element
 * child is anchored; anything after it is ignored.
 * @attr target - Id of the element to anchor to, resolved in use-anchored's own tree.
 * @attr anchoralign `"<block> <inline>"`, each `"start" | "end"`: Aligns the wrapped element
 * relative to its anchor. Defaults to `"end start"` — below the anchor, inline-start edges
 * aligned.
 */
@customElement("use-anchored")
export class UseAnchored extends LitElement {
  #internals: ElementInternals;
  #anchorController: AnchorController | null = null;

  @property({ type: String, reflect: true })
  target?: string;

  @property({ type: String, reflect: true })
  anchoralign: string = "end start";

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();

    const positionedElement = this.firstElementChild;
    if (positionedElement instanceof HTMLElement) {
      this.#anchorController = new AnchorController(
        this,
        this.#internals,
        "--usewc-anchored",
        positionedElement,
      );
      this.#anchorController.resolve(this.target);
    }
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has("target")) {
      this.#anchorController?.resolve(this.target);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: contents;
    }

    ${anchorPositioningStyles("", " ::slotted(:is([open], :popover-open))")}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-anchored": UseAnchored;
  }
}

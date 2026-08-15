import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import createId from "../../utils/create-id";
import { AnchorController } from "../../utils/anchor-controller";
import { anchorPositioningStyles } from "../../utils/anchor-positioning-styles";
import { getTabIndex } from "tabbable";

const INITIAL_TABINDEX_ATTR = "data-usewc-menu-tabindex";

const TABBABLE_SELECTOR = `
  :is(
    [role="menuitem"],
    [role="menuitemcheckbox"],
    [role="menuitemradio"]
  ):not(:is(
    [disabled],
    [hidden],
    [inert],
    [aria-hidden="true"]
  ))
`;

/**
 * The first tabbable element is focused when the menu gains focus.
 *
 * Menu is not used for navigation, it is intended for related action items that
 * allows a user to manipulate a user interface or content.
 *
 * The following selector is used to find tabbable elements:
 *
 * ```css
 * :is(
 *   [role="menuitem"],
 *   [role="menuitemcheckbox"],
 *   [role="menuitemradio"]
 * ):not(:is(
 *   [disabled],
 *   [hidden],
 *   [inert],
 *   [aria-hidden="true"]
 * ))
 * ```
 *
 * A menu can be opened one of two ways:
 *
 * 1. **Anchored to an invoker**: point one or more `[popovertarget]` invokers at the menu's
 *    `id`, and `use-menu` applies `popover="auto"` itself, discovers the invokers, wires up
 *    `aria-haspopup`/`aria-expanded`, and anchors the open menu to whichever invoker actually
 *    opened it, using CSS anchor positioning — a stand-in until `referenceTarget` ships. This is
 *    always on, with a single invoker or many, no `anchortarget` needed:
 *
 *    ```html
 *    <button id="thing" popovertarget="thing-menu">
 *      <use-caret>Menu</use-caret>
 *    </button>
 *    <use-menu id="thing-menu" aria-label="Menu">
 *      <button role="menuitem">First thing</button>
 *    </use-menu>
 *    ```
 *
 *    A submenu is the same shape, nested: a `[role="menuitem"]` invoker inside the parent menu,
 *    and its `use-menu` living alongside it as a sibling in the parent's slotted content — this
 *    is what keeps the submenu indexed for the parent's own keyboard navigation.
 *
 *    `anchortarget`, set to an element's id (named to avoid colliding with the `anchor` content
 *    attribute HTML is gaining natively), overrides that default — use it to pin the menu to a
 *    specific element regardless of which invoker opened it, or to anchor to something that
 *    isn't an invoker at all:
 *
 *    ```html
 *    <button popovertarget="shared-menu">Left</button>
 *    <button id="pinned" popovertarget="shared-menu">Middle (anchor)</button>
 *    <button popovertarget="shared-menu">Right</button>
 *    <use-menu id="shared-menu" aria-label="Menu" anchortarget="pinned">
 *      <button role="menuitem">First thing</button>
 *    </use-menu>
 *    ```
 *
 * 2. **Standalone popover**: set `popover` on `<use-menu>` yourself — needed only when there's no
 *    `[popovertarget]` invoker anywhere for `use-menu` to discover, e.g. opening it from plain JS
 *    (`menu.showPopover()`). Setting `popover` by hand in the invoker case above is redundant,
 *    not wrong — auto-apply skips the attribute it finds already set, so both can coexist. With
 *    no invoker to anchor to, `use-menu` falls back to whatever element sits directly before it
 *    in markup — keep the trigger-then-menu adjacency every invoker-based usage already follows,
 *    or set `anchortarget` for anything else.
 *
 * Invokers are discovered once, when the menu connects to the DOM — they must already exist in
 * the document by then. An invoker's id must be set for `[popovertarget]` to resolve it, and
 * the menu assigns itself an id automatically if one isn't already set.
 *
 * @slot default
 * @state nested `use-menu:state(nested)`: Set when the menu's invoker is itself a menu item
 * inside a parent `use-menu` — a submenu. Themed to open to the side of its trigger instead of
 * below it, and ArrowLeft closes it and returns focus to the parent item.
 * @attr anchortarget - Id of the element to anchor to, resolved in the menu's own tree. Falls
 * back to whichever discovered invoker opened the menu, or the menu's previous sibling when
 * there's no invoker at all, when unset.
 * @attr anchoralign `"<block> <inline>"`, each `"start" | "end"`: Aligns the menu relative to
 * its anchor. Defaults to `"end start"` — below the anchor, inline-start edges aligned.
 */
@customElement("use-menu")
export class UseMenu extends LitElement {
  #tabbables: HTMLElement[] = [];

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #id: string;
  #internals: ElementInternals;
  #itemLabels: string[] = [];
  #invokers: HTMLElement[] = [];
  #activeInvoker: HTMLElement | null = null;
  #anchorController: AnchorController;
  trigger: HTMLButtonElement | null = null;

  @property({ type: Boolean, reflect: true })
  set disabled(flag) {
    this.#initializeDisabled(flag);
  }

  get disabled() {
    return this.#internals.states.has("disabled");
  }

  @property()
  label!: string;

  @property({ type: String, reflect: true })
  anchortarget?: string;

  @property({ type: String, reflect: true })
  anchoralign: string = "end start";

  constructor() {
    super();
    this.#id = createId();
    this.#internals = this.attachInternals();
    this.#anchorController = new AnchorController(this, this.#internals, "--usewc-menu");
    this.#initializeTabbables();

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  getId() {
    return this.id ? this.id : this.#id;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.id) {
      this.id = this.#id;
    }

    this.#discoverInvokers();

    if (!this.hasAttribute("popover") && (this.anchortarget || this.#invokers.length > 0)) {
      this.setAttribute("popover", "auto");
    }

    this.#anchorController.anchorElement = this.#resolveAnchorElement();
    this.addEventListener("toggle", this.#handleToggle as EventListener);
    this.addEventListener("keydown", this.#handleMenuKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener("toggle", this.#handleToggle as EventListener);
    this.removeEventListener("keydown", this.#handleMenuKeyDown);
    this.#detachInvokers();
    super.disconnectedCallback();
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has("anchortarget")) {
      this.#anchorController.anchorElement = this.#resolveAnchorElement();
    }
  }

  #resolveAnchorElement(): Element | null {
    if (this.anchortarget) {
      const root = this.getRootNode() as Document | ShadowRoot;
      return root.getElementById(this.anchortarget);
    }

    const invoker = this.#activeInvoker ?? this.#invokers[0];
    if (invoker) {
      return invoker;
    }

    // No [popovertarget] invoker was ever discovered — a plain-JS showPopover() caller, most
    // likely — so fall back to whatever sits directly before the menu in markup, the same
    // trigger-then-menu adjacency every invoker-based usage already follows.
    return this.previousElementSibling;
  }

  #findInvokers() {
    const root = this.getRootNode() as Document | ShadowRoot;
    return Array.from(root.querySelectorAll<HTMLElement>(`[popovertarget="${this.getId()}"]`));
  }

  #discoverInvokers() {
    this.#detachInvokers();
    this.#invokers = this.#findInvokers();
    this.trigger = (this.#invokers[0] as HTMLButtonElement) ?? null;

    this.#invokers.forEach((invoker) => {
      // The sole-invoker anchor fallback in #resolveAnchorTargetId() needs a real id to resolve
      // against — an unset id reads back as "", which AnchorController#resolve() treats the same
      // as no target at all, silently leaving the menu unanchored.
      if (!invoker.id) {
        invoker.id = createId();
      }

      invoker.setAttribute("aria-haspopup", "menu");
      invoker.setAttribute("aria-expanded", "false");
      invoker.setAttribute("aria-controls", this.getId());
      invoker.addEventListener("click", this.#handleInvokerActivate);
      invoker.addEventListener("keydown", this.#handleInvokerKeyDown);
    });

    if (this.#invokers.some((invoker) => this.#isNestedInvoker(invoker))) {
      this.#internals.states.add("nested");
    } else {
      this.#internals.states.delete("nested");
    }
  }

  #detachInvokers() {
    this.#invokers.forEach((invoker) => {
      invoker.removeEventListener("click", this.#handleInvokerActivate);
      invoker.removeEventListener("keydown", this.#handleInvokerKeyDown);
    });
  }

  #handleInvokerActivate = (event: Event) => {
    this.#activeInvoker = event.currentTarget as HTMLElement;
    this.#anchorController.anchorElement = this.#resolveAnchorElement();
  };

  #isNestedInvoker(invoker: HTMLElement) {
    return invoker.closest("use-menu") != null;
  }

  #handleInvokerKeyDown = (event: KeyboardEvent) => {
    const invoker = event.currentTarget as HTMLElement;
    const isNested = this.#isNestedInvoker(invoker);
    const opensKeys = isNested ? ["ArrowRight", "Enter", " "] : ["ArrowDown", "ArrowUp"];

    if (!this.matches(":popover-open") && opensKeys.includes(event.key)) {
      event.preventDefault();
      this.#activeInvoker = invoker;
      this.#anchorController.anchorElement = this.#resolveAnchorElement();
      this.showPopover();
    }
  };

  #findTabbables() {
    return Array.from(this.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter((element) => {
      return element.parentElement?.closest("use-menu") === this;
    });
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus || element.getAttribute("tabindex") === null) {
      return null;
    }

    return String(getTabIndex(element));
  }

  #initializeTabbables() {
    this.#tabbables = this.#findTabbables();
    this.#itemLabels = [];
    const active =
      this.#tabbables.find((element) => element.matches("[aria-current]")) ?? this.#tabbables[0];

    this.#tabbables.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && Boolean(text)) {
        this.#itemLabels[index] = text;
      }

      const tabindex = this.#getTabIndex(element);
      if (tabindex != null) {
        element.setAttribute(INITIAL_TABINDEX_ATTR, tabindex);
      }

      if (element !== active) {
        element.setAttribute("tabindex", "-1");
      }
    });
  }

  async #initializeDisabled(disabled: boolean) {
    await this.updateComplete;

    if (disabled) {
      this.#internals.states.add("disabled");
      this.#invokers.forEach((invoker) => invoker.setAttribute("disabled", "disabled"));
    } else {
      this.#internals.states.delete("disabled");
      this.#invokers.forEach((invoker) => invoker.removeAttribute("disabled"));
    }
  }

  #handleToggle = (event: ToggleEvent) => {
    const opening = event.newState === "open";

    this.#invokers.forEach((invoker) => {
      invoker.ariaExpanded = opening ? "true" : "false";
    });

    if (opening) {
      this.#tabbables[0]?.focus();
    } else {
      this.#activeInvoker?.focus();
      this.#activeInvoker = null;
    }
  };

  #handlePopoverClick(event: Event) {
    if (!this.hasAttribute("popover")) {
      return;
    }

    const target = event.target as HTMLElement;
    const nearestMenu = target.closest("use-menu");

    if (nearestMenu != null && nearestMenu !== this) {
      return;
    }

    if (target.closest("[menu-item~='keep-open']")) {
      return;
    }

    // A submenu invoker is a menuitem in this menu that opens its own nested use-menu via
    // [popovertarget]. Clicking it should behave like menu-item="keep-open" — it opens the
    // submenu, it doesn't close this one — otherwise this same click handler, bubbling up from
    // the invoker (or from something inside it, like use-caret), closes the parent menu out from
    // under the submenu it just opened.
    const invoker = target.closest("[popovertarget]");
    if (invoker && this.contains(invoker)) {
      return;
    }

    this.hidePopover();
  }

  #handleMenuKeyDown = (event: KeyboardEvent) => {
    const isPopover = this.hasAttribute("popover");
    const isNested = this.#internals.states.has("nested");

    if (isPopover && isNested && event.key === "ArrowLeft") {
      this.hidePopover();
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const options = this.#tabbables;
    const activeIndex = options.findIndex((option) => option === document.activeElement);

    let moveTo: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        if (activeIndex > 0) {
          moveTo = options.at(activeIndex - 1);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(activeIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        event.stopPropagation();
        moveTo = options[0];
        break;
      case "End":
        event.preventDefault();
        event.stopPropagation();
        moveTo = options[options.length - 1];
        break;
      case "Tab":
        if (isPopover) {
          this.hidePopover();
        }
        break;
      case "Escape":
        event.stopPropagation();
        if (isPopover) {
          this.#activeInvoker?.focus();
        }
        break;
    }

    // TODO improve this to handle multiple items with the same first letter
    if (!moveTo && event.key.match(/^[\w\d]$/)) {
      const index = this.#itemLabels.findIndex((label) =>
        label.toLowerCase().startsWith(event.key.toLowerCase()),
      );
      if (index > -1) {
        moveTo = options[index];
      }
    }

    if (moveTo) {
      moveTo.focus();
      moveTo.setAttribute("tabindex", "0");
      options[activeIndex]?.setAttribute("tabindex", "-1");
    }
  };

  #handleSlotChange() {
    this.#initializeTabbables();
  }

  render() {
    return html`
      <div role="menu" part="menu" @click=${this.#handlePopoverClick}>
        <slot @slotchange=${this.#handleSlotChange}></slot>
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
    :host(:state(disabled)) {
      pointer-events: none;
    }

    ${anchorPositioningStyles(":popover-open")}

    :host(:popover-open) [part="menu"] {
      display: flex;
      flex-direction: column;
      justify-items: stretch;
    }

    ::slotted(hr) {
      margin-inline: 0;
    }

    ::slotted([role="group"]) {
      display: contents;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-menu": UseMenu;
  }
}

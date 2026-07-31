import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import createId from "../../utils/create-id";
import { getTabIndex } from "tabbable";

const INITIAL_TABINDEX_ATTR = "data-usewc-dropdown-tabindex";

const TABBABLE_SELECTOR = `
  :is(
    [role="menuitem"],
    [role="menuitemcheckbox"],
    [role="menuitemradio"],
    use-dropdown
  ):not(:is(
    [disabled],
    [hidden],
    [inert],
    [aria-hidden="true"]
  ))
`;

/**
 * When the popover is opened the tabbable elements are found and indexed for
 * keyboard navigation. The first tabbable element is focused when the popover is opened. The
 * following selector is used to find tabbable elements:
 *
 * ```css
 * :is(
 *   [role="menuitem"],
 *   [role="menuitemcheckbox"],
 *   [role="menuitemradio"],
 *   use-menu
 * ):not(:is(
 *   [disabled],
 *   [hidden],
 *   [inert],
 *   [aria-hidden="true"]
 * ))
 * ```
 *
 * Menu items are not used for navigation, they are intended for related action
 * items that allows a user to manipulate a user interface or content. Read the
 * WCAG guidance for more details:
 * [https://www.w3.org/WAI/ARIA/apg/patterns/menubar/](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
 *
 * For an icon-only trigger, omit `label` and set `aria-label` on `use-dropdown` itself — it is
 * forwarded to the trigger button so the control still has an accessible name.
 *
 * @slot default
 * @slot trigger-content
 * @slot trigger-label
 * @slot trigger-arrow
 *
 * @state open `use-dropdown:state(open)`: The open state of the dropdown.
 */
@customElement("use-dropdown")
export class UseDropdown extends LitElement {
  #tabbables: HTMLElement[] = [];

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #id: string;
  #internals: ElementInternals;
  #itemLabels: string[] = [];
  #isNested = this.parentElement?.closest("use-dropdown") != null;
  trigger: HTMLButtonElement | null = null;

  @property({ type: Boolean })
  set disabled(flag) {
    this.#initializeDisabled(flag);
  }

  get disabled() {
    return this.#internals.states.has("disabled");
  }

  @property()
  label!: string;

  constructor() {
    super();
    this.#id = createId();
    this.#internals = this.attachInternals();
    this.#initializeTabbables();

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  getId() {
    return this.id ? this.id : this.#id;
  }

  get #triggerId() {
    return `${this.getId()}-trigger`;
  }

  get #popoverId() {
    return `${this.getId()}-dropdown`;
  }

  get #triggerAriaLabel() {
    return this.getAttribute("aria-label") ?? undefined;
  }

  #findTabbables() {
    return Array.from(this.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter((element) => {
      return element.parentElement?.closest("use-dropdown") === this;
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

    this.#tabbables.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && Boolean(text)) {
        this.#itemLabels[index] = text;
      }

      const tabindex = this.#getTabIndex(element);
      if (tabindex != null) {
        element.setAttribute(INITIAL_TABINDEX_ATTR, tabindex);
      }
      element.setAttribute("tabindex", "-1");
    });
  }

  #handlePopoverClick(event: Event) {
    const target = event.target as HTMLElement;
    const nearestDropdown = target.closest("use-dropdown");

    if (nearestDropdown != null && nearestDropdown !== this) {
      return;
    }

    if (target.getAttribute("menu-item")?.includes("keep-open")) {
      return;
    }

    this.#closePopover();
  }

  #closePopover(returnFocus = true) {
    (this.trigger?.popoverTargetElement as HTMLElement)?.hidePopover();

    if (returnFocus) {
      this.trigger?.focus();
    }
  }

  async #initializeDisabled(disabled: boolean) {
    await this.updateComplete;

    if (disabled) {
      this.#internals.states.add("disabled");
      this.trigger?.setAttribute("disabled", "disabled");
    } else {
      this.#internals.states.delete("disabled");
      this.trigger?.removeAttribute("disabled");
    }

    if (this.trigger) {
      this.trigger.disabled = disabled;
    }
  }

  firstUpdated() {
    this.trigger = this.shadowRoot?.querySelector('button[part="trigger"]') ?? null;
  }

  #getPopoverOpen() {
    return this.trigger?.popoverTargetElement?.matches(":popover-open");
  }

  #handleKeyDown(event: KeyboardEvent) {
    const isOpen = this.#getPopoverOpen();

    if (!isOpen && !this.#isNested && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const popoverElement = this.trigger?.popoverTargetElement;
      if (popoverElement instanceof HTMLElement) {
        popoverElement.showPopover();
      }
      return;
    }

    if (
      !isOpen &&
      this.#isNested &&
      ["ArrowRight", "ArrowLeft", "Enter", " "].includes(event.key)
    ) {
      event.preventDefault();
      const popoverElement = this.trigger?.popoverTargetElement;
      if (popoverElement instanceof HTMLElement) {
        popoverElement.showPopover();
      }
      return;
    }

    if (!isOpen) {
      return;
    }

    if (isOpen && this.#isNested && event.key === "ArrowLeft") {
      this.#closePopover();
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
      case "Tab": {
        const popoverElement = this.trigger?.popoverTargetElement;
        if (popoverElement instanceof HTMLElement) {
          popoverElement.hidePopover();
        }
        break;
      }
      case "Escape":
        event.stopPropagation();
        this.trigger?.focus();
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

    moveTo?.focus();
  }

  #handlePopoverToggle(event: ToggleEvent) {
    const opening = event.newState === "open";

    if (this.trigger) {
      this.trigger.ariaExpanded = opening ? "true" : "false";
    }

    if (opening) {
      this.#tabbables[0]?.focus();
      this.#internals.states.add("open");
    } else {
      this.#internals.states.delete("open");
    }
  }

  #handleSlotChange() {
    this.#initializeTabbables();
  }

  get #triggerIconText() {
    return this.#isNested ? "▶" : "▼";
  }

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        id=${this.#triggerId}
        popovertarget=${this.#popoverId}
        popovertargetaction="toggle"
        aria-controls=${this.#popoverId}
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label=${ifDefined(this.#triggerAriaLabel)}
        ?disabled=${this.disabled}
        @keydown=${this.#handleKeyDown}
      >
        <slot name="trigger-content">
          <slot part="trigger-label" name="trigger-label">${this.label}</slot>
          <slot part="trigger-icon" name="trigger-icon">
            <span part="trigger-icon-default" aria-hidden="true">${this.#triggerIconText}</span>
          </slot>
        </slot>
      </button>
      <div
        id=${this.#popoverId}
        role="menu"
        part="menu"
        popover
        aria-labelledby=${this.#triggerId}
        @click=${this.#handlePopoverClick}
        @toggle=${this.#handlePopoverToggle}
        @keydown=${this.#handleKeyDown}
      >
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

    [part="menu"]:popover-open {
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
    "use-dropdown": UseDropdown;
  }
}

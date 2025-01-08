import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import createId from '../../utils/create-id';
import { getTabIndex, isTabbable } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'data-usewc-dropdown-tabindex';

// TODO typeahead
// TODO HOME / END keys
// TODO checkboxes https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/
// TODO radio https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/

/**
 * This component provides a generic dropdown menu. The popover portion can contain `button`s, links (`a`), horizontal rulers (`hr`), or nested `use-dropdown` elements.
 *
 * @slot default
 * @slot trigger-label
 * @slot trigger-arrow
 */
@customElement('use-dropdown')
export class UseDropdown extends LitElement {
  #tabbables: HTMLElement[] = [];

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #id: string;
  #internals: ElementInternals;

  @property({ type: Boolean })
  set disabled(flag) {
    this.#initializeDisabled(flag);
  }

  get disabled() {
    return this.#internals.states.has("disabled");
  }

  trigger: HTMLButtonElement | null = null;

  @property()
  label!: string;

  constructor() {
    super();
    this.#id = createId();
    this.#internals = this.attachInternals();

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

  #findTabbables() {
    const walker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (node instanceof HTMLElement && (isTabbable(node) || node.shadowRoot?.delegatesFocus)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    });

    const elements = [];

    while (walker.nextNode()) {
      elements.push(walker.currentNode);
    }

    return elements as HTMLElement[];
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus && element.getAttribute('tabindex') === null) {
      return '0';
    }

    return String(getTabIndex(element));
  }

  #initializeTabbables() {
    this.#tabbables = this.#findTabbables();

    this.#tabbables.forEach((element) => {
      element.setAttribute(INITIAL_TABINDEX_ATTR, this.#getTabIndex(element));
      element.setAttribute('tabindex', '-1');
    });
  }

  #resetTabbables() {
    this.#tabbables.forEach((element) => {
      const initialTabIndex = element.getAttribute(INITIAL_TABINDEX_ATTR);
      if (initialTabIndex !== null) {
        element.setAttribute('tabindex', initialTabIndex);
      } else {
        element.removeAttribute('tabindex');
      }
      element.removeAttribute(INITIAL_TABINDEX_ATTR);
    });
  }

  #handlePopoverClick(event: Event) {
    if (event.target instanceof UseDropdown && event.target !== this) {
      return;
    }

    (this.trigger?.popoverTargetElement as HTMLElement).hidePopover();
  }

  async #initializeDisabled(disabled: boolean) {
    await this.updateComplete;

    if (disabled) {
      this.#internals.states.add("disabled");
      this.trigger?.setAttribute('disabled', 'disabled');
    } else {
      this.#internals.states.delete("disabled");
      this.trigger?.removeAttribute('disabled');
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

  #isNested() {
    const closest = this.closest('use-dropdown');
    return closest !== null && closest !== this;
  }

  #handleKeyDown(event: KeyboardEvent) {
    const isOpen = this.#getPopoverOpen();
    const isNested = this.#isNested();

    if (!isOpen && !isNested && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      (this.trigger?.popoverTargetElement as HTMLElement).showPopover();
      return;
    }

    if (!isOpen && isNested && ['ArrowRight', 'ArrowLeft', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      (this.trigger?.popoverTargetElement as HTMLElement).showPopover();
      return;
    }

    if (!isOpen) {
      return;
    }

    const options = this.#tabbables;
    const activeIndex = options.findIndex((option) => option === document.activeElement);

    let moveTo: HTMLElement | undefined;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (activeIndex > 0) {
          moveTo = options.at(activeIndex - 1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(activeIndex + 1);
        break;
      case 'Tab':
        (this.trigger?.popoverTargetElement as HTMLElement).hidePopover();
        break;
    }

    moveTo?.focus();
  }

  #handlePopoverToggle(event: ToggleEvent) {
    const opening = event.newState === 'open';

    if (this.trigger) {
      this.trigger.ariaExpanded = opening ? 'true' : 'false';
    }

    if (opening) {
      this.#initializeTabbables();
      this.#tabbables[0]?.focus();
    } else {
      this.#resetTabbables();
      this.trigger?.focus();
    }
  }

  render() {
    return html`
      <button
        part="trigger"
        type="button"
        id=${this.#triggerId}
        popovertarget=${this.#popoverId}
        aria-controls=${this.#popoverId}
        aria-haspopup="listbox"
        aria-expanded="false"
        ?disabled=${this.disabled}
        @keydown=${this.#handleKeyDown}
      >
        <span part="trigger-label">
          <slot name="trigger-label">${this.label}</slot>
        </span>
        <slot part="trigger-arrow" name="trigger-arrow">
          <svg fill="currentColor" part="trigger-arrow-default" aria-hidden>
            <polygon points="4,4 8,0 0,0" />
          </svg>
        </slot>
      </button>
      <div
        id=${this.#popoverId}
        role="menu"
        part="popover"
        popover
        aria-labelledby=${this.#triggerId}
        @click=${this.#handlePopoverClick}
        @toggle=${this.#handlePopoverToggle}
        @keydown=${this.#handleKeyDown}
      >
        <slot></slot>
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
    :host button {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      text-align: start;
    }

    :host button > * {
      display: contents;
    }

    svg[part="trigger-arrow-default"] {
      width: .5rem;
      height: .25rem;
    }

    :host(:state(disabled)) {
      pointer-events: none;
    }

    [part="popover"]:popover-open {
      display: flex;
      flex-direction: column;
      justify-items: stretch;
    }

    [part="popover"] :is(button, use-dropdown, hr) {
      width: 100%;
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
    'use-dropdown': UseDropdown
  }
}

import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import createId from '../../utils/create-id';
import { getTabIndex } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'data-usewc-menu-tabindex';

const TABBABLE_SELECTOR = `
  :is(
    [role="menuitem"],
    [role="menuitemcheckbox"],
    [role="menuitemradio"],
    use-menu
  ):not(:is(
    [disabled],
    [hidden],
    [inert],
    [aria-hidden="true"]
  ))
`;

/**
 * When the popover is opened the tabbable elements are found and indexed for keyboard navigation. The first tabbable element is focused when the popover is opened. The following selector is used to find tabbable elements:
 *
 * ```css
 * :is([role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], use-menu):not([disabled])
 * ```
 *
 * @slot default
 * @slot trigger-content
 * @slot trigger-label
 * @slot trigger-arrow
 *
 * @state open `use-menu:state(open)`: The open state of the dropdown.
 */
@customElement('use-menu')
export class UseMenu extends LitElement {
  #tabbables: HTMLElement[] = [];

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #id: string;
  #internals: ElementInternals;
  #itemLabels: string[] = [];
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

  #findTabbables() {
    return Array.from(this.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter((element) => {
      return element.parentElement?.closest('use-menu') === this;
    });
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus || element.getAttribute('tabindex') === null) {
      return null;
    }

    return String(getTabIndex(element));
  }

  #initializeTabbables() {
    this.#tabbables = this.#findTabbables();
    this.#itemLabels = [];
    const active = this.#tabbables.find((element => element.matches('[aria-current]'))) ?? this.#tabbables[0];

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
        element.setAttribute('tabindex', '-1');
      }
    });
  }

  #handlePopoverClick(event: Event) {
    // TODO
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

  #handleKeyDown(event: KeyboardEvent) {
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
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options[0];
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options[options.length - 1];
        break;
    }

    // TODO improve this to handle multiple items with the same first letter
    if (!moveTo && event.key.match(/^[\w\d]$/)) {
      const index = this.#itemLabels.findIndex((label) => label.toLowerCase().startsWith(event.key.toLowerCase()));
      if (index > -1) {
        moveTo = options[index];
      }
    }

    if (moveTo) {
      moveTo.focus();
      moveTo.setAttribute('tabindex', '0');
      options[activeIndex].setAttribute('tabindex', '-1');
    }
  }

  #handleSlotChange() {
    this.#initializeTabbables();
  }

  render() {
    return html`
      <div
        role="menu"
        part="menu"
        @click=${this.#handlePopoverClick}
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
    'use-menu': UseMenu
  }
}

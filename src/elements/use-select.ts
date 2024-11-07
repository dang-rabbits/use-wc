import { LitElement, css, html } from 'lit'
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js'
import { UseOption } from './use-option';

// TODO disabled https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO valid / invalid https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO readonly https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO mutation

const FORM_DATA_KEY = '__value';

/**
 * An example element.
 *
 * @slot NodeList of `use-option` elements
 * @slot arrow
 */
@customElement('use-select')
export class UseSelect extends LitElement {
  static formAssociated = true;

  #id: string;
  #internals: ElementInternals;
  #value = new FormData();

  @property()
  name?: string;

  @property()
  placeholder: string = '';

  @property({ type: Boolean })
  multiple = false;

  @property({ type: Boolean })
  listbox = false;

  @queryAssignedElements({ selector: 'use-option' })
  options!: Array<UseOption>;

  get selected() {
    return this.options.filter((option) => option.selected);
  }

  get firstSelected() {
    return this.options.find((option) => option.selected);
  }

  @query('button[part="trigger"]')
  trigger!: HTMLButtonElement;

  @query('[part="trigger-label"]')
  label!: HTMLSpanElement;

  constructor() {
    super();
    this.#id = ':' + Math.random().toString(36).substring(2, 6) + ':';
    this.#internals = this.attachInternals();
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

  #handlePopoverClick(event: Event) {
    const selectOption = (event.target as HTMLElement)?.closest('use-option') as UseOption;

    if (selectOption?.value != null) {
      event.preventDefault();
      this.#toggleOptionValue(selectOption);

      if (this.multiple) {
        this.trigger.focus();
      } else if (!selectOption.disabled) {
        (this.trigger.popoverTargetElement as HTMLElement).hidePopover();
      }
    }
  }

  #toggleOptionValue(target: UseOption) {
    if (target.value == null || target.disabled) {
      return;
    }

    if (this.multiple) {
      target.toggleSelected();
      this.#value.delete(this.#dataKey);
      this.options?.forEach((option) => {
        if (option.selected && option.value) {
          this.#value.append(this.#dataKey, option.value);
        }
      });
    } else {
      this.options?.forEach((option) => {
        option.selected = option === target;
      });
      this.#value.set(this.#dataKey, target.value);
    }

    this.#internals.setFormValue(this.value);
    this.#renderDisplayValue();
  }

  #renderDisplayValue() {
    const displayValue = this.#displayValue;
    this.label.innerHTML = displayValue ?? this.placeholder;

    if (displayValue) {
      this.#internals.states.delete('placeholder');
    } else {
      this.#internals.states.add('placeholder');
    }
  }

  get #displayValue() {
    const selected = this.selected;

    if (!this.multiple) {
      return selected.length > 0 ? selected[0].innerHTML : undefined;
    }

    return selected.length > 0 ? selected.map((option) => option.textContent).toLocaleString() : undefined;
  }

  #initializeValue() {
    const selectedValues = this.selected.map((option) => option.getAttribute('value') ?? option.textContent);

    this.#value.delete(this.#dataKey);

    if (this.multiple) {
      selectedValues.forEach((value) => {
        if (value) {
          this.#value.append(this.#dataKey, value);
        }
      });
    } else {
      if (selectedValues[0]) {
        this.#value.set(this.#dataKey, selectedValues[0]);
      }
    }

    this.#internals.setFormValue(this.value);
  }

  #activeOption: UseOption | null = null;
  get activeOption() {
    return this.#activeOption;
  }
  set activeOption(option: UseOption | null) {
    this.#activeOption?.setActive(false);
    this.#activeOption = option;
    this.trigger.setAttribute('aria-activedescendant', option?.id ?? '');
    option?.setActive(true);
  }

  #initializeActiveOption() {
    const activeOption = this.firstSelected ?? this.options.at(0) ?? null;
    this.activeOption = activeOption;
    return activeOption?.id ?? '';
  }

  firstUpdated() {
    this.#initializeValue();
    this.#renderDisplayValue();
    this.#initializeActiveOption();
  }

  get #dataKey() {
    return this.name ?? FORM_DATA_KEY;
  }

  get value() {
    return this.#value;
  }

  #getPopoverOpen() {
    return this.trigger.popoverTargetElement?.matches(":popover-open");
  }

  #handleKeyDown(event: KeyboardEvent) {
    const isOpen = this.#getPopoverOpen();

    if (['ArrowDown', 'ArrowUp'].includes(event.key) && !isOpen) {
      (this.trigger.popoverTargetElement as HTMLElement).showPopover();
      return;
    }

    if (!isOpen) {
      return;
    }

    if (['Enter', ' '].includes(event.key) && this.activeOption) {
      event.preventDefault();
      this.#toggleOptionValue(this.activeOption);
      if (!this.multiple) {
        (this.trigger.popoverTargetElement as HTMLElement).hidePopover();
      }
      return;
    }

    const options = this.options;
    const activeId = this.activeOption?.id;
    const activeIndex = activeId ? options.findIndex((option) => option.id === activeId) : -1;

    let moveTo: UseOption | undefined;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (activeIndex > 0) {
          moveTo = options.at(activeIndex - 1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveTo = options.at(activeIndex + 1);
        break;
      case 'Tab':
        (this.trigger.popoverTargetElement as HTMLElement).hidePopover();
        break;
    }

    if (moveTo) {
      this.activeOption = moveTo;
    }
  }

  #handlePopoverToggle(event: ToggleEvent) {
    const opening = event.newState === 'open';
    this.trigger.ariaExpanded = opening ? 'true' : 'false';

    if (!opening) {
      this.#initializeActiveOption();
    }
  }

  render() {
    return html`
      <button part="trigger" type="button" role="combobox" id="${this.#triggerId}" popovertarget="${this.#popoverId}" aria-controls="${this.#popoverId}" aria-haspopup="listbox" aria-activedescendant="" @keydown="${this.#handleKeyDown}" aria-expanded="false">
        <span part="trigger-label">${this.placeholder}</span>
        <slot part="trigger-arrow" name="arrow">
          <svg fill="currentColor" part="trigger-arrow-default" aria-hidden>
            <polygon points="4,4 8,0 0,0" />
          </svg>
        </slot>
      </button>
      <div id="${this.#popoverId}" role="listbox" part="popover" @click="${this.#handlePopoverClick}" popover @toggle="${this.#handlePopoverToggle}">
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

    ::slotted(use-option) {
      display: flex;
    }

    svg[part="trigger-arrow-default"] {
      width: .5rem;
      height: .25rem;
    }

    :host(:state(placeholder)) span[part="trigger-label"] {
      font-style: italic;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-select': UseSelect
  }
}

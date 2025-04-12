import { LitElement, css, html } from 'lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import { UseOption } from '../use-option/use-option';
import createId from '../../utils/create-id';

// TODO disabled https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO valid / invalid https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO readonly https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO mutation
// TODO required
// TODO typeahead
// TODO groups

const FORM_DATA_KEY = '__value';

/**
 * @slot default NodeList of `use-option` elements
 * @slot arrow
 */
@customElement('use-listbox')
export class UseListbox extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #id: string;
  #internals: ElementInternals;
  #value = new FormData();

  @property()
  name?: string;

  @property()
  placeholder: string = '';

  @property({ type: Boolean, reflect: true })
  multiple = false;

  @property({ type: Boolean })
  set disabled(flag) {
    this.#initializeDisabled(flag);
  }

  get disabled() {
    return this.#internals.states.has('disabled');
  }

  /**
   * UseOption[]
   * @readonly
   */
  get selected() {
    return this.options.filter((option) => option.selected);
  }

  get firstSelected() {
    return this.options.find((option) => option.selected);
  }

  @queryAssignedElements({ selector: 'use-option' })
  options!: Array<UseOption>;

  @query('[part="listbox"]', true)
  listbox!: HTMLDivElement;

  constructor() {
    super();
    this.#id = createId();
    this.#internals = this.attachInternals();

    if (this.hasAttribute('disabled')) {
      this.#internals.states.add('disabled');
    }
  }

  getId() {
    return this.id ? this.id : this.#id;
  }

  #handleClick(event: Event) {
    const selectOption = (event.target as HTMLElement)?.closest('use-option') as UseOption;

    if (selectOption?.value != null) {
      event.preventDefault();
      this.#toggleOptionValue(selectOption);
      this.activeOption = selectOption;
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
    this.listbox.setAttribute('aria-activedescendant', option?.id ?? '');
    option?.setActive(true);
  }

  async #initializeDisabled(disabled: boolean) {
    await this.updateComplete;
    if (disabled) {
      this.#internals.states.add('disabled');
      this.listbox.removeAttribute('tabindex');
    } else {
      this.#internals.states.delete('disabled');
      this.listbox.setAttribute('tabindex', '0');
    }
  }

  firstUpdated() {
    this.#initializeValue();

    this.activeOption = this.firstSelected ?? this.options.at(0) ?? null;
  }

  get #dataKey() {
    return this.name ?? FORM_DATA_KEY;
  }

  get value(): FormData {
    return this.#value;
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    if (['Enter', ' '].includes(event.key) && this.activeOption) {
      event.preventDefault();
      this.#toggleOptionValue(this.activeOption);
      return;
    }

    const options = this.options;
    const activeId = this.activeOption?.id;
    const activeIndex = activeId ? options.findIndex((option) => option.id === activeId) : -1;

    let moveTo: UseOption | undefined;
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
        moveTo = options.at(0);
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(options.length - 1);
        break;
    }

    if (moveTo) {
      this.activeOption = moveTo;
    }
  }

  render() {
    return html`
      <div role="listbox" part="listbox" tabindex=${0} @click=${this.#handleClick} @keydown=${this.#handleKeyDown}>
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
    :host {
      display: block;
    }

    [part='listbox'] {
      border: 1px solid light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }

    :host(:state(disabled)) {
      pointer-events: none;
      opacity: 0.5;
    }

    /* https://github.com/w3c/csswg-drafts/issues/5893 */
    [part='listbox']:not(:hover):focus-visible ::slotted(use-option:state(active)),
    ::slotted(use-option:not(:state(disabled)):hover) {
      background-color: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-listbox': UseListbox;
  }
}

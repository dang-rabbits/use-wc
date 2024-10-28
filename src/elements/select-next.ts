import { LitElement, css, html } from 'lit'
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js'
import { SelectOption } from './select-option';

// TODO disabled https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO valid https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO readonly https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
// TODO mutation

const FORM_DATA_KEY = '__value';

/**
 * An example element.
 *
 * @slot NodeList of `select-option` elements
 * @slot arrow
 */
@customElement('select-next')
export class SelectNext extends LitElement {
  static formAssociated = true;

  @property()
  name?: string;

  @property()
  placeholder?: string;

  @property({ type: Boolean })
  multiple = false;

  @property({ type: Boolean })
  listbox = false;

  @queryAssignedElements({ selector: 'select-option'})
  options?: Array<SelectOption>;

  @queryAssignedElements({ selector: 'select-option[selected]' })
  selected!: Array<SelectOption>;

  @query('button')
  button!: HTMLButtonElement;

  #id: string;

  #internals: ElementInternals;

  #value = new FormData();

  constructor() {
    super();
    this.#id = ':' + Math.random().toString(36).substring(2, 6) + ':';
    this.#internals = this.attachInternals();
  }

  getId() {
    return this.id ? this.id : this.#id;
  }

  get #popoverId() {
    return `${this.getId()}-dropdown`;
  }

  #setValue(event: Event) {
    const target = event.target as SelectOption;

    if (target.tagName === 'SELECT-OPTION' && target.value) {
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

  firstUpdated() {
    this.#initializeValue();
  }

  get #dataKey() {
    return this.name ?? FORM_DATA_KEY;
  }

  get value() {
    return this.#value;
  }

  render() {
    return html`
      <button part="trigger" type="button" id="${this.getId()}" popovertarget="${this.#popoverId}">
        <span part="trigger-label">${this.placeholder}</span>
        <slot part="trigger-arrow" name="arrow">
          <svg viewBox='0 0 140 140' width='12' height='12' xmlns='http://www.w3.org/2000/svg' fill="currentColor" aria-hidden part="trigger-arrow-default">
            <path d='m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z' />
          </svg>
        </slot>
      </button>
      <div id="${this.#popoverId}" part="popover" @click="${this.#setValue}" popover>
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
    }

    :host button > * {
      display: contents;
    }

    ::slotted(select-option) {
      display: flex;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'select-next': SelectNext
  }
}

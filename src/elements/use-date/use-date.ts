import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import createId from '../../utils/create-id';
import getDateTimeAriaLabels, { DateTimeAriaLabels, DEFAULT_ARIA_LABELS } from '../../utils/date-time-aria-labels';

type DateSegment = 'year' | 'month' | 'day';

/**
 * Displays a date picker using segmented inputs for year, month, and day.
 *
 * Uses browser locale for formatting and ARIA labels.
 */
@customElement('use-date')
export class UseDate extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internals: ElementInternals;
  #formId: string | undefined;
  #id: string;
  #ariaLabels: DateTimeAriaLabels = DEFAULT_ARIA_LABELS;
  #formatParts: Array<{ type: string; value: string }> = [];

  @query('input[part="segment-input segment-input-year"]') yearInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-month"]') monthInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-day"]') dayInput!: HTMLInputElement;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#formId = this.closest('form')?.id;
    this.#id = this.hasAttribute('id') ? this.getAttribute('id')! : createId();
    this.#initializeValue(this.getAttribute('value') ?? '');
    if (this.hasAttribute('disabled')) {
      this.#internals.states.add('disabled');
    }
  }

  #initializeValue(value: string | null) {
    try {
      if (value == null || value === '') {
        this.#valueData = { year: '', month: '', day: '' };
      } else {
        const date = new Date(value);
        this.#valueData = {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString(),
          day: date.getDate().toString(),
        };
      }
    } catch {
      this.#valueData = { year: '', month: '', day: '' };
    }

    this.#updateInternalValue();
  }

  #initialFormatParts() {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC',
      };
      const formatter = new Intl.DateTimeFormat(this.locale, options);
      const date = new Date(2024, 5, 1); // Sample date for formatting
      return formatter.formatToParts(date);
    } catch {
      return [];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.#ariaLabels = this.#initialAriaLabels();
    this.#formatParts = this.#initialFormatParts();
  }

  #initialAriaLabels() {
    return getDateTimeAriaLabels(this.locale, { plural: false });
  }

  #valueData: Record<DateSegment, string> = { year: '', month: '', day: '' };

  #updateInputValues() {
    if (this.yearInput) this.yearInput.value = this.#valueData.year;
    if (this.monthInput) this.monthInput.value = this.#valueData.month;
    if (this.dayInput) this.dayInput.value = this.#valueData.day;
  }

  #updateInternalValue() {
    const { year, month, day } = this.#valueData;
    this.#internalValue = [year.padStart(4, '0'), month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    this.#internals.setFormValue(this.#internalValue);
  }

  #handleSegmentInput(segment: DateSegment) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      this.#valueData[segment] = target.value;
      target.value = target.value;
      this.#updateInternalValue();
    };
  }

  #segmentId(unit: string) {
    return `${this.id}-segment-${unit}`;
  }

  #internalValue: string = '';

  get id() {
    return this.#id;
  }
  set id(val: string) {
    const old = this.#id;
    this.#id = val;
    this.requestUpdate('id', old);
  }

  /** @default false */
  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add('disabled');
    } else {
      this.#internals.states.delete('disabled');
    }
  }
  get disabled(): boolean {
    return this.#internals.states.has('disabled');
  }

  /** @default false */
  @property({ type: Boolean, attribute: 'readonly' })
  set readOnly(flag) {
    if (flag) {
      this.#internals.states.add('readonly');
    } else {
      this.#internals.states.delete('readonly');
    }
  }
  get readOnly(): boolean {
    return this.#internals.states.has('readonly');
  }

  /** @default YYYY-MM-DD */
  @property({ type: String })
  get value(): string {
    return this.#internalValue;
  }
  set value(value: string) {
    this.#initializeValue(value);
    this.#updateInputValues();
  }

  /** @default User's browser language or 'en-US' */
  @property({ type: String, attribute: true })
  locale: string = navigator.language || 'en-US';

  render() {
    return html`
      ${this.#formatParts.map((part) => {
        if (['year', 'month', 'day'].includes(part.type)) {
          return html`
            <input
              type="number"
              .value=${this.#valueData[part.type as DateSegment]}
              ?disabled=${this.disabled}
              ?readonly=${this.readOnly}
              aria-label=${this.#ariaLabels[part.type as keyof DateTimeAriaLabels]}
              min=${part.type === 'year' ? '0' : '1'}
              max=${part.type === 'month' ? '12' : part.type === 'day' ? '31' : undefined}
              part="segment-input segment-input-${part.type}"
              id="${this.#segmentId(part.type)}"
              form=${this.#formId}
              @input=${this.#handleSegmentInput(part.type as DateSegment)}
            />
          `;
        } else if (part.type === 'literal') {
          return html`<span part="segment-literal segment-literal-date" aria-hidden="true">${part.value}</span>`;
        }
        return null;
      })}
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5ch;

      input {
        font-variant-numeric: tabular-nums;
        field-sizing: content;
        text-align: end;
        min-width: 2ch;
      }
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-date': UseDate;
  }
}

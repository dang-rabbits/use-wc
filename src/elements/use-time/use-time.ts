import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import createId from '../../utils/create-id';
import getDateTimeAriaLabels, { DateTimeAriaLabels, DEFAULT_ARIA_LABELS } from '../../utils/date-time-aria-labels';

type TimeSegment = 'hour' | 'minute' | 'second' | 'fractionalSecond' | 'dayPeriod' | 'literal';

/**
 * Displays time picker using [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
 *
 * Allows users to pick time values with proper localization and formatting.
 */
@customElement('use-time')
export class UseTime extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internalValue: string = '';
  #internals: ElementInternals;
  #formId: string | undefined;
  #maxHours: number = 23;
  #dayPeriods = DEFAULT_ARIA_LABELS;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#formId = this.closest('form')?.id;
    this.#id = this.hasAttribute('id') ? this.getAttribute('id')! : createId();

    if (this.hasAttribute('disabled')) {
      this.#internals.states.add('disabled');
    }
  }

  #initializeValue(value: string) {
    try {
      const [hour = '0', minute = '0', secondFull = '00.000'] = value.split(':');
      const [second, fractionalSecond] = secondFull.split('.');
      const dayPeriod = Number(hour) >= 12 ? this.#dayPeriods.pm : this.#dayPeriods.am;

      this.#valueData = {
        hour: this.#hoursTo24(hour, dayPeriod),
        minute,
        second,
        fractionalSecond,
        dayPeriod,
      };
    } catch {
      this.#valueData = { hour: '0', minute: '0', second: '0', fractionalSecond: '000', dayPeriod: 'AM' };
    }

    this.#updateInternalValue();
  }

  #hoursTo24(hour: string, dayPeriod: string) {
    const hourNumber = Number(hour);

    if (this.#maxHours === 12) {
      if (dayPeriod === this.#dayPeriods.am) {
        return hourNumber === 12 ? '00' : hourNumber.toString();
      } else {
        if (hourNumber > 12) {
          return (hourNumber - 12).toString();
        } else {
          return hourNumber === 12 ? '12' : (hourNumber + 12).toString();
        }
      }
    }

    return hourNumber.toString();
  }

  connectedCallback() {
    super.connectedCallback();
    this.#formatParts = this.#initialFormatParts();
    this.#initializeValue(this.getAttribute('value') ?? '');
  }

  #id = '';
  get id() {
    return this.#id;
  }
  set id(val: string) {
    const old = this.#id;
    this.#id = val;
    this.requestUpdate('id', old);
  }

  @property({ type: Boolean, attribute: true }) hours = true;
  @property({ type: Boolean, attribute: true }) minutes = true;
  @property({ type: Boolean, attribute: true }) seconds = false;
  @property({ type: Boolean, attribute: true }) fractionalSeconds = false;
  @property({ type: String, attribute: true }) hourFormat: '12' | '24' | undefined;

  @query('input[part="segment-input segment-input-hour"]') hourInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-minute"]') minuteInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-second"]') secondInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-fractionalSecond"]') fractionalSecondInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-dayPeriod"]') dayPeriodInput!: HTMLInputElement;

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

  /** @default 00:00:00 */
  @property({ type: String, attribute: true })
  get value(): string {
    return this.#internalValue;
  }
  set value(value: string) {
    this.#initializeValue(value);
    this.#updateInputValues();
  }
  #valueData: Partial<Record<TimeSegment, string>> = {
    hour: '0',
    minute: '0',
    second: '0',
    fractionalSecond: '000',
    dayPeriod: 'AM',
  };

  #updateInputValues() {
    if (this.hourInput) {
      this.hourInput.value = (this.#valueData.hour ?? '').padStart(2, '0');
    }

    if (this.minuteInput) {
      this.minuteInput.value = (this.#valueData.minute ?? '').padStart(2, '0');
    }

    if (this.secondInput) {
      this.secondInput.value = (this.#valueData.second ?? '').padStart(2, '0');
    }

    if (this.fractionalSecondInput) {
      this.fractionalSecondInput.value = (this.#valueData.fractionalSecond ?? '').padStart(3, '0');
    }

    if (this.dayPeriodInput) {
      this.dayPeriodInput.value = this.#valueData.dayPeriod ?? '';
    }
  }

  /** @default User's browser language or 'en-US' */
  @property({ type: String, attribute: true })
  locale: string = navigator.language || 'en-US';

  @property({ type: String, attribute: true })
  format: 'long' | 'short' | 'narrow' | 'digital' = 'long';

  #formatParts: Array<{ type: TimeSegment; value: string }> = [];

  #initialFormatParts() {
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: this.hours ? 'numeric' : undefined,
        minute: this.minutes ? 'numeric' : undefined,
        second: this.seconds ? 'numeric' : undefined,
        // @ts-expect-error - fractionalSecondDigits is not typed
        fractionalSecondDigits: this.fractionalSeconds ? 3 : undefined,
        hour12: this.hourFormat ? this.hourFormat === '12' : undefined,
        timeZone: 'UTC',
      };

      const formatter = new Intl.DateTimeFormat(this.locale, options);
      const date = new Date(2024, 0, 1, 12, 30, 45); // Sample time for formatting
      const parts = formatter.formatToParts(date) as Array<{ type: TimeSegment; value: string }>;
      this.#maxHours = parts.some((part) => part.type === 'dayPeriod') ? 12 : 23;
      this.#dayPeriods = getDateTimeAriaLabels(this.locale);

      return parts;
    } catch {
      return [];
    }
  }

  #segmentId(unit: string) {
    return `${this.id}-segment-${unit}`;
  }

  #handleSegmentInput(segment: TimeSegment) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = isNaN(target.valueAsNumber) ? 0 : target.valueAsNumber;

      // Validate ranges
      if (segment === 'hour') {
        const max = this.hourFormat === '12' ? 12 : 23;
        this.#valueData.hour = Math.max(0, Math.min(max, value)).toString();
        target.value = this.#valueData.hour.padStart(2, '0');
      } else if (segment === 'minute') {
        this.#valueData.minute = Math.max(0, Math.min(59, value)).toString();
        target.value = this.#valueData.minute.padStart(2, '0');
      } else if (segment === 'second') {
        this.#valueData.second = Math.max(0, Math.min(59, value)).toString();
        target.value = this.#valueData.second.padStart(2, '0');
      } else if (segment === 'fractionalSecond') {
        this.#valueData.fractionalSecond = Math.max(0, Math.min(999, value)).toString();
        target.value = this.#valueData.fractionalSecond.padStart(3, '0');
      }

      this.#updateInternalValue();
    };
  }

  #handleSegmentKeydown(segment: TimeSegment) {
    return (event: KeyboardEvent) => {
      if (segment === 'dayPeriod' && !['Enter', 'Tab'].includes(event.key)) {
        event.preventDefault();

        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
          const target = event.target as HTMLInputElement;
          // @ts-expect-error - This method is only called when dayPeriod is defined
          const newValue = this.#getOtherDayPeriod(this.#valueData.dayPeriod);
          this.#valueData.dayPeriod = newValue;
          target.value = newValue;
          this.#updateInternalValue();
        }
      }
    };
  }

  #getOtherDayPeriod(dayPeriod: string) {
    return dayPeriod === this.#dayPeriods.am ? this.#dayPeriods.pm : this.#dayPeriods.am;
  }

  #updateInternalValue() {
    const { hour = '0', minute = '0', second = '0', fractionalSecond = '000', dayPeriod } = this.#valueData;
    const output: string[] = [];

    if (this.hours) {
      if (this.#maxHours === 12) {
        if (dayPeriod === this.#dayPeriods.am) {
          output.push(hour === '12' ? '00' : hour.padStart(2, '0'));
        } else {
          const hourNumber = Number(hour);
          output.push(hourNumber === 12 ? '12' : (hourNumber + 12).toString());
        }
      } else {
        output.push(hour.padStart(2, '0'));
      }
    }

    if (this.minutes) output.push(minute.padStart(2, '0'));
    if (this.seconds) output.push(second.padStart(2, '0'));

    this.#internalValue = output
      .join(':')
      .concat(fractionalSecond && this.fractionalSeconds ? '.' + fractionalSecond.padStart(3, '0') : '');
    this.#internals.setFormValue(this.#internalValue);
  }

  #getMaxValue(type: TimeSegment) {
    if (type === 'hour') {
      return this.#maxHours;
    }
    if (type === 'minute' || type === 'second') {
      return 59;
    }
    if (type === 'fractionalSecond') {
      return 999;
    }
    return undefined;
  }

  render() {
    return this.#formatParts.map((part) => {
      return part.type === 'literal'
        ? html`<span part="segment-literal segment-literal-${part.type}" aria-hidden="true">${part.value}</span>`
        : html`<input
            type=${part.type === 'dayPeriod' ? 'text' : 'number'}
            value=${this.#valueData[part.type]}
            ?disabled=${this.disabled}
            ?readonly=${this.readOnly}
            aria-label=${this.#dayPeriods[part.type === 'fractionalSecond' ? 'millisecond' : part.type]}
            min="0"
            max=${this.#getMaxValue(part.type)}
            part="segment-input segment-input-${part.type}"
            id="${this.#segmentId(part.type)}"
            form=${this.#formId}
            @input=${this.#handleSegmentInput(part.type)}
            @keydown=${this.#handleSegmentKeydown(part.type)}
          />`;
    });
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
        text-align: end;
      }

      input::part(segment-input-fractionalSecond) {
        min-width: 3ch;
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
    'use-time': UseTime;
  }
}

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
  #ariaLabels: DateTimeAriaLabels = DEFAULT_ARIA_LABELS;
  #amChar: string = 'a';
  #pmChar: string = 'p';

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
      if (!value) {
        this.#valueData = {
          hour: undefined,
          minute: undefined,
          second: undefined,
          fractionalSecond: undefined,
          dayPeriod: undefined,
        };
      } else {
        const [hour, minute, secondFull] = value.split(':');
        const [second, fractionalSecond] = secondFull ? secondFull.split('.') : [undefined, undefined];
        const dayPeriod = hour && Number(hour) >= 12 ? 'pm' : 'am';

        this.#valueData = {
          hour: hour ? this.#hoursTo24(hour, dayPeriod) : undefined,
          minute,
          second,
          fractionalSecond,
          dayPeriod,
        };
      }
    } catch {
      this.#valueData = {
        hour: undefined,
        minute: undefined,
        second: undefined,
        fractionalSecond: undefined,
        dayPeriod: undefined,
      };
    }

    this.#updateInternalValue();
  }

  #hoursTo24(hour: string, dayPeriod: string) {
    const hourNumber = Number(hour);

    if (this.#maxHours === 12) {
      if (dayPeriod === 'am') {
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
    this.#initializeSegments();
    this.#initializeHourFormat();
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

  @property({ type: Boolean, attribute: true }) hours = false;
  @property({ type: Boolean, attribute: true }) minutes = false;
  @property({ type: Boolean, attribute: true }) seconds = false;
  @property({ type: Boolean, attribute: true }) fractionalSeconds = false;
  @property({ type: Boolean, attribute: true }) dayPeriod = false;
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
  #valueData: Partial<Record<TimeSegment, string | undefined>> = {
    hour: undefined,
    minute: undefined,
    second: undefined,
    fractionalSecond: undefined,
    dayPeriod: undefined,
  };

  #updateInputValues() {
    if (this.hourInput) {
      this.hourInput.value = this.#valueData.hour ? this.#valueData.hour.padStart(2, '0') : '';
    }

    if (this.minuteInput) {
      this.minuteInput.value = this.#valueData.minute ? this.#valueData.minute.padStart(2, '0') : '';
    }

    if (this.secondInput) {
      this.secondInput.value = this.#valueData.second ? this.#valueData.second.padStart(2, '0') : '';
    }

    if (this.fractionalSecondInput) {
      this.fractionalSecondInput.value = this.#valueData.fractionalSecond
        ? this.#valueData.fractionalSecond.padStart(3, '0')
        : '';
    }

    if (this.dayPeriodInput) {
      this.dayPeriodInput.value = this.#valueData.dayPeriod
        ? (this.#ariaLabels[this.#valueData.dayPeriod as keyof DateTimeAriaLabels] ?? '')
        : '';
    }
  }

  /** @default User's browser language or 'en-US' */
  @property({ type: String, attribute: true })
  locale: string = navigator.language || 'en-US';

  @property({ type: String, attribute: true })
  format: 'long' | 'short' | 'narrow' | 'digital' = 'long';

  #formatParts: Array<{ type: TimeSegment; value: string }> = [];

  #initializeHourFormat() {
    if (!this.hourFormat) {
      const formatter = new Intl.DateTimeFormat(this.locale, { hour: 'numeric' });
      this.hourFormat = formatter.resolvedOptions().hour12 ? '12' : '24';
    }
  }

  #initialFormatParts() {
    try {
      const hasTimeSegments = this.hours || this.minutes || this.seconds || this.fractionalSeconds;
      const forceHourForDayPeriod = this.dayPeriod && !hasTimeSegments;
      const options: Intl.DateTimeFormatOptions = {
        hour: this.hours || forceHourForDayPeriod ? 'numeric' : undefined,
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
      const usesDayPeriod = !!formatter.resolvedOptions().hour12 && this.dayPeriod;
      this.#maxHours = usesDayPeriod ? 12 : 23;
      this.#ariaLabels = getDateTimeAriaLabels(this.locale);
      const [amChar, pmChar] = this.#ariaLabels.dayPeriod.split('/').map((char) => char.toLowerCase().charAt(0));
      this.#amChar = amChar;
      this.#pmChar = pmChar;

      if (!this.dayPeriod) {
        return parts.filter((part) => part.type !== 'dayPeriod');
      }

      if (forceHourForDayPeriod) {
        return parts.filter((part) => part.type === 'dayPeriod');
      }

      return parts;
    } catch {
      return [];
    }
  }

  #initializeSegments() {
    const hasTimeSegments = this.hours || this.minutes || this.seconds || this.fractionalSeconds;
    const hasSegments = hasTimeSegments || this.dayPeriod;
    if (!hasSegments) {
      this.hours = true;
      this.minutes = true;
      this.dayPeriod = true;
    }
  }

  #segmentId(unit: string) {
    return `${this.id}-segment-${unit}`;
  }

  #isToggleKey(key: string) {
    return ['ArrowUp', 'ArrowDown'].includes(key);
  }

  #amPmValue(chars: string) {
    const value = [this.#amChar, this.#pmChar].indexOf(chars.toLowerCase().charAt(0));
    return value === -1 ? null : value === 0 ? 'am' : 'pm';
  }

  // On some OSs, holding down a letter will open a list of accent characters
  // and selecting one bypasses the keypress prevention so we force a valid
  // value with this method.
  #computeValidAmPmValue(event: Event) {
    const target = event.target as HTMLInputElement;
    const data = (event as InputEvent).data;
    const amPmValue = data ? this.#amPmValue(data) : null;
    return amPmValue ?? this.#amPmValue(target.value) ?? 'am';
  }

  #handleSegmentInput(segment: TimeSegment) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;

      if (target.value === '') {
        this.#valueData[segment] = undefined;
        this.#updateInternalValue();
        return;
      }

      const value = isNaN(target.valueAsNumber) ? 0 : target.valueAsNumber;

      // Validate ranges
      if (segment === 'hour') {
        const use12Hour = this.hourFormat === '12' && this.dayPeriod;
        const min = use12Hour ? 1 : 0;
        const max = use12Hour ? 12 : 23;
        this.#valueData.hour = Math.max(min, Math.min(max, value)).toString();
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
      } else if (segment === 'dayPeriod') {
        event.preventDefault();
        const validValue = this.#computeValidAmPmValue(event);
        if (validValue) {
          this.#toggleDayPariod(target, validValue);
          return; // toggleDayPeriod calls updateInternalValue so stop before it is called twice
        }
      }

      this.#updateInternalValue();
    };
  }

  #toggleDayPariod(target: HTMLInputElement, value?: 'am' | 'pm') {
    const currentPeriod = this.#valueData.dayPeriod ?? 'am';
    const newValue = value ?? this.#getOtherDayPeriod(currentPeriod);
    this.#valueData.dayPeriod = newValue;
    target.value = this.#ariaLabels[newValue as keyof DateTimeAriaLabels] ?? '';
    this.#updateInternalValue();
  }

  #handleSegmentKeydown(event: KeyboardEvent) {
    if (!['Enter', 'Tab'].includes(event.key)) {
      if (!this.#amPmValue(event.key) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
      }

      if (this.#isToggleKey(event.key)) {
        this.#toggleDayPariod(event.target as HTMLInputElement);
        // this.dispatchEvent(
        //   new Event('input', {
        //     bubbles: true,
        //     composed: true,
        //   })
        // );
      }
    }
  }

  #getOtherDayPeriod(dayPeriod: string) {
    return dayPeriod === 'am' ? 'pm' : 'am';
  }

  #updateInternalValue() {
    const { hour, minute, second, fractionalSecond, dayPeriod } = this.#valueData;
    const output: string[] = [];

    if (this.hours) {
      if (!hour) {
        this.#internalValue = '';
        this.#internals.setFormValue(null);
        return;
      }

      if (this.#maxHours === 12 && this.dayPeriod) {
        if (dayPeriod === 'am') {
          output.push(hour === '12' ? '00' : hour.padStart(2, '0'));
        } else {
          const hourNumber = Number(hour);
          output.push(hourNumber === 12 ? '12' : (hourNumber + 12).toString());
        }
      } else {
        output.push(hour.padStart(2, '0'));
      }
    }

    if (this.minutes) {
      if (!minute) {
        this.#internalValue = '';
        this.#internals.setFormValue(null);
        return;
      }
      output.push(minute.padStart(2, '0'));
    }

    if (this.seconds) {
      if (!second) {
        this.#internalValue = '';
        this.#internals.setFormValue(null);
        return;
      }
      output.push(second.padStart(2, '0'));
    }

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
            value=${part.type === 'dayPeriod'
              ? this.#valueData.dayPeriod
                ? this.#ariaLabels[this.#valueData.dayPeriod as keyof DateTimeAriaLabels]
                : ''
              : this.#valueData[part.type]}
            ?disabled=${this.disabled}
            ?readonly=${this.readOnly}
            aria-label=${this.#ariaLabels[part.type === 'fractionalSecond' ? 'millisecond' : part.type]}
            min="0"
            max=${this.#getMaxValue(part.type)}
            part="segment-input segment-input-${part.type}"
            id="${this.#segmentId(part.type)}"
            form=${this.#formId}
            @input=${this.#handleSegmentInput(part.type)}
            @keydown=${part.type === 'dayPeriod' ? this.#handleSegmentKeydown : undefined}
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

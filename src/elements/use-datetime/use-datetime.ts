import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import createId from '../../utils/create-id';
import '../use-date/use-date';
import '../use-time/use-time';
import { UseDate } from '../use-date/use-date';
import { UseTime } from '../use-time/use-time';

/**
 * Displays a date and time picker by combining `use-date` and `use-time`.
 *
 * The value format is ISO 8601-like: `YYYY-MM-DDTHH:MM:SS.mmm`.
 */
@customElement('use-datetime')
export class UseDatetime extends LitElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internals: ElementInternals;
  #id: string;

  @query('use-date', true) dateElement!: UseDate;
  @query('use-time', true) timeElement!: UseTime;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#id = this.hasAttribute('id') ? this.getAttribute('id')! : createId();
    if (this.hasAttribute('disabled')) {
      this.#internals.states.add('disabled');
    }
  }

  get id() {
    return this.#id;
  }
  set id(val: string) {
    const old = this.#id;
    this.#id = val;
    this.requestUpdate('id', old);
  }

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

  /** @default User's browser language or 'en-US' */
  @property({ type: String, attribute: true })
  locale: string = navigator.language || 'en-US';

  // use-time props
  @property({ type: Boolean, attribute: true }) hours = false;
  @property({ type: Boolean, attribute: true }) minutes = false;
  @property({ type: Boolean, attribute: true }) seconds = false;
  @property({ type: Boolean, attribute: true }) fractionalSeconds = false;
  @property({ type: Boolean, attribute: true }) dayPeriod = false;
  @property({ type: String, attribute: true }) hourFormat: '12' | '24' | undefined;

  #internalValue: string = '';
  #dateValue: string = '';
  #timeValue: string = '';

  /** @default '' */
  @property({ type: String })
  get value(): string {
    return this.#internalValue;
  }
  set value(val: string) {
    this.#initializeValue(val);
  }

  #initializeValue(val: string) {
    const [datePart, timePart] = this.value.replace('Z', '').split('T');
    this.#dateValue = datePart ?? '';
    this.#timeValue = timePart ?? '';
    this.#internalValue = val;
    this.#internals.setFormValue(this.#internalValue);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#initializeValue(this.getAttribute('value') ?? '');
  }

  #updateInternalValue() {
    const date = this.dateElement?.value ?? '';
    const time = this.timeElement?.value ?? '';

    // Only combine if we have a date. Time is optional depending on use-case,
    // but usually a datetime needs a date.
    // If date is empty, the whole thing is likely empty or invalid.
    if (!date) {
      this.#internalValue = '';
    } else {
      // If time is empty but we expect time, what to do?
      // use-time returns defaults (00:00:00) if empty string passed?
      // Actually use-time manages its own valid state.
      this.#internalValue = `${date}T${time}`;
    }

    this.#internals.setFormValue(this.#internalValue);
  }

  #handleInput(event: Event) {
    // Stop propagation of inner input events so we don't spam
    // but actually, we want the user to know input happened.
    // However, the target will be use-datetime (due to shadow DOM of use-datetime),
    // OR it will be use-date/use-time if composed.
    // Since use-date/use-time are in use-datetime's shadow DOM,
    // and they emit composed input events, the event will bubble out of use-datetime
    // with target set to use-datetime.

    // We need to intercept it to update our internal value before it bubbles further?
    // Events bubble up. We capture here.

    const target = event.target as HTMLElement;
    if (target === this.dateElement || target === this.timeElement) {
      this.#updateInternalValue();
    }
  }

  render() {
    return html`
      <use-date
        value=${this.#dateValue}
        .disabled=${this.disabled}
        .readOnly=${this.readOnly}
        .locale=${this.locale}
        @input=${this.#handleInput}
        exportparts="segment-input"
      ></use-date>
      <use-time
        value=${this.#timeValue}
        .disabled=${this.disabled}
        .readOnly=${this.readOnly}
        .locale=${this.locale}
        .hours=${this.hours}
        .minutes=${this.minutes}
        .seconds=${this.seconds}
        .fractionalSeconds=${this.fractionalSeconds}
        .dayPeriod=${this.dayPeriod}
        .hourFormat=${this.hourFormat}
        @input=${this.#handleInput}
        exportparts="segment-input"
      ></use-time>
    `;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 1ch;
    }
  `;
}

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LocalizedElement, UseLocaleElement } from "../use-locale-element/use-locale-element";
import createId from "../../utils/create-id";
import getDateTimeAriaLabels from "../../utils/date-time-aria-labels";
import strings from "./use-date-input.strings.json";
import { dateTimeFormat } from "../../utils/intl-formatters";
import { LocaleDigitsElement } from "../../utils/locale-digits-element";

type DateSegment = "year" | "month" | "day";

/**
 * Displays a date picker using segmented inputs for year, month, and day.
 *
 * Uses browser locale for formatting and ARIA labels.
 *
 * Its user-facing strings are listed under "strings" in the API table; override them with the
 * `strings` property or the localization add-on.
 */
@customElement("use-date-input")
export class UseDateInput extends LocaleDigitsElement(LocalizedElement(UseLocaleElement, strings)) {
  protected intlStrings() {
    return getDateTimeAriaLabels(this.locale, { plural: false });
  }

  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internals: ElementInternals;
  #formId: string | undefined;
  #id: string;
  #formatParts: Array<{ type: string; value: string }> = [];

  @query('input[part="segment-input segment-input-year"]') yearInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-month"]') monthInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-day"]') dayInput!: HTMLInputElement;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#formId = this.closest("form")?.id;
    this.#id = this.hasAttribute("id") ? this.getAttribute("id")! : createId();
    this.#initializeValue(this.getAttribute("value") ?? "");
    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  #initializeValue(value: string | null) {
    try {
      if (value == null || value === "") {
        this.#valueData = { year: "", month: "", day: "" };
      } else {
        const date = new Date(value.concat("T00:00:00"));
        if (isNaN(date.getTime())) {
          throw new RangeError(`Invalid date: ${value}`);
        }
        this.#valueData = {
          year: date.getFullYear().toString(),
          month: (date.getMonth() + 1).toString(),
          day: date.getDate().toString(),
        };
      }
    } catch {
      this.#valueData = { year: "", month: "", day: "" };
    }

    this.#updateInternalValue();
  }

  #initialFormatParts() {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      };
      const formatter = dateTimeFormat(this.locale, options);
      const date = new Date(2024, 5, 1); // Sample date for formatting
      return formatter.formatToParts(date);
    } catch {
      return [];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.#formatParts = this.#initialFormatParts();
  }

  #valueData: Record<DateSegment, string> = { year: "", month: "", day: "" };

  #updateInputValues() {
    if (this.yearInput) this.yearInput.value = this.toLocaleDigits(this.#valueData.year);
    if (this.monthInput) this.monthInput.value = this.toLocaleDigits(this.#valueData.month);
    if (this.dayInput) this.dayInput.value = this.toLocaleDigits(this.#valueData.day);
  }

  #updateInternalValue() {
    const { year, month, day } = this.#valueData;
    this.#internalValue = [
      year.padStart(4, "0"),
      month.padStart(2, "0"),
      day.padStart(2, "0"),
    ].join("-");
    this.#internals.setFormValue(this.#internalValue);
  }

  #segmentMinimum: Record<DateSegment, number> = {
    year: 0,
    month: 1,
    day: 1,
  };

  #segmentMaximum: Record<DateSegment, number | undefined> = {
    year: undefined,
    month: 12,
    day: 31,
  };

  #handleSegmentInput(segment: DateSegment) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      const maximum = this.#segmentMaximum[segment];
      let value = this.toLatinDigits(target.value);
      const numericValue = parseInt(value, 10);
      if (maximum !== undefined && !isNaN(numericValue) && numericValue > maximum) {
        value = String(maximum);
      }
      target.value = this.toLocaleDigits(value);
      this.#valueData[segment] = value;
      this.#updateInternalValue();
      this.requestUpdate();
    };
  }

  #handleSegmentKeydown(segment: DateSegment) {
    return (event: KeyboardEvent) => {
      this.stepSegment(event, this.#segmentMinimum[segment], this.#segmentMaximum[segment]);
    };
  }

  #segmentId(unit: string) {
    return `${this.id}-segment-${unit}`;
  }

  #internalValue: string = "";

  get id() {
    return this.#id;
  }
  set id(val: string) {
    const old = this.#id;
    this.#id = val;
    this.requestUpdate("id", old);
  }

  /** @default false */
  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add("disabled");
    } else {
      this.#internals.states.delete("disabled");
    }
  }
  get disabled(): boolean {
    return this.#internals.states.has("disabled");
  }

  /** @default false */
  @property({ type: Boolean, attribute: "readonly" })
  set readOnly(flag) {
    if (flag) {
      this.#internals.states.add("readonly");
    } else {
      this.#internals.states.delete("readonly");
    }
  }
  get readOnly(): boolean {
    return this.#internals.states.has("readonly");
  }

  /** @default YYYY-MM-DD */
  @property({ type: String })
  get value(): string {
    return this.#internalValue;
  }
  set value(value: string) {
    this.#initializeValue(value);
    this.#updateInputValues();
    this.requestUpdate();
  }

  render() {
    return html`
      ${this.#formatParts.map((part) => {
        if (["year", "month", "day"].includes(part.type)) {
          const segment = part.type as DateSegment;
          return html`
            <input
              type="text"
              inputmode="numeric"
              role="spinbutton"
              .value=${this.toLocaleDigits(this.#valueData[segment])}
              ?disabled=${this.disabled}
              ?readonly=${this.readOnly}
              aria-label=${this.string(segment)}
              aria-valuemin=${this.#segmentMinimum[segment]}
              aria-valuemax=${this.#segmentMaximum[segment] ?? nothing}
              aria-valuenow=${this.segmentNumber(this.#valueData[segment]) ?? nothing}
              part="segment-input segment-input-${segment}"
              id="${this.#segmentId(segment)}"
              form=${this.#formId}
              size=${segment === "year" ? 4 : 2}
              @input=${this.#handleSegmentInput(segment)}
              @keydown=${this.#handleSegmentKeydown(segment)}
            />
          `;
        } else if (part.type === "literal") {
          return html`<span part="segment-literal segment-literal-date" aria-hidden="true"
            >${part.value}</span
          >`;
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
        width: fit-content;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-date-input": UseDateInput;
  }
}

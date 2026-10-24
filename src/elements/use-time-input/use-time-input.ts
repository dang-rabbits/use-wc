import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LocalizedElement, UseLocaleElement } from "../use-locale-element/use-locale-element";
import createId from "../../utils/create-id";
import getDateTimeAriaLabels from "../../utils/date-time-aria-labels";
import strings from "./use-time-input.strings.json";
import { dateTimeFormat } from "../../utils/intl-formatters";
import { LocaleDigitsElement } from "../../utils/locale-digits-element";

type TimeSegment = "hour" | "minute" | "second" | "fractionalSecond" | "dayPeriod" | "literal";

/**
 * Displays time picker using [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
 *
 * Allows users to pick time values with proper localization and formatting.
 *
 * Its user-facing strings are listed under "strings" in the API table; override them with the
 * `strings` property or the localization add-on.
 */
@customElement("use-time-input")
export class UseTimeInput extends LocaleDigitsElement(LocalizedElement(UseLocaleElement, strings)) {
  protected intlStrings() {
    return getDateTimeAriaLabels(this.locale, { plural: true });
  }

  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internalValue: string = "";
  #internals: ElementInternals;
  #formId: string | undefined;
  #maxHours: number = 23;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#formId = this.closest("form")?.id;
    this.#id = this.hasAttribute("id") ? this.getAttribute("id")! : createId();

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
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
        const [hour, minute, secondFull] = value.split(":");
        const [second, fractionalSecond] = secondFull
          ? secondFull.split(".")
          : [undefined, undefined];
        const dayPeriod = hour && Number(hour) >= 12 ? "pm" : "am";

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
      if (dayPeriod === "am") {
        return hourNumber === 12 ? "00" : hourNumber.toString();
      } else {
        if (hourNumber > 12) {
          return (hourNumber - 12).toString();
        } else {
          return hourNumber === 12 ? "12" : (hourNumber + 12).toString();
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
    this.#initializeValue(this.getAttribute("value") ?? "");
  }

  #id = "";
  get id() {
    return this.#id;
  }
  set id(val: string) {
    const old = this.#id;
    this.#id = val;
    this.requestUpdate("id", old);
  }

  @property({ type: Boolean, attribute: true }) hours = false;
  @property({ type: Boolean, attribute: true }) minutes = false;
  @property({ type: Boolean, attribute: true }) seconds = false;
  @property({ type: Boolean, attribute: true }) fractionalSeconds = false;
  @property({ type: Boolean, attribute: true }) dayPeriod = false;
  @property({ type: String, attribute: true }) hourFormat: "12" | "24" | undefined;

  @query('input[part="segment-input segment-input-hour"]') hourInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-minute"]') minuteInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-second"]') secondInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-fractionalSecond"]')
  fractionalSecondInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-dayPeriod"]') dayPeriodInput!: HTMLInputElement;

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

  /** @default 00:00:00 */
  @property({ type: String, attribute: true })
  get value(): string {
    return this.#internalValue;
  }
  set value(value: string) {
    this.#initializeValue(value);
    this.#updateInputValues();
    this.requestUpdate();
  }
  #valueData: Partial<Record<TimeSegment, string | undefined>> = {
    hour: undefined,
    minute: undefined,
    second: undefined,
    fractionalSecond: undefined,
    dayPeriod: undefined,
  };

  #segmentText(segment: TimeSegment) {
    const length =
      segment === "fractionalSecond" ? 3 : segment === "hour" && this.hourFormat === "12" ? 1 : 2;
    return this.toLocaleDigits(this.#valueData[segment]?.padStart(length, "0"));
  }

  #updateInputValues() {
    if (this.hourInput) {
      this.hourInput.value = this.#segmentText("hour");
    }

    if (this.minuteInput) {
      this.minuteInput.value = this.#segmentText("minute");
    }

    if (this.secondInput) {
      this.secondInput.value = this.#segmentText("second");
    }

    if (this.fractionalSecondInput) {
      this.fractionalSecondInput.value = this.#segmentText("fractionalSecond");
    }

    if (this.dayPeriodInput) {
      this.dayPeriodInput.value = this.#valueData.dayPeriod
        ? this.string(this.#valueData.dayPeriod as "am" | "pm")
        : "";
    }
  }

  @property({ type: String, attribute: true })
  format: "long" | "short" | "narrow" | "digital" = "long";

  #formatParts: Array<{ type: TimeSegment; value: string }> = [];

  #initializeHourFormat() {
    if (!this.hourFormat) {
      const formatter = dateTimeFormat(this.locale, { hour: "numeric" });
      this.hourFormat = formatter.resolvedOptions().hour12 ? "12" : "24";
    }
  }

  #initialFormatParts() {
    try {
      const hasTimeSegments = this.hours || this.minutes || this.seconds || this.fractionalSeconds;
      const forceHourForDayPeriod = this.dayPeriod && !hasTimeSegments;
      const options: Intl.DateTimeFormatOptions = {
        hour: this.hours || forceHourForDayPeriod ? "numeric" : undefined,
        minute: this.minutes ? "numeric" : undefined,
        second: this.seconds ? "numeric" : undefined,
        fractionalSecondDigits: this.fractionalSeconds ? 3 : undefined,
        hour12: this.hourFormat ? this.hourFormat === "12" : undefined,
        timeZone: "UTC",
      };

      const formatter = dateTimeFormat(this.locale, options);
      const date = new Date(2024, 0, 1, 12, 30, 45); // Sample time for formatting
      const parts = formatter.formatToParts(date) as Array<{ type: TimeSegment; value: string }>;
      const usesDayPeriod = !!formatter.resolvedOptions().hour12 && this.dayPeriod;
      this.#maxHours = usesDayPeriod ? 12 : 23;

      if (!this.dayPeriod) {
        return parts.filter((part) => part.type !== "dayPeriod");
      }

      if (forceHourForDayPeriod) {
        return parts.filter((part) => part.type === "dayPeriod");
      }

      return parts.filter((part) => part.value.trim() !== "");
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
    return ["ArrowUp", "ArrowDown"].includes(key);
  }

  #amPmValue(chars: string) {
    const value = [this.string("am"), this.string("pm")]
      .map((label) => label.toLowerCase().charAt(0))
      .indexOf(chars.toLowerCase().charAt(0));
    return value === -1 ? null : value === 0 ? "am" : "pm";
  }

  // On some OSs, holding down a letter will open a list of accent characters
  // and selecting one bypasses the keypress prevention so we force a valid
  // value with this method.
  #computeValidAmPmValue(event: Event) {
    const target = event.target as HTMLInputElement;
    const data = (event as InputEvent).data;
    const amPmValue = data ? this.#amPmValue(data) : null;
    return amPmValue ?? this.#amPmValue(target.value) ?? "am";
  }

  #handleSegmentInput(segment: TimeSegment) {
    return (event: Event) => {
      if (event instanceof InputEvent && event.isComposing) {
        return;
      }
      const target = event.target as HTMLInputElement;

      const isEmpty =
        segment === "dayPeriod" ? target.value === "" : this.toLatinDigits(target.value) === "";

      if (isEmpty) {
        target.value = "";
        this.#valueData[segment] = undefined;
        this.#updateInternalValue();
        this.requestUpdate();
        return;
      }

      const value = this.segmentNumber(target.value) ?? 0;

      // Validate ranges
      if (segment === "hour") {
        const use12Hour = this.hourFormat === "12" && this.dayPeriod;
        const min = use12Hour ? 1 : 0;
        const max = use12Hour ? 12 : 23;
        this.#valueData.hour = Math.max(min, Math.min(max, value)).toString();
        target.value = this.toLocaleDigits(
          this.hourFormat === "12" ? this.#valueData.hour : this.#valueData.hour.padStart(2, "0"),
        );
      } else if (segment === "minute") {
        this.#valueData.minute = Math.max(0, Math.min(59, value)).toString();
        target.value = this.toLocaleDigits(this.#valueData.minute.padStart(2, "0"));
      } else if (segment === "second") {
        this.#valueData.second = Math.max(0, Math.min(59, value)).toString();
        target.value = this.toLocaleDigits(this.#valueData.second.padStart(2, "0"));
      } else if (segment === "fractionalSecond") {
        this.#valueData.fractionalSecond = Math.max(0, Math.min(999, value)).toString();
        target.value = this.toLocaleDigits(this.#valueData.fractionalSecond.padStart(3, "0"));
      } else if (segment === "dayPeriod") {
        event.preventDefault();
        const validValue = this.#computeValidAmPmValue(event);
        if (validValue) {
          this.#toggleDayPariod(target, validValue);
          return; // toggleDayPeriod calls updateInternalValue so stop before it is called twice
        }
      }

      this.#updateInternalValue();
      this.requestUpdate();
    };
  }

  #handleNumericSegmentBeforeInput(event: InputEvent) {
    this.filterSegmentInput(event, (text) => this.#applyPastedValue(text));
  }

  #applyPastedValue(text: string) {
    const match =
      /^(?:\d{4}-\d{2}-\d{2}T)?((?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?)(?:Z|[+-]\d{2}:?\d{2})?$/.exec(
        text,
      );
    if (!match) {
      return false;
    }
    this.value = match[1];
    return true;
  }

  #handleNumericSegmentKeydown(segment: TimeSegment) {
    return (event: KeyboardEvent) => {
      this.stepSegment(event, this.#getMinValue(segment), this.#getMaxValue(segment));
    };
  }

  #toggleDayPariod(target: HTMLInputElement, value?: "am" | "pm") {
    const currentPeriod = this.#valueData.dayPeriod ?? "am";
    const newValue = value ?? this.#getOtherDayPeriod(currentPeriod);
    this.#valueData.dayPeriod = newValue;
    target.value = this.string(newValue);
    this.#updateInternalValue();
  }

  #handleSegmentKeydown(event: KeyboardEvent) {
    if (!["Enter", "Tab"].includes(event.key)) {
      if (!this.#amPmValue(event.key) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
      }

      if (this.#isToggleKey(event.key)) {
        this.#toggleDayPariod(event.target as HTMLInputElement);
        this.dispatchEvent(
          new Event("input", {
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  #getOtherDayPeriod(dayPeriod: string) {
    return dayPeriod === "am" ? "pm" : "am";
  }

  #updateInternalValue() {
    const { hour, minute, second, fractionalSecond, dayPeriod } = this.#valueData;
    const output: string[] = [];

    if (this.hours) {
      if (!hour) {
        this.#internalValue = "";
        this.#internals.setFormValue(null);
        return;
      }

      if (this.#maxHours === 12 && this.dayPeriod) {
        if (dayPeriod === "am") {
          output.push(hour === "12" ? "00" : hour.padStart(2, "0"));
        } else {
          const hourNumber = Number(hour);
          output.push(hourNumber === 12 ? "12" : (hourNumber + 12).toString());
        }
      } else {
        output.push(hour.padStart(2, "0"));
      }
    }

    if (this.minutes) {
      if (!minute) {
        this.#internalValue = "";
        this.#internals.setFormValue(null);
        return;
      }
      output.push(minute.padStart(2, "0"));
    }

    if (this.seconds) {
      if (!second) {
        this.#internalValue = "";
        this.#internals.setFormValue(null);
        return;
      }
      output.push(second.padStart(2, "0"));
    }

    this.#internalValue = output
      .join(":")
      .concat(
        fractionalSecond && this.fractionalSeconds ? "." + fractionalSecond.padStart(3, "0") : "",
      );
    this.#internals.setFormValue(this.#internalValue);
  }

  #getMinValue(type: TimeSegment) {
    return type === "hour" && this.hourFormat === "12" && this.dayPeriod ? 1 : 0;
  }

  #getMaxValue(type: TimeSegment) {
    if (type === "hour") {
      return this.#maxHours;
    }
    if (type === "minute" || type === "second") {
      return 59;
    }
    if (type === "fractionalSecond") {
      return 999;
    }
    return undefined;
  }

  render() {
    return this.#formatParts.map((part) => {
      return part.type === "literal"
        ? html`<span part="segment-literal segment-literal-${part.type}" aria-hidden="true"
            >${part.value}</span
          >`
        : part.type === "dayPeriod"
          ? html`<input
              type="text"
              value=${
                this.#valueData.dayPeriod
                  ? this.string(this.#valueData.dayPeriod as "am" | "pm")
                  : ""
              }
              ?disabled=${this.disabled}
              ?readonly=${this.readOnly}
              aria-label=${this.string(part.type)}
              part="segment-input segment-input-${part.type}"
              id="${this.#segmentId(part.type)}"
              form=${this.#formId}
              @input=${this.#handleSegmentInput(part.type)}
              @keydown=${this.#handleSegmentKeydown}
            />`
          : html`<input
              type="text"
              inputmode="numeric"
              role="spinbutton"
              .value=${this.#segmentText(part.type)}
              ?disabled=${this.disabled}
              ?readonly=${this.readOnly}
              aria-label=${this.string(part.type === "fractionalSecond" ? "millisecond" : part.type)}
              aria-valuemin=${this.#getMinValue(part.type)}
              aria-valuemax=${this.#getMaxValue(part.type) ?? nothing}
              aria-valuenow=${this.segmentNumber(this.#valueData[part.type]) ?? nothing}
              part="segment-input segment-input-${part.type}"
              id="${this.#segmentId(part.type)}"
              form=${this.#formId}
              @beforeinput=${this.#handleNumericSegmentBeforeInput}
              @input=${this.#handleSegmentInput(part.type)}
              @compositionend=${this.#handleSegmentInput(part.type)}
              @keydown=${this.#handleNumericSegmentKeydown(part.type)}
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
      }

      input::part(segment-input-fractionalSecond) {
        min-width: 3ch;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-time-input": UseTimeInput;
  }
}

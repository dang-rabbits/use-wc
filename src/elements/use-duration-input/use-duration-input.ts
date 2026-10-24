import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LocalizedElement, UseLocaleElement } from "../use-locale-element/use-locale-element";
import createId from "../../utils/create-id";
import * as duration from "duration-fns";
import getDateTimeAriaLabels from "../../utils/date-time-aria-labels";
import strings from "./use-duration-input.strings.json";
import { durationFormat, type DurationFormatPart } from "../../utils/intl-formatters";
import { LocaleDigitsElement } from "../../utils/locale-digits-element";

const ISO_DURATION_SEGMENTS: Record<string, keyof duration.Duration> = {
  year: "years",
  month: "months",
  week: "weeks",
  day: "days",
  hour: "hours",
  minute: "minutes",
  second: "seconds",
  millisecond: "milliseconds",
} as const;

/**
 * Displays the parts of an ISO 8601 duration string using [`Intl.DurationFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat).
 *
 * Uses the [`duration-fns`](https://www.npmjs.com/package/duration-fns) library for parsing ISO 8601 values.
 *
 * Its user-facing strings are listed under "strings" in the API table; override them with the
 * `strings` property or the localization add-on.
 *
 * <baseline-status featureId="intl-duration-format"></baseline-status>
 */
@customElement("use-duration-input")
export class UseDurationInput extends LocaleDigitsElement(
  LocalizedElement(UseLocaleElement, strings),
) {
  protected intlStrings() {
    return getDateTimeAriaLabels(this.locale, { plural: true });
  }

  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  #internals: ElementInternals;
  #formId: string | undefined;

  @query('input[part="segment-input segment-input-year"]') yearInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-month"]') monthInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-week"]') weekInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-day"]') dayInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-hour"]') hourInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-minute"]') minuteInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-second"]') secondInput!: HTMLInputElement;
  @query('input[part="segment-input segment-input-millisecond"]')
  millisecondInput!: HTMLInputElement;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#formId = this.closest("form")?.id;
    this.#id = this.hasAttribute("id") ? this.getAttribute("id")! : createId();

    this.#initializeValue(this.getAttribute("value") ?? "PT0S");

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  #initializeValue(value: string) {
    try {
      this.#valueData = duration.parse(value);
    } catch {
      this.#valueData = {};
    }

    this.#internals.setFormValue(value);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#formatParts = this.#initialFormatParts();
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

  @property({ type: Boolean, attribute: true }) years = false;
  @property({ type: Boolean, attribute: true }) months = false;
  @property({ type: Boolean, attribute: true }) weeks = false;
  @property({ type: Boolean, attribute: true }) days = false;
  @property({ type: Boolean, attribute: true }) hours = false;
  @property({ type: Boolean, attribute: true }) minutes = false;
  @property({ type: Boolean, attribute: true }) seconds = false;
  @property({ type: Boolean, attribute: true }) milliseconds = false;

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

  /** @default PT0S */
  @property({ type: String })
  get value(): string {
    return duration.toString(this.#valueData);
  }
  set value(value: string) {
    this.#initializeValue(value);
    this.#updateInputValues();
    this.requestUpdate();
  }
  #valueData: Partial<duration.Duration> = {};

  @property({ type: String, attribute: true })
  format: "long" | "short" | "narrow" | "digital" = "short";

  #formatParts: Array<DurationFormatPart> = [];

  #initialFormatParts() {
    try {
      return durationFormat(this.locale, { style: this.format })
        .formatToParts({
          years: this.years ? 2 : 0,
          months: this.months ? 2 : 0,
          weeks: this.weeks ? 2 : 0,
          days: this.days ? 2 : 0,
          hours: this.hours ? 2 : 0,
          minutes: this.minutes ? 2 : 0,
          seconds: this.seconds ? 2 : 0,
          milliseconds: this.milliseconds ? 2 : 0,
        })
        .filter((part) => this.format === "digital" || part.type !== "literal");
    } catch {
      return [];
    }
  }

  get #groupedParts(): Map<string, Array<DurationFormatPart>> {
    const grouped = new Map<string, Array<DurationFormatPart>>();

    this.#formatParts.forEach((part, index) => {
      if (part.unit || (this.format === "digital" && part.type === "literal")) {
        if (!grouped.has(part.unit || `literal-${index}`)) {
          grouped.set(part.unit || `literal-${index}`, []);
        }
        grouped.get(part.unit || `literal-${index}`)!.push(part);
      }
    });

    return grouped;
  }

  #segmentId(unit: string) {
    return `${this.id}-segment-${unit}`;
  }

  #handleSegmentInput(segment: keyof duration.Duration) {
    return (event: Event) => {
      if (event instanceof InputEvent && event.isComposing) {
        return;
      }
      const target = event.target as HTMLInputElement;
      this.#valueData[ISO_DURATION_SEGMENTS[segment]] = this.segmentNumber(target.value) ?? 0;
      this.value = duration.toString(this.#valueData);
    };
  }

  #handleSegmentBeforeInput(event: InputEvent) {
    this.filterSegmentInput(event, (text) => this.#applyPastedValue(text));
  }

  #applyPastedValue(text: string) {
    if (!text.startsWith("P")) {
      return false;
    }
    try {
      duration.parse(text);
    } catch {
      return false;
    }
    this.value = text;
    return true;
  }

  #handleSegmentKeydown(event: KeyboardEvent) {
    this.stepSegment(event, 0);
  }

  #updateInputValues() {
    if (this.yearInput) {
      this.yearInput.value = this.toLocaleDigits(this.#valueData.years ?? 0);
    }

    if (this.monthInput) {
      this.monthInput.value = this.toLocaleDigits(this.#valueData.months ?? 0);
    }

    if (this.weekInput) {
      this.weekInput.value = this.toLocaleDigits(this.#valueData.weeks ?? 0);
    }

    if (this.dayInput) {
      this.dayInput.value = this.toLocaleDigits(this.#valueData.days ?? 0);
    }

    if (this.hourInput) {
      this.hourInput.value = this.toLocaleDigits(this.#valueData.hours ?? 0);
    }

    if (this.minuteInput) {
      this.minuteInput.value = this.toLocaleDigits(this.#valueData.minutes ?? 0);
    }

    if (this.secondInput) {
      this.secondInput.value = this.toLocaleDigits(this.#valueData.seconds ?? 0);
    }

    if (this.millisecondInput) {
      this.millisecondInput.value = this.toLocaleDigits(this.#valueData.milliseconds ?? 0);
    }
  }

  #unitLabel(unit: string) {
    return unit in strings ? this.string(unit as keyof typeof strings) : undefined;
  }

  render() {
    return Array.from(this.#groupedParts.entries()).map(([unit, parts]) => {
      return html`
        <div part="segment segment-${unit}">
          ${parts.map((part) => {
            if (["integer", "fraction"].includes(part.type)) {
              return html`
                <input
                  type="text"
                  inputmode="numeric"
                  role="spinbutton"
                  .value=${this.toLocaleDigits(
                    this.#valueData[ISO_DURATION_SEGMENTS[unit as keyof duration.Duration]],
                  )}
                  ?disabled=${this.disabled}
                  ?readonly=${this.readOnly}
                  aria-label=${
                    this.format === "digital" && part.type === "fraction"
                      ? this.string("millisecond")
                      : this.#unitLabel(unit)
                  }
                  aria-valuemin="0"
                  aria-valuenow=${
                    this.#valueData[ISO_DURATION_SEGMENTS[unit as keyof duration.Duration]] ??
                    nothing
                  }
                  part="segment-input segment-input-${unit}"
                  id="${this.#segmentId(unit)}"
                  form=${this.#formId}
                  @beforeinput=${this.#handleSegmentBeforeInput}
                  @input=${this.#handleSegmentInput(unit as keyof duration.Duration)}
                  @compositionend=${this.#handleSegmentInput(unit as keyof duration.Duration)}
                  @keydown=${this.#handleSegmentKeydown}
                />
              `;
            }

            if (["unit", "decimal"].includes(part.type)) {
              return html`
                <label for="${this.#segmentId(unit)}" part="segment-unit segment-unit-${unit}"
                  >${part.value}</label
                >
              `;
            }

            if (this.format === "digital" && part.type === "literal") {
              return html`<span part="segment-literal segment-literal-${unit}"
                >${part.value}</span
              >`;
            }
          })}
        </div>
      `;
    });
  }

  static styles = css`
    :host {
      input {
        font-variant-numeric: tabular-nums;
        field-sizing: content;
        text-align: end;
        min-width: 2ch;
      }
    }

    :host([format="digital"]) {
      display: inline-flex;
      align-items: center;
      gap: 0.5ch;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-duration-input": UseDurationInput;
  }
}

import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { UseLocaleElement } from "../use-locale-element/use-locale-element";
import createId from "../../utils/create-id";
import * as duration from "duration-fns";
import getDateTimeAriaLabels, {
  DateTimeAriaLabels,
  DEFAULT_ARIA_LABELS,
} from "../../utils/date-time-aria-labels";

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
 * <baseline-status featureId="intl-duration-format"></baseline-status>
 */
@customElement("use-duration-input")
export class UseDurationInput extends UseLocaleElement {
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
    this.#ariaLabels = this.#initialAriaLabels();
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
  }
  #valueData: Partial<duration.Duration> = {};

  @property({ type: String, attribute: true })
  format: "long" | "short" | "narrow" | "digital" = "short";

  #formatParts: Array<{ type: string; value: string; unit?: string }> = [];

  #ariaLabels: DateTimeAriaLabels = DEFAULT_ARIA_LABELS;

  #initialFormatParts() {
    try {
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/60608
      return new Intl.DurationFormat(this.locale, { style: this.format })
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
        .filter(
          (part: { type: string; value: string; unit?: string }) =>
            this.format === "digital" || part.type !== "literal",
        );
    } catch {
      return [];
    }
  }

  get #groupedParts(): Map<string, Array<{ type: string; value: string; unit?: string }>> {
    const grouped = new Map<string, Array<{ type: string; value: string; unit?: string }>>();

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
      const target = event.target as HTMLInputElement;
      this.#valueData[ISO_DURATION_SEGMENTS[segment]] = isNaN(target.valueAsNumber)
        ? 0
        : target.valueAsNumber;
      this.value = duration.toString(this.#valueData);
    };
  }

  #updateInputValues() {
    if (this.yearInput) {
      this.yearInput.value = String(this.#valueData.years ?? 0);
    }

    if (this.monthInput) {
      this.monthInput.value = String(this.#valueData.months ?? 0);
    }

    if (this.weekInput) {
      this.weekInput.value = String(this.#valueData.weeks ?? 0);
    }

    if (this.dayInput) {
      this.dayInput.value = String(this.#valueData.days ?? 0);
    }

    if (this.hourInput) {
      this.hourInput.value = String(this.#valueData.hours ?? 0);
    }

    if (this.minuteInput) {
      this.minuteInput.value = String(this.#valueData.minutes ?? 0);
    }

    if (this.secondInput) {
      this.secondInput.value = String(this.#valueData.seconds ?? 0);
    }

    if (this.millisecondInput) {
      this.millisecondInput.value = String(this.#valueData.milliseconds ?? 0);
    }
  }

  #initialAriaLabels() {
    return getDateTimeAriaLabels(this.locale, { plural: true });
  }

  render() {
    return Array.from(this.#groupedParts.entries()).map(([unit, parts]) => {
      return html`
        <div part="segment segment-${unit}">
          ${parts.map((part) => {
            if (["integer", "fraction"].includes(part.type)) {
              return html`
                <input
                  type="number"
                  .value=${this.#valueData[ISO_DURATION_SEGMENTS[unit as keyof duration.Duration]]}
                  ?disabled=${this.disabled}
                  ?readonly=${this.readOnly}
                  aria-label=${this.format === "digital" && part.type === "fraction"
                    ? this.#ariaLabels.millisecond
                    : this.#ariaLabels[unit as keyof DateTimeAriaLabels]}
                  min="0"
                  part="segment-input segment-input-${unit}"
                  id="${this.#segmentId(unit)}"
                  form=${this.#formId}
                  @input=${this.#handleSegmentInput(unit as keyof duration.Duration)}
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
    :host([format="digital"]) {
      display: inline-flex;
      align-items: center;
      gap: 0.5ch;

      input {
        field-sizing: content;
        text-align: end;
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
    "use-duration-input": UseDurationInput;
  }
}

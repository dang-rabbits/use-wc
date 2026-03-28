import { LitElement, TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UseLocaleElement } from "../use-locale-element/use-locale-element";
import { getMonthNames } from "../../utils/date-time-aria-labels";

type LitHtml = typeof html;

export type UseMonthPickerRenderMonth = (
  data: { month: number; name: string },
  html: LitHtml,
) => TemplateResult | string;

/**
 * A standalone form-associated year-month picker.
 * Emits ISO 8601 `YYYY-MM` values.
 *
 * @element use-month-picker
 * @fires use-change - Fired when the user selects a month. Detail: `{ value: string }`
 *
 * @csspart header - Year display + navigation controls bar
 * @csspart title - Year number label inside the header
 * @csspart control - Shared part on all nav buttons
 * @csspart control-previous - Previous-year nav button
 * @csspart control-thismonth - "This month" nav button
 * @csspart control-next - Next-year nav button
 * @csspart grid - 4-column 12-month grid container
 * @csspart month - Individual month cell button
 * @csspart month-selected - Applied when this month is the selected value
 * @csspart month-current - Applied when this month is the real-world current month
 * @csspart month-disabled - Applied when this month falls outside min/max
 * @slot month-{YYYY-MM} - Per-month content that replaces the default month name (e.g. `month-2026-03`)
 */
@customElement("use-month-picker")
export class UseMonthPicker extends UseLocaleElement {
  static formAssociated = true;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: block;
    }

    [part="header"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    [part="controls"] {
      display: flex;
      align-items: center;
    }

    [part="grid"] {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }

    [part~="month"] {
      background: none;
      border: none;
      padding: 0.25em;
      cursor: pointer;
      font: inherit;
      width: 100%;
      text-align: center;
    }

    [part~="month-selected"] {
      background-color: rgba(0, 0, 0, 0.25);
    }

    [part~="month-current"] {
      font-weight: bold;
    }

    [part~="month-disabled"] {
      opacity: 0.5;
      cursor: default;
    }
  `;

  #internals: ElementInternals;
  #value: string = "";

  /** Year currently shown in the grid. Defaults to the current year, or the year of the initial value attribute. */
  @property({ type: Number, reflect: true })
  year: number = new Date().getFullYear();

  constructor() {
    super();
    this.#internals = this.attachInternals();

    const initialValue = this.getAttribute("value") ?? "";
    if (initialValue) {
      this.#value = initialValue;
      this.#internals.setFormValue(initialValue);
      const parsed = parseInt(initialValue.split("-")[0], 10);
      if (!isNaN(parsed)) this.year = parsed;
    }

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  /** Minimum selectable year-month in `YYYY-MM` format (inclusive). */
  @property({ type: String })
  min: string = "";

  /** Maximum selectable year-month in `YYYY-MM` format (inclusive). */
  @property({ type: String })
  max: string = "";

  /**
   * Controls keyboard navigation within the grid.
   * - `'on'` (default): navigation enabled, wraps from December → next year and January → previous year.
   * - `'nowrap'`: navigation enabled, clamps at January and December without year-crossing.
   * - `'off'`: keyboard navigation disabled entirely.
   */
  @property({ type: String })
  navigation: "on" | "nowrap" | "off" = "on";

  get navigationEnabled() {
    return this.navigation !== "off";
  }

  get #navigationWrap() {
    return this.navigation === "on";
  }

  /** Disables all interaction. Reflected to the `:state(disabled)` CSS pseudo-class. */
  @property({ type: Boolean })
  set disabled(flag: boolean) {
    if (flag) {
      this.#internals.states.add("disabled");
    } else {
      this.#internals.states.delete("disabled");
    }
    this.requestUpdate("disabled");
  }
  get disabled(): boolean {
    return this.#internals.states.has("disabled");
  }

  /** Selected ISO 8601 year-month (`YYYY-MM`). Empty string means no selection. */
  @property({ type: String })
  get value(): string {
    return this.#value;
  }
  set value(value: string) {
    const old = this.#value;
    this.#value = value;
    this.#internals.setFormValue(value || null);
    this.requestUpdate("value", old);
  }

  /** Navigate to the previous year. */
  previousYear() {
    const minYear = this.#minYear;
    if (minYear !== null && this.year <= minYear) return;
    this.year = this.year - 1;
    this.requestUpdate();
  }

  /** Navigate to the next year. */
  nextYear() {
    const maxYear = this.#maxYear;
    if (maxYear !== null && this.year >= maxYear) return;
    this.year = this.year + 1;
    this.requestUpdate();
  }

  /** Navigate the view to the current real-world year. */
  thisMonth() {
    this.year = new Date().getFullYear();
    this.requestUpdate();
  }

  get #minYear(): number | null {
    return this.min ? parseInt(this.min.split("-")[0], 10) : null;
  }

  get #maxYear(): number | null {
    return this.max ? parseInt(this.max.split("-")[0], 10) : null;
  }

  #monthDisabled(year: number, month: number): boolean {
    const ym = `${year}-${String(month).padStart(2, "0")}`;
    return (!!this.min && ym < this.min) || (!!this.max && ym > this.max);
  }

  #getRovingIndex(): number {
    if (this.#value) {
      const [yearStr, monthStr] = this.#value.split("-");
      if (parseInt(yearStr, 10) === this.year) {
        const monthNum = parseInt(monthStr, 10);
        if (monthNum >= 1 && monthNum <= 12) return monthNum - 1;
      }
    }
    const focused = this.shadowRoot?.querySelector<HTMLElement>('[part~="month"][tabindex="0"]');
    if (focused) {
      const all = Array.from(
        this.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="month"]'),
      );
      const idx = all.indexOf(focused as HTMLButtonElement);
      if (idx !== -1) return idx;
    }
    return 0;
  }

  #selectMonth(monthNum: number) {
    if (this.disabled || this.#monthDisabled(this.year, monthNum)) return;
    const ym = `${this.year}-${String(monthNum).padStart(2, "0")}`;
    this.#value = ym;
    this.#internals.setFormValue(ym);
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent("use-change", {
        detail: { value: ym },
        bubbles: true,
        composed: true,
      }),
    );
  }

  renderMonth: UseMonthPickerRenderMonth = ({ name }) => name;

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!this.navigationEnabled) return;

    const buttons = Array.from(
      this.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="month"]'),
    );
    const idx = buttons.indexOf(this.shadowRoot!.activeElement as HTMLButtonElement);
    if (idx === -1) return;

    let next = -1;
    let yearDelta = 0;

    switch (event.key) {
      case "ArrowRight":
        if (idx === 11 && this.#navigationWrap) {
          yearDelta = 1;
          next = 0;
        } else next = Math.min(idx + 1, 11);
        break;
      case "ArrowLeft":
        if (idx === 0 && this.#navigationWrap) {
          yearDelta = -1;
          next = 11;
        } else next = Math.max(idx - 1, 0);
        break;
      case "ArrowDown":
        if (idx + 4 > 11 && this.#navigationWrap) {
          yearDelta = 1;
          next = idx + 4 - 12;
        } else next = Math.min(idx + 4, 11);
        break;
      case "ArrowUp":
        if (idx - 4 < 0 && this.#navigationWrap) {
          yearDelta = -1;
          next = idx - 4 + 12;
        } else next = Math.max(idx - 4, 0);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = 11;
        break;
      case "PageDown":
        yearDelta = 1;
        next = idx;
        break;
      case "PageUp":
        yearDelta = -1;
        next = idx;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.#selectMonth(idx + 1);
        return;
      default:
        return;
    }

    event.preventDefault();

    if (yearDelta !== 0) {
      const newYear = this.year + yearDelta;
      const minYear = this.#minYear;
      const maxYear = this.#maxYear;
      const allowed =
        (yearDelta < 0 && (minYear === null || newYear >= minYear)) ||
        (yearDelta > 0 && (maxYear === null || newYear <= maxYear));
      if (!allowed) return;

      this.year = newYear;
      this.requestUpdate();
      this.updateComplete.then(() => {
        const newButtons = Array.from(
          this.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="month"]'),
        );
        newButtons.forEach((b, i) => {
          b.tabIndex = i === next ? 0 : -1;
        });
        newButtons[next]?.focus();
      });
    } else if (next > -1) {
      buttons.forEach((b, i) => {
        b.tabIndex = i === next ? 0 : -1;
      });
      buttons[next].focus();
    }
  };

  render() {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;

    const months = getMonthNames(this.locale, "short");

    const minYear = this.#minYear;
    const maxYear = this.#maxYear;
    const prevDisabled = this.disabled || (minYear !== null && this.year <= minYear);
    const nextDisabled = this.disabled || (maxYear !== null && this.year >= maxYear);

    const rovingIndex = this.#getRovingIndex();

    return html`
      <div part="header">
        <span part="title" aria-live="polite">${this.year}</span>
        <div part="controls">
          <button
            type="button"
            part="control control-previous"
            aria-label=${String(this.year - 1)}
            ?disabled=${prevDisabled}
            @click=${this.previousYear}
          >
            ◄
          </button>
          <button
            type="button"
            part="control control-thismonth"
            aria-label=${String(todayYear)}
            @click=${this.thisMonth}
          >
            ●
          </button>
          <button
            type="button"
            part="control control-next"
            aria-label=${String(this.year + 1)}
            ?disabled=${nextDisabled}
            @click=${this.nextYear}
          >
            ►
          </button>
        </div>
      </div>
      <div
        part="grid"
        role="grid"
        aria-label=${String(this.year)}
        @keydown=${this.navigationEnabled ? this.#handleKeyDown : undefined}
      >
        ${months.map((name: string, i: number) => {
          const monthNum = i + 1;
          const disabled = this.#monthDisabled(this.year, monthNum);
          const selected = this.#value === `${this.year}-${String(monthNum).padStart(2, "0")}`;
          const isCurrent = this.year === todayYear && monthNum === todayMonth;
          const parts = [
            "month",
            selected ? "month-selected" : "",
            isCurrent ? "month-current" : "",
            disabled ? "month-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const ym = `${this.year}-${String(monthNum).padStart(2, "0")}`;
          return html`<button
            part=${parts}
            role="gridcell"
            type="button"
            aria-selected=${selected ? "true" : "false"}
            aria-disabled=${disabled ? "true" : "false"}
            tabindex=${i === rovingIndex ? "0" : "-1"}
            @click=${() => this.#selectMonth(monthNum)}
          >
            <slot name="month-${ym}">${this.renderMonth({ month: monthNum, name }, html)}</slot>
          </button>`;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-month-picker": UseMonthPicker;
  }
}

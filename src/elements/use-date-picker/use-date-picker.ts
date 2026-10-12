import { customElement } from "lit/decorators.js";
import { UseCalendarBase } from "../use-calendar-base/use-calendar-base";

/**
 * A day-granularity date picker. Value format: YYYY-MM-DD.
 *
 * Customize day rendering on an instance:
 * ```ts
 * datePicker.renderDay = ({ day, date }, html) =>
 *   date === "2026-03-17" ? html`<strong>${day}</strong>` : String(day);
 * ```
 *
 * Or override on a subclass to apply it to every instance, falling back to
 * `super.renderDay(...)` for dates you don't want to customize:
 * ```ts
 * class MyDatePicker extends UseDatePicker {
 *   renderDay(data: { day: number; date: string }, html: LitHtml) {
 *     if (data.date === "2026-03-17") {
 *       return html`<strong>${data.day}</strong>`;
 *     }
 *     return super.renderDay(data, html);
 *   }
 * }
 * ```
 *
 * @fires use-change - Fired on selection with detail `{ value: string }`
 */
@customElement("use-date-picker")
export class UseDatePicker extends UseCalendarBase {
  static styles = UseCalendarBase.styles;

  connectedCallback() {
    super.connectedCallback();
    const attr = this.getAttribute("value") || "";
    if (attr) this.value = attr;
  }

  get value(): string {
    return this.formStringValue;
  }

  set value(value: string) {
    const trimmed = value.trim();
    this.setFormStringValue(trimmed);
    this.setSelectedDates(trimmed ? [trimmed] : []);
    if (this.navigationEnabled && this.firstRender && trimmed) {
      this.goTo(trimmed);
    }
  }

  protected handleDayClick(dateStr: string): void {
    if (this.dateDisabled(dateStr)) return;
    this.value = dateStr;
    this.dispatchEvent(
      new CustomEvent("use-change", {
        detail: { value: dateStr },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected handleConfirmKey(activeDateStr: string): void {
    this.handleDayClick(activeDateStr);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-date-picker": UseDatePicker;
  }
}

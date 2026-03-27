import { customElement } from "lit/decorators.js";
import { UseCalendarBase } from "../use-calendar-base/use-calendar-base";

/**
 * A day-granularity date picker. Value format: YYYY-MM-DD.
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

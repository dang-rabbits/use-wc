import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { formatISOWeek, parseISOWeek } from '../../utils/date-time-aria-labels';
import { UseCalendarBase } from '../use-calendar-base/use-calendar-base';

/**
 * A week-granularity date picker. Value format: YYYY-Www (ISO 8601 week).
 *
 * @fires use-change - Fired on selection with detail `{ value: string; dates: string[] }`
 */
@customElement('use-week-picker')
export class UseWeekPicker extends UseCalendarBase {
  static styles = [
    UseCalendarBase.styles,
    css`
      [part~='day']:not([part*='day-empty']) {
        cursor: pointer;
      }

      [part*='day-week-hover']:not([part*='day-empty']) {
        background-color: rgba(0, 0, 0, 0.1);
      }
    `,
  ];

  #hoverWeekDates: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    const attr = this.getAttribute('value') || '';
    if (attr) this.value = attr;
  }

  get value(): string {
    return this.formStringValue;
  }

  set value(value: string) {
    if (typeof value === 'string' && value.match(/^\d{4}-W\d{2}$/)) {
      this.setFormStringValue(value);
      const monday = parseISOWeek(value);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return this.formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
      });
      this.setSelectedDates(weekDates);
      if (this.navigationEnabled && this.firstRender) {
        this.goTo(weekDates[0]);
      }
    }
  }

  protected get hoverWeekDates(): string[] {
    return this.#hoverWeekDates;
  }

  protected gridBodyListeners(): { mouseover?: EventListener; mouseleave?: EventListener } {
    return {
      mouseover: this.#handleWeekMouseOver as EventListener,
      mouseleave: this.#handleWeekMouseLeave as EventListener,
    };
  }

  protected onActiveDateChanged(dateStr: string): void {
    this.#hoverWeekDates = dateStr ? this.#getWeekDates(dateStr) : [];
    this.requestUpdate();
  }

  protected onGridFocusOut(): void {
    this.#hoverWeekDates = [];
    this.requestUpdate();
  }

  #getWeekDates(dateStr: string): string[] {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay() || 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const wd = new Date(monday);
      wd.setDate(monday.getDate() + i);
      return this.formatDate(wd.getFullYear(), wd.getMonth() + 1, wd.getDate());
    });
  }

  #handleWeekMouseOver = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const day = this.getTargetCell(target);
    const dateStr = day?.getAttribute('data-usewc-date');
    if (!dateStr) {
      if (this.#hoverWeekDates.length > 0) {
        this.#hoverWeekDates = [];
        this.requestUpdate();
      }
      return;
    }
    this.#hoverWeekDates = this.#getWeekDates(dateStr);
    this.requestUpdate();
  };

  #handleWeekMouseLeave = () => {
    this.#hoverWeekDates = [];
    this.requestUpdate();
  };

  protected handleDayClick(dateStr: string): void {
    const [y, m, d] = dateStr.split('-').map(Number);
    const isoWeek = formatISOWeek(new Date(y, m - 1, d));
    const dates = this.#getWeekDates(dateStr);
    const enabledDates = dates.filter((date) => !this.dateDisabled(date));
    if (enabledDates.length === 0) return;
    this.setFormStringValue(isoWeek);
    this.setSelectedDates(enabledDates);
    this.dispatchEvent(
      new CustomEvent('use-change', {
        detail: { value: isoWeek, dates: enabledDates },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected handleConfirmKey(activeDateStr: string): void {
    this.handleDayClick(activeDateStr);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-week-picker': UseWeekPicker;
  }
}

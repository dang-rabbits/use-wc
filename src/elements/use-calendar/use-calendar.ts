import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { getDayNames, getLocaleFirstDay } from '../../utils/date-time-aria-labels';
import { map } from 'lit/directives/map.js';
import { tabbable } from 'tabbable';
import getTabIndex, { INITIAL_TABINDEX_VALUE } from '../../utils/get-tabindex';
import { keyed } from 'lit/directives/keyed.js';

import '../use-calendarday/use-calendarday';

const INITIAL_TABINDEX_ATTR = 'data-usewc-calendar-tabindex';

// TODO `controlslist` attribute for previous today and next

type LitHtml = typeof html;

export type UseCalendarRenderDay = (data: { day: number; date: string }, html: LitHtml) => TemplateResult | string;

/**
 * Displays a calendar grid of the current month.
 *
 * @slot header-start - Content before the title in the header
 * @slot title - Title showing the month and year
 * @slot controls - Navigation controls (previous, today, next buttons)
 * @slot header-end - Content after the controls in the header
 * @slot date-{YYYY-MM-DD} - Per-date content that replaces the default day number
 * @csspart header - The header container
 * @csspart title - The title text
 * @csspart title-month - The month part of the title
 * @csspart title-literal - Literal text in the title
 * @csspart title-year - The year part of the title
 * @csspart controls - The controls slot container
 * @csspart control - Individual control button
 * @csspart control-previous - Previous month button
 * @csspart control-today - Today button
 * @csspart control-next - Next month button
 * @csspart grid - The main calendar grid
 * @csspart grid-header - The header row with day names
 * @csspart grid-header-cell - Individual day name header cell
 * @csspart grid-body - The container for calendar weeks
 * @csspart row - A row of days
 * @csspart day - A day cell
 * @csspart day-empty - An empty day cell (from previous/next month)
 * @csspart day-selected - A selected day cell
 * @csspart day-today - The current date cell
 * @csspart day-disabled - A disabled date cell
 */
@customElement('use-calendar')
export class UseCalendar extends LitElement {
  static formAssociated = true;

  #internals: ElementInternals;
  #value = new FormData();
  #firstRender = false;

  @query('[part="grid-body"]')
  private gridBody!: HTMLDivElement;

  /** 1970-9999 */
  @property({ type: Number, attribute: true, reflect: true })
  year: number = new Date().getFullYear();

  /** 1-12 */
  @property({ type: Number, attribute: true, reflect: true })
  month: number = new Date().getMonth() + 1;

  @property({ type: String })
  locale: string = navigator.language;

  @property({ type: Boolean, attribute: true, reflect: true })
  controls: boolean = false;

  @property({ type: String, attribute: true, reflect: true })
  navigation: 'nowrap' | 'off' | 'on' = 'on';
  get navigationEnabled() {
    return this.navigation !== 'off';
  }
  get #navigationWrap() {
    return !` ${this.navigation} `.includes(' nowrap ');
  }

  @property({ type: String, attribute: true, reflect: true })
  hiddenmonths: string = '';
  get #showPreviousMonth() {
    return !` ${this.hiddenmonths} `.includes(' previous ');
  }
  get #showNextMonth() {
    return !` ${this.hiddenmonths} `.includes(' next ');
  }

  // TODO add 'range' option
  // TODO add 'multiple' option - difficult because we don't want to force / parse comma separated values
  // alternative: provide an example with checkboxes in the cells
  @property({ type: String, attribute: true, reflect: true })
  selectmode?: 'single' | 'multiple';

  @property({ type: String, attribute: true })
  focusmode: 'cell' | 'control' = 'cell';

  @property({ type: String, attribute: true })
  name?: string = '';

  @property({ type: Array, attribute: false })
  private selected: string[] = [];

  @property({ type: String, attribute: true })
  min?: string;

  @property({ type: String, attribute: true })
  max?: string;

  /** First date in the visible range. Accepts ISO 8601 date strings or `'min'` to use the same value as `min` */
  @property({ type: String, attribute: true })
  start?: string;
  #startDate = null as Date | null;

  /** Last date in the visible range. Accepts ISO 8601 date strings or `'max'` to use the same value as `max` */
  @property({ type: String, attribute: true })
  end?: string;
  #endDate = null as Date | null;

  #activeDate = new Date(this.year, this.month - 1, 1);

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.value = this.getAttribute('value') || '';
    this.year = Number(this.getAttribute('year')) || new Date().getFullYear();
    this.month = Number(this.getAttribute('month')) || new Date().getMonth() + 1;

    let startDay = 1;
    const startValue = this.getAttribute('start');
    if (startValue) {
      this.#startDate = this.#parseDate(startValue === 'min' ? this.getAttribute('min')! : startValue);
      if (this.#startDate && this.#startDate.getMonth() + 1 === this.month) {
        startDay = this.#startDate.getDate();
      }
    }

    const endValue = this.getAttribute('end');
    if (endValue) {
      this.#endDate = this.#parseDate(endValue === 'max' ? this.getAttribute('max')! : endValue);
    }

    this.#activeDate = new Date(this.year, this.month - 1, startDay);
  }

  #parseDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
  }

  firstUpdated() {
    this.#firstRender = true;
    this.#initializeTabbables();
  }

  get #dataKey() {
    return this.name || 'value';
  }

  get value(): string {
    return (this.#value.get(this.#dataKey) as string) || '';
  }

  set value(value: string[] | string) {
    this.#value.delete(this.#dataKey);
    const parsedValue = Array.isArray(value) ? value : value.trim().split(' ');

    if (this.selectmode === 'multiple') {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          this.#value.append(this.#dataKey, v);
        });
      } else {
        this.#value.append(this.#dataKey, value);
      }
    } else if (this.selectmode === 'single') {
      if (Array.isArray(value) && value.length > 0) {
        this.#value.set(this.#dataKey, value[0]);
      } else if (typeof value === 'string' && value.length > 0) {
        this.#value.set(this.#dataKey, value);
      }
    }

    this.#internals.setFormValue(this.#value);

    this.selected = parsedValue;

    if (this.navigationEnabled && this.selectmode === 'single' && parsedValue[0] && this.#firstRender) {
      this.goTo(parsedValue[0]);
    }
  }

  #dateDisabled(date: string) {
    return (this.min && date < this.min) || (this.max && date > this.max);
  }

  #internalSetValue(value: string[] | string) {
    if (typeof value === 'string' && this.#dateDisabled(value)) {
      return;
    }

    this.value = value;

    this.dispatchEvent(
      new CustomEvent('use-change', {
        detail: {
          value: this.value,
          valueAsDate: new Date(value[0]),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  get #daysInMonth() {
    return new Date(this.year, this.month, 0).getDate();
  }

  get #previousMonthData() {
    const date = new Date(this.year, this.month - 1, 0);
    return {
      days: date.getDate(),
      firstDay: date.getDay(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  }

  get #nextMonthData() {
    const date = new Date(this.year, this.month, 0);
    return {
      days: date.getDate(),
      firstDay: date.getDay(),
      year: date.getFullYear(),
      month: date.getMonth() + 2,
    };
  }

  get #startDayOffset() {
    const firstOfMonth = new Date(this.year, this.month - 1, 1);
    return (firstOfMonth.getDay() - getLocaleFirstDay(this.locale) + 7) % 7;
  }

  #weekdayNames() {
    return getDayNames(this.locale, 'short');
  }

  get #title() {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: undefined,
        timeZone: 'UTC',
      };
      const formatter = new Intl.DateTimeFormat(this.locale, options);
      const date = new Date(this.year, this.month - 1, 1);
      return formatter.formatToParts(date);
    } catch {
      return [];
    }
  }

  getDateForDay(day: number) {
    const date = new Date(this.year, this.month - 1, day);
    return this.#formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  #formatDate(year: number, month: number, day: number) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  #focusableElements = new Map<string, HTMLElement[]>();

  #initializeTabbables() {
    this.#focusableElements.clear();

    tabbable(this)
      .concat(tabbable(this.gridBody))
      .forEach((el) => {
        el.setAttribute(INITIAL_TABINDEX_ATTR, getTabIndex(el));
        el.tabIndex = -1;
        const date = this.#getTargetCellDate(el as HTMLElement);

        if (!date) return;

        if (!this.#focusableElements.has(date)) {
          this.#focusableElements.set(date, []);
        }

        this.#focusableElements.get(date)?.push(el as HTMLElement);
      });
  }

  #handleCellFocusIn(event: HTMLElementEventMap['focusin']) {
    const target = event.currentTarget as HTMLElement;
    const date = target.getAttribute('data-usewc-date');
    if (!date) return;

    const focusableElements = this.#focusableElements.get(date);
    if (!focusableElements) return;

    focusableElements.forEach((el) => {
      const tabindex = el.getAttribute(INITIAL_TABINDEX_ATTR);
      if (tabindex === INITIAL_TABINDEX_VALUE) {
        el.removeAttribute('tabindex');
      } else if (tabindex) {
        el.setAttribute('tabindex', tabindex);
      }
      el.removeAttribute(INITIAL_TABINDEX_ATTR);
    });
  }

  #handleCellFocusOut(event: HTMLElementEventMap['focusout']) {
    const currentTarget = event.currentTarget as HTMLElement;
    const date = currentTarget.getAttribute('data-usewc-date');
    const relatedTarget = event.relatedTarget as HTMLElement;
    const focusableElements = this.#focusableElements.get(date || '');

    if (!date || !focusableElements || focusableElements.includes(relatedTarget)) {
      if (currentTarget.contains(relatedTarget)) {
        currentTarget.setAttribute('tabindex', '-1');
      }

      return;
    }

    if (this.contains(relatedTarget) || this.gridBody.contains(relatedTarget)) {
      focusableElements.forEach((el) => {
        el.setAttribute(INITIAL_TABINDEX_ATTR, getTabIndex(el));
        el.tabIndex = -1;
      });
    }
  }

  renderDay: UseCalendarRenderDay = ({ day }) => String(day);

  get #todayDate() {
    return this.getDateForDay(new Date().getDate());
  }

  #renderDayCell(year: number, month: number, day: number, rowIndex: number, columnIndex: number, empty = false) {
    const date = this.#formatDate(year, month, day);
    const disabled = this.#dateDisabled(date);

    return html`
      <div
        @focusin=${this.#handleCellFocusIn}
        @focusout=${this.#handleCellFocusOut}
        part=${[
          'day',
          empty ? 'day-empty' : '',
          this.selected.includes(date) ? 'day-selected' : '',
          this.#todayDate === date ? 'day-today' : '',
          disabled ? 'day-disabled' : '',
        ]
          .join(' ')
          .trim()}
        aria-disabled=${disabled ? 'true' : 'false'}
        aria-selected=${this.selected.includes(date) ? 'true' : 'false'}
        role="gridcell"
        data-usewc-day=${day}
        data-usewc-date=${date}
        tabindex=${this.navigationEnabled ? '-1' : undefined}
        aria-rowindex="${rowIndex}"
        aria-colindex="${columnIndex}"
      >
        <slot name="date-${date}">${this.renderDay({ day, date }, html)}</slot>
      </div>
    `;
  }

  public previousMonth() {
    if (this.navigation === 'off') return;
    let previousMonth = this.#activeDate.getMonth();
    let previousYear = this.#activeDate.getFullYear();
    if (previousMonth === 0) {
      previousYear--;
      previousMonth = 12;
    }
    this.goTo(previousYear, previousMonth, 1);
    this.#initializeControls();
  }

  public today() {
    if (this.navigation === 'off') return;
    this.goTo(new Date());
  }

  public nextMonth() {
    if (this.navigation === 'off') return;
    this.goTo(this.#activeDate.getFullYear(), this.#activeDate.getMonth() + 2, 1);
  }

  /**
   * @param yearOrDate - year, date string, or date object
   * @param month - month number (1-12)
   * @param day - day number (1-31)
   */
  public async goTo(yearOrDate: number | string | Date, month?: number, day?: number) {
    let date = null as Date | null;
    if (typeof yearOrDate === 'string') {
      date = this.#parseDate(yearOrDate) || new Date();
    } else if (yearOrDate instanceof Date) {
      date = yearOrDate;
    } else {
      date = new Date(yearOrDate, (month || 1) - 1, day != null ? day : 1);
    }

    if (date && this.#startDate && date < this.#startDate) {
      date = this.#startDate;
    }

    if (date && this.#endDate && date > this.#endDate) {
      date = this.#endDate;
    }

    if (date) {
      this.#activeDate = date;
    }

    if (this.year !== this.#activeDate.getFullYear() || this.month !== this.#activeDate.getMonth() + 1) {
      this.year = this.#activeDate.getFullYear();
      this.month = this.#activeDate.getMonth() + 1;
      await this.#initializeControls();
    }
  }

  async #initializeControls() {
    await this.updateComplete;
    this.#initializeTabbables();
  }

  focus() {
    this.gridBody.focus();
  }

  get #activeDateString() {
    return this.#activeDate.toISOString().split('T')[0];
  }

  #mouseDownTarget = null as HTMLElement | null;
  #handleMouseDown(event: MouseEvent) {
    this.#mouseDownTarget = this.#getTargetCell(event.target as HTMLElement);
    this.#activeDate.setDate(Number(this.#mouseDownTarget?.getAttribute('data-usewc-day')) || 1);
  }

  #getTargetCellDate(target?: HTMLElement) {
    return (
      target?.closest('[data-usewc-date]')?.getAttribute('data-usewc-date') ||
      target?.closest('[slot^="date-"]')?.getAttribute('slot')?.replace('date-', '')
    );
  }

  #getTargetCell(target?: HTMLElement) {
    const targetDate = this.#getTargetCellDate(target);
    return this.shadowRoot?.querySelector(`[data-usewc-date="${targetDate}"]`) as HTMLElement;
  }

  #handleClick(event: HTMLElementEventMap['click']) {
    this.#mouseDownTarget = null;
    if (!this.navigationEnabled) return;

    const target = event.target as HTMLElement;
    const day = this.#getTargetCell(target);
    if (day) {
      if (this.selectmode === 'single') {
        this.#internalSetValue(day.getAttribute('data-usewc-date') || '');
      }

      if (this.navigationEnabled) {
        this.#activeDate.setDate(Number(day.getAttribute('data-usewc-day')) || 1);
        this.gridBody.setAttribute('tabindex', '-1');
      }
    }
  }

  #handleFocusIn(event: HTMLElementEventMap['focusin']) {
    const target = event.target as HTMLElement | null;
    const cell = this.shadowRoot?.querySelector(`[data-usewc-date="${this.#activeDateString}"]`) as HTMLElement;

    this.gridBody.setAttribute('tabindex', '-1');

    if (event.target === this.gridBody) {
      this.#focusOnDate(this.year, this.month, this.#activeDate.getDate());
      return;
    }

    if (this.contains(target)) {
      cell?.setAttribute('tabindex', '0');
    }
  }

  #handleFocusOut(event: HTMLElementEventMap['focusout']) {
    if (this.contains(event.relatedTarget as Node)) {
      return;
    }

    this.gridBody.querySelectorAll('[data-usewc-day]').forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });

    this.gridBody.setAttribute('tabindex', '0');
  }

  #handleKeyDown(event: HTMLElementEventMap['keydown']) {
    const currentDay = this.#activeDate.getDate();

    if ([' ', 'Enter'].includes(event.key) && this.selectmode === 'single') {
      event.preventDefault();
      event.stopPropagation();

      this.#internalSetValue(this.#activeDateString);
      return;
    }

    let moveTo;
    if (event.key === 'ArrowRight') {
      moveTo = currentDay + 1;
      if (!this.#navigationWrap) {
        moveTo = Math.min(moveTo, this.#daysInMonth);
      }
    } else if (event.key === 'ArrowLeft') {
      moveTo = currentDay - 1;
      if (!this.#navigationWrap) {
        moveTo = Math.max(moveTo, 1);
      }
    } else if (event.key === 'ArrowUp') {
      if (this.#showPreviousMonth && this.#navigationWrap) {
        moveTo = currentDay - 7;
      } else {
        moveTo = Math.max(currentDay - 7, 1);
      }
    } else if (event.key === 'ArrowDown') {
      if (this.#showNextMonth && this.#navigationWrap) {
        moveTo = currentDay + 7;
      } else {
        moveTo = Math.min(currentDay + 7, this.#daysInMonth);
      }
    }

    if (moveTo != null) {
      this.#setActiveDay(moveTo);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  async #setActiveDay(day: number) {
    await this.#focusOnDate(this.#activeDate.getFullYear(), this.#activeDate.getMonth() + 1, day);
  }

  async #focusOnDate(year: number, month: number, day: number) {
    await this.goTo(year, month, day);

    const date = this.#formatDate(
      this.#activeDate.getFullYear(),
      this.#activeDate.getMonth() + 1,
      this.#activeDate.getDate()
    );

    if (this.focusmode === 'control') {
      const target = this.#focusableElements.get(date)?.at(0);
      if (target) {
        target.focus();
        return;
      }
    }

    const target = this.shadowRoot?.querySelector(`[data-usewc-date="${date}"]`);

    if (target) {
      (target as HTMLElement).focus();
    }
  }

  #isThisMonth(date: Date | null) {
    if (date == null) return false;
    return date.getFullYear() === this.year && date.getMonth() + 1 === this.month;
  }

  #isSameMonth(date1: Date | null, date2: Date | null) {
    if (date1 == null || date2 == null) return false;
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
  }

  render() {
    const rows: Array<Array<TemplateResult | string>> = [];
    const daysInMonth = this.#daysInMonth;
    const previousMonthData = this.#previousMonthData;
    const nextMonthData = this.#nextMonthData;
    const startDate = this.#startDate;
    const endDate = this.#endDate;
    const startDay = startDate && this.#isThisMonth(startDate) ? startDate.getDate() : 1;
    const endDay = endDate && this.#isThisMonth(endDate) ? endDate.getDate() : daysInMonth;
    const localeFirstDay = getLocaleFirstDay(this.locale);
    const firstDay =
      startDate && this.#isThisMonth(startDate) ? (startDate.getDay() - localeFirstDay + 7) % 7 : this.#startDayOffset;

    let rowIndex = 1;
    let columnIndex = 1;

    for (let i = 1; i <= firstDay; i++) {
      rows[rowIndex] = rows[rowIndex] || [];
      const emptyDate = new Date(
        previousMonthData.year,
        previousMonthData.month - 1,
        previousMonthData.days - firstDay + i
      );
      rows[rowIndex].push(
        !startDate || emptyDate >= startDate
          ? this.#renderDayCell(
              previousMonthData.year,
              previousMonthData.month,
              previousMonthData.days - firstDay + i,
              rowIndex + 1,
              columnIndex,
              true
            )
          : html`<div part="day day-empty"></div>`
      );
      columnIndex++;
    }

    for (let d = startDay; d <= endDay; d++) {
      const day = this.#renderDayCell(this.year, this.month, d, rowIndex + 1, columnIndex);
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(day);
      columnIndex++;
      if (columnIndex === 8) {
        rowIndex++;
        columnIndex = 1;
      }
    }

    const fillers = 8 - columnIndex;
    if (this.#showNextMonth && fillers < 7) {
      for (let i = 1; i <= fillers; i++) {
        rows[rowIndex] = rows[rowIndex] || [];
        const emptyDate = new Date(nextMonthData.year, nextMonthData.month - 1, i);
        rows[rowIndex].push(
          !endDate || emptyDate <= endDate
            ? this.#renderDayCell(nextMonthData.year, nextMonthData.month, i, rowIndex + 1, columnIndex, true)
            : html`<div part="day day-empty"></div>`
        );
      }
    }

    const neededRows = rows.filter((row) => row.length > 0);

    const weekdayNames = this.#weekdayNames();
    return html`
      <div part="header">
        <slot name="header-start"></slot>
        <slot part="title" name="title" id="calendar-title">
          ${this.#title.map((part) => html`<span part="title-${part.type}">${part.value}</span>`)}
        </slot>
        <slot part="controls" name="controls">
          ${this.controls
            ? html`
                <button
                  type="button"
                  part="control control-previous"
                  @click=${this.previousMonth}
                  ?disabled=${this.#startDate && this.#isThisMonth(this.#startDate)}
                >
                  ◄
                </button>
                <button
                  type="button"
                  part="control control-today"
                  @click=${this.today}
                  ?hidden=${this.#isSameMonth(this.#startDate, this.#endDate)}
                >
                  ●
                </button>
                <button
                  type="button"
                  part="control control-next"
                  @click=${this.nextMonth}
                  ?disabled=${this.#endDate && this.#isThisMonth(this.#endDate)}
                >
                  ►
                </button>
              `
            : ''}
        </slot>
        <slot name="header-end"></slot>
      </div>
      <div part="grid" role="grid" aria-labelledby="calendar-title">
        <div part="grid-header" role="row" aria-rowindex="1">
          ${weekdayNames.map(
            (name, index) =>
              html`<div part="grid-header-cell" role="columnheader" aria-colindex="${index + 1}">${name}</div>`
          )}
        </div>
        <div
          part="grid-body"
          role="rowgroup"
          tabindex=${this.navigationEnabled ? '0' : undefined}
          @focusin=${this.navigationEnabled ? this.#handleFocusIn : undefined}
          @focusout=${this.navigationEnabled ? this.#handleFocusOut : undefined}
          @mousedown=${this.navigationEnabled ? this.#handleMouseDown : undefined}
          @click=${this.navigationEnabled ? this.#handleClick : undefined}
          @keydown=${this.navigationEnabled ? this.#handleKeyDown : undefined}
        >
          ${keyed(
            `${this.year}-${this.month}`,
            map(neededRows, (row, index) => html`<div role="row" part="row" aria-rowindex=${index + 1}>${row}</div>`)
          )}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      text-align: center;
    }

    [part='grid-header'],
    [part='grid-body'] [part='row'] {
      display: grid;
      grid-template-rows: auto repeat(6, 1fr);
      grid-template-columns: repeat(7, 1fr);
    }

    [part='header'] {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    [part='header'] slot:not(:empty) {
      display: block;
    }

    [part*='day-selected'] {
      background-color: rgba(0, 0, 0, 0.25);
    }

    [part*='day-disabled'] {
      opacity: 0.75;
    }

    [part*='day-empty'] {
      opacity: 0.5;
    }
  `;
}

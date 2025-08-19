import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '../use-calendarday/use-calendarday';
import { getDayNames } from '../../utils/date-time-aria-labels';
import { map } from 'lit/directives/map.js';
import { tabbable } from 'tabbable';
import getTabIndex, { INITIAL_TABINDEX_VALUE } from '../../utils/get-tabindex';
import { keyed } from 'lit/directives/keyed.js';

const INITIAL_TABINDEX_ATTR = 'data-usewc-calendar-tabindex';

// TODO `controls` and `controlslist` attributes
// TODO min/max date attributes - determines which dates are selectable
// TODO start/end date attributes - determines which dates are visible

type LitHtml = typeof html;

export type UseCalendarRenderDay = (data: { day: number; date: string }, html: LitHtml) => TemplateResult | string;

/**
 * Displays a calendar grid of the current month.
 *
 * @slot - Calendar content
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
    this.#activeDate = new Date(this.year, this.month - 1, 1);
  }

  firstUpdated() {
    this.#firstRender = true;
    this.#initializeTabbables();
  }

  get #dataKey() {
    return this.name || 'value';
  }

  get value(): FormData {
    return this.#value;
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
          value: value,
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

  get #firstDayOfWeek() {
    return new Date(this.year, this.month - 1, 1).getDay();
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
    this.goTo(this.#activeDate.getFullYear(), this.#activeDate.getMonth(), 1);
    this.#initializeControls();
  }

  public today() {
    this.goTo(new Date());
  }

  public nextMonth() {
    this.goTo(this.#activeDate.getFullYear(), this.#activeDate.getMonth() + 2, 1);
  }

  /**
   * @param yearOrDate - year, date string, or date object
   * @param month - month number (1-12)
   * @param day - day number (1-31)
   */
  public async goTo(yearOrDate: number | string | Date, month?: number, day?: number) {
    if (typeof yearOrDate === 'string') {
      const [year, month, day] = yearOrDate.split('-').map(Number);
      this.#activeDate = new Date(year, month - 1, day);
    } else if (yearOrDate instanceof Date) {
      this.#activeDate = yearOrDate;
    } else {
      this.#activeDate = new Date(yearOrDate, (month || 1) - 1, day != null ? day : 1);
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

  render() {
    const rows: Array<Array<TemplateResult | string>> = [];
    const daysInMonth = this.#daysInMonth;
    const previousMonthData = this.#previousMonthData;
    const nextMonthData = this.#nextMonthData;
    const firstDay = this.#firstDayOfWeek;

    let rowIndex = 1;
    let columnIndex = 1;

    for (let i = 1; i <= firstDay; i++) {
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(
        this.#renderDayCell(
          previousMonthData.year,
          previousMonthData.month,
          previousMonthData.days - previousMonthData.firstDay + i - 1,
          rowIndex + 1,
          columnIndex,
          true
        )
      );
      columnIndex++;
    }

    for (let d = 1; d <= daysInMonth; d++) {
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
        rows[rowIndex].push(
          this.#renderDayCell(nextMonthData.year, nextMonthData.month, i, rowIndex + 1, columnIndex, true)
        );
      }
    }

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
                <button type="button" part="control control-previous" @click=${this.previousMonth}>◄</button>
                <button type="button" part="control control-today" @click=${this.today}>●</button>
                <button type="button" part="control control-next" @click=${this.nextMonth}>►</button>
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
            map(rows, (row, index) => html`<div role="row" part="row" aria-rowindex=${index + 1}>${row}</div>`)
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

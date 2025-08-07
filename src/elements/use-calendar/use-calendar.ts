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
// TODO slotchange event handler

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

  static styles = css`
    :host {
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

    [selected] {
      background-color: rgba(0, 0, 0, 0.25);
    }
  `;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    super.connectedCallback();
    this.value = this.getAttribute('value') || '';
  }

  firstUpdated() {
    this.#initializeTabbables();
  }

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
  navigation: 'on' | 'off' = 'on';
  get navigationEnabled() {
    return this.navigation === 'on';
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

    if (this.navigationEnabled && this.selectmode === 'single') {
      this.goTo(parsedValue[0]);
    }
  }

  get #daysInMonth() {
    return new Date(this.year, this.month, 0).getDate();
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
    return `${this.year}-${this.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
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

    // FIXME nested controls should keep tabindex when tabbing out of the grid
    // and they should be removed when clicking into a different cell
    focusableElements.forEach((el) => {
      el.setAttribute(INITIAL_TABINDEX_ATTR, getTabIndex(el));
      el.tabIndex = -1;
    });
  }

  renderDay: UseCalendarRenderDay = ({ day }) => String(day);

  #renderDayCell(day: number, rowIndex: number, columnIndex: number) {
    const date = this.getDateForDay(day);

    return html`
      <div
        @focusin=${this.#handleCellFocusIn}
        @focusout=${this.#handleCellFocusOut}
        part="day"
        ?selected=${this.selected.includes(date)}
        role="gridcell"
        data-usewc-day=${day}
        data-usewc-date=${date}
        tabindex="-1"
        aria-rowindex="${rowIndex}"
        aria-colindex="${columnIndex}"
      >
        <slot name="date-${date}">${this.renderDay({ day, date }, html)}</slot>
      </div>
    `;
  }

  public previousMonth() {
    this.month = this.month - 1;
    this.#initializeControls();
  }

  public today() {
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.#initializeControls();
  }

  public nextMonth() {
    this.month = this.month + 1;
    this.#initializeControls();
  }

  public goTo(yearOrDate: number | string, month?: number, day?: number) {
    if (typeof yearOrDate === 'string') {
      const [year, month, day] = yearOrDate.split('-').map(Number) as [number, number, number];
      this.year = year;
      this.month = month;
      this.#initializeControls(day);
    } else {
      this.year = yearOrDate;
      this.month = month || 1;

      if (day) this.#initializeControls(day);
    }
  }

  async #initializeControls(day = 1) {
    await this.updateComplete;
    this.#activeDay = day;
    this.#initializeTabbables();
  }

  focus() {
    this.gridBody.focus();
  }

  #activeDay = 1;

  #mouseDownTarget = null as HTMLElement | null;
  #handleMouseDown(event: MouseEvent) {
    this.#mouseDownTarget = this.#getTargetCell(event.target as HTMLElement);
    this.#activeDay = Number(this.#mouseDownTarget?.getAttribute('data-usewc-day')) || 1;
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
    const target = event.target as HTMLElement;
    const day = this.#getTargetCell(target);
    if (day) {
      if (this.selectmode === 'single') {
        this.value = day.getAttribute('data-usewc-date') || '';
      }

      if (this.navigationEnabled) {
        this.#activeDay = Number(day.getAttribute('data-usewc-day')) || 1;
        this.gridBody.setAttribute('tabindex', '-1');
      }
    }
  }

  #handleFocusIn(event: HTMLElementEventMap['focusin']) {
    const target = event.target as HTMLElement | null;
    const cell = this.shadowRoot?.querySelector(`[data-usewc-day="${this.#activeDay.toString()}"]`) as HTMLElement;

    this.gridBody.setAttribute('tabindex', '-1');

    if (event.target === this.gridBody) {
      this.#focusOnDay(this.#activeDay);
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
    const currentDay = this.#activeDay;
    let moveTo;
    if (event.key === 'ArrowRight') {
      moveTo = currentDay + 1;
    } else if (event.key === 'ArrowLeft') {
      moveTo = currentDay - 1;
    } else if (event.key === 'ArrowUp') {
      moveTo = Math.max(currentDay - 7, 1);
    } else if (event.key === 'ArrowDown') {
      moveTo = Math.min(currentDay + 7, this.#daysInMonth);
    }

    if (moveTo) {
      this.#focusOnDay(moveTo);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  #focusOnDay(moveTo: number) {
    this.#activeDay = moveTo;

    if (this.focusmode === 'control') {
      this.#focusableElements.get(this.getDateForDay(moveTo))?.[0]?.focus();
      return;
    }

    const target = this.shadowRoot?.querySelector(`[data-usewc-day="${moveTo.toString()}"]`);

    if (target) {
      (target as HTMLElement).focus();
    }
  }

  render() {
    const rows: Array<Array<TemplateResult | string>> = [];
    const daysInMonth = this.#daysInMonth;
    const firstDay = this.#firstDayOfWeek;

    let rowIndex = 1;
    let columnIndex = 1;

    for (let i = 0; i < firstDay; i++) {
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(
        html`<div part="grid-empty" role="gridcell" aria-rowindex="${rowIndex + 1}" aria-colindex="${columnIndex}">
          &nbsp;
        </div>`
      );
      columnIndex++;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const day = this.#renderDayCell(d, rowIndex + 1, columnIndex);
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(day);
      columnIndex++;
      if (columnIndex === 8) {
        rowIndex++;
        columnIndex = 1;
      }
    }

    const weekdayNames = this.#weekdayNames();
    return html`
      <div part="header">
        <slot name="header-start"></slot>
        <slot name="title" id="calendar-title">
          ${this.#title.map((part) => html`<span part="title-${part.type}">${part.value}</span>`)}
        </slot>
        <slot part="controls" name="controls">
          ${this.controls
            ? html`
                <button type="button" @click=${this.previousMonth}>◄</button>
                <button type="button" @click=${this.today}>●</button>
                <button type="button" @click=${this.nextMonth}>►</button>
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
          tabindex=${this.navigationEnabled ? '0' : '-1'}
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
}

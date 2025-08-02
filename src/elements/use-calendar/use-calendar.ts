import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '../use-calendarday/use-calendarday';
import { getDayNames } from '../../utils/date-time-aria-labels';
import { map } from 'lit/directives/map.js';

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

  renderDay: UseCalendarRenderDay = ({ day }) => String(day);

  #renderDayCell(day: number, rowIndex: number, columnIndex: number) {
    const date = this.getDateForDay(day);

    return html`
      <div
        part="day"
        ?selected=${this.selected.includes(date)}
        role="gridcell"
        use-day=${day}
        use-date=${date}
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
  }

  public today() {
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
  }

  public nextMonth() {
    this.month = this.month + 1;
  }

  public goTo(yearOrDate: number | string, month?: number, day?: number) {
    if (typeof yearOrDate === 'string') {
      const [year, month, day] = yearOrDate.split('-').map(Number) as [number, number, number];
      this.year = year;
      this.month = month;
      this.#activeDay = day;
    } else {
      this.year = yearOrDate;
      this.month = month || 1;

      if (day) this.#activeDay = day;
    }
  }

  focus() {
    this.gridBody.focus();
  }

  #activeDay = 1;

  #mouseDownTarget = null as HTMLElement | null;
  #handleMouseDown(event: MouseEvent) {
    this.#mouseDownTarget = (event.target as HTMLElement).closest('[part="day"]') as HTMLElement;
    this.#activeDay = Number(this.#mouseDownTarget?.getAttribute('use-day')) || 1;
  }

  #handleClick(event: HTMLElementEventMap['click']) {
    this.#mouseDownTarget = null;
    const target = event.target as HTMLElement;
    const day = target?.closest('[part="day"]');
    if (day) {
      if (this.selectmode === 'single') {
        this.value = day.getAttribute('use-date') || '';
      }

      if (this.navigationEnabled) {
        this.#activeDay = Number(day.getAttribute('use-day')) || 1;
        this.gridBody.setAttribute('tabindex', '-1');
      }
    }
  }

  #handleFocusIn(event: HTMLElementEventMap['focusin']) {
    let target = event.target as HTMLElement | null;

    if (this.#mouseDownTarget) {
      target = this.#mouseDownTarget;
    } else if (target === this.gridBody) {
      target = this.shadowRoot?.querySelector(`[use-day="${this.#activeDay.toString()}"]`) as HTMLElement;
    }

    target?.focus();
    this.gridBody.setAttribute('tabindex', '-1');
  }

  #handleFocusOut(event: HTMLElementEventMap['focusout']) {
    if (event.relatedTarget === this) {
      this.gridBody.setAttribute('tabindex', '-1');
      return;
    }

    if (this.contains(event.relatedTarget as Node)) {
      return;
    }

    this.gridBody.setAttribute('tabindex', '0');
  }

  #handleKeyDown(event: HTMLElementEventMap['keydown']) {
    const currentDay = Number(this.#activeDay);
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
      const target = this.shadowRoot?.querySelector(`[use-day="${moveTo.toString()}"]`);
      if (target) {
        (target as HTMLElement).focus();
        event.preventDefault();
        event.stopPropagation();
        this.#activeDay = moveTo;
      }
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
          ${map(rows, (row, index) => html`<div role="row" part="row" aria-rowindex=${index + 1}>${row}</div>`)}
        </div>
      </div>
    `;
  }
}

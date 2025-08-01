import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '../use-calendarday/use-calendarday';
import { getDayNames } from '../../utils/date-time-aria-labels';

// TODO `controls` and `controlslist` attributes
// TODO slotchange event handler

/**
 * Displays a calendar grid of the current month.
 *
 * @slot - Calendar content
 */
@customElement('use-calendar')
export class UseCalendar extends LitElement {
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
  `;

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

  @property({ type: Boolean, attribute: true, reflect: true })
  navigation: boolean = false;

  @query('[part="grid-body"]')
  gridBody!: HTMLDivElement;

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

  renderDay({ day }: { day: number; date: string }): TemplateResult | string {
    return String(day);
  }

  #renderDayCell(day: number, rowIndex: number, columnIndex: number) {
    const date = this.getDateForDay(day);

    return html`
      <div
        part="day"
        role="gridcell"
        use-day=${day}
        tabindex="-1"
        aria-rowindex="${rowIndex}"
        aria-colindex="${columnIndex}"
      >
        <slot name="date-${date}">${this.renderDay({ day, date })}</slot>
      </div>
    `;
  }

  previousMonth() {
    this.month = this.month - 1;
  }

  today() {
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
  }

  nextMonth() {
    this.month = this.month + 1;
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
      this.#activeDay = Number(day.getAttribute('use-day')) || 1;
      this.gridBody.setAttribute('tabindex', '-1');
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
          tabindex=${this.navigation ? '0' : '-1'}
          @focusin=${this.navigation ? this.#handleFocusIn : undefined}
          @focusout=${this.navigation ? this.#handleFocusOut : undefined}
          @mousedown=${this.navigation ? this.#handleMouseDown : undefined}
          @click=${this.navigation ? this.#handleClick : undefined}
          @keydown=${this.navigation ? this.#handleKeyDown : undefined}
        >
          ${rows.map((row, index) => html`<div role="row" part="row" aria-rowindex=${index + 1}>${row}</div>`)}
        </div>
      </div>
    `;
  }
}

import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const TODAY = new Date().toISOString().split('T')[0];

@customElement('use-calendarday')
export class UseCalendarday extends LitElement {
  #internals: ElementInternals;

  protected createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  static styles = css`
    :host:state(today) {
      font-weight: 700;
    }
  `;

  @property()
  date!: string;

  get day() {
    return new Date(this.date).getUTCDate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = `date-${this.date}`;
    if (this.date === TODAY) {
      this.#internals.states.add('today');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-calendarday': UseCalendarday;
  }
}

import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('use-calendarday')
export class UseCalendarday extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @property()
  date!: string;

  get day() {
    return new Date(this.date).getUTCDate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = `date-${this.date}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-calendarday': UseCalendarday;
  }
}

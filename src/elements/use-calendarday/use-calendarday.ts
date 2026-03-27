import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A helper component for customizing specific days within `use-calendar`.
 * Content placed inside this element will replace the default day number display.
 *
 * @slot default - slot for custom day content (replaces the day number)
 */
@customElement("use-calendarday")
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
    "use-calendarday": UseCalendarday;
  }
}

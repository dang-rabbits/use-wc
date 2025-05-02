import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('use-gridrow')
export class UseGridRow extends LitElement {
  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  value = '';

  updated() {
    this.setAttribute('role', 'row');
    this.toggleAttribute('aria-selected', this.selected);
    this.toggleAttribute('aria-disabled', this.disabled);
  }

  render() {
    return html`
      <slot name="selected-indicator" part="selected-indicator" aria-hidden="true">
        <span part="selected-indicator-default">✔</span>
      </slot>
      <slot></slot>
    `;
  }

  static styles = css`
    :host {
      display: flex;
    }
    :host([disabled]) {
      opacity: 0.5;
    }
    [part='selected-indicator'] {
      visibility: hidden;
    }
    :host([selected]) [part='selected-indicator'] {
      visibility: visible;
    }
    ::slotted(use-gridcell) {
      flex: 1 1 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-gridrow': UseGridRow;
  }
}

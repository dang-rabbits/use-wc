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

  firstUpdated() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'row');
    }
  }

  updated() {
    this.toggleAttribute('aria-selected', this.selected);
    this.toggleAttribute('aria-disabled', this.disabled);
  }

  render() {
    return html`
      <slot name="selected-indicator" part="selected-indicator"></slot>
      <slot name="deselected-indicator" part="deselected-indicator"></slot>
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
    :host-context(:is(use-grid[selectmode='none'])) :is([part='deselected-indicator'], [part='selected-indicator']) {
      display: none;
    }
    :is([part='selected-indicator'], [part='deselected-indicator']) {
      width: 1lh;
      height: 1lh;
    }
    [part='deselected-indicator'] {
      visibility: visible;
      display: initial;
    }
    [part='selected-indicator'] {
      visibility: hidden;
      display: none;
    }
    :host([selected]) [part='selected-indicator'] {
      visibility: visible;
      display: initial;
    }
    :host([selected]) [part='deselected-indicator'] {
      visibility: hidden;
      display: none;
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

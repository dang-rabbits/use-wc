import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

// import '@gfellerph/focusgroup-polyfill';

/**
 * `use-focusgroup` is a polyfill for the proposed focusgroup attribute.
 *
 * @slot
 */
@customElement('use-focusgroup')
export class UseFocusgroup extends LitElement {
  #focusableElements = [];
  #currentIndex = -1;

  firstUpdated() {
    this.#focusableElements = Array.from(
      this.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')
    );

    this.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        console.log()
      }
    });
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-focusgroup': UseFocusgroup
  }
}

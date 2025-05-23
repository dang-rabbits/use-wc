import { property } from 'lit/decorators.js';
import { UseWidget } from '../use-widget/use-widget';
import { tabbable } from 'tabbable';

export class UseGridCell extends UseWidget {
  @property({ type: String, reflect: true })
  mode: 'widget' | 'action' | 'default' = 'default';
  #action: HTMLElement | null = null;

  connectedCallback() {
    if (this.mode === 'widget') {
      super.connectedCallback();
    }

    // Role will be set by parent context (header/body)
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'gridcell');
    }

    setTimeout(() => {
      this.#initializeActions();
    }, 0);

    this.tabIndex = -1;
  }

  #initializeActions() {
    if (this.mode === 'action') {
      tabbable(this).forEach((el) => {
        el.tabIndex = -1;
        if (!this.#action) {
          this.#action = el as HTMLElement;
        }
      });

      this.addEventListener('focusin', () => {
        if (this.#action) {
          this.#action.focus();
          this.tabIndex = -1;
        }
      });

      this.addEventListener('focusout', (e) => {
        if (!this.closest('use-grid')?.contains(e.relatedTarget as HTMLElement)) {
          this.tabIndex = 0;
        }
      });
    }
  }
}

customElements.define('use-gridcell', UseGridCell);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridcell': UseGridCell;
  }
}

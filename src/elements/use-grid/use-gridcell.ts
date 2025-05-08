import { property } from 'lit/decorators.js';
import { UseWidget } from '../use-widget/use-widget';

export class UseGridCell extends UseWidget {
  @property({ type: String, reflect: true })
  mode: 'widget' | 'action' | 'default' = 'default';

  connectedCallback() {
    if (this.mode === 'widget') {
      super.connectedCallback();
    }

    if (this.mode === 'action') {
      this.setAttribute('tabindex', '0');
    }

    // Role will be set by parent context (header/body)
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'gridcell');
    }

    this.tabIndex = -1;
  }

  focus() {
    // FIXME arrow kay nav is not working when action el is focused
    if (this.mode === 'action') {
      // TODO convert to `tabbable()`
      this.querySelector('button, a')?.focus();
    } else {
      super.focus();
    }
  }
}

customElements.define('use-gridcell', UseGridCell);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridcell': UseGridCell;
  }
}

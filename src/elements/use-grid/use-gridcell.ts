import { property } from 'lit/decorators.js';
import { UseWidget } from '../use-widget/use-widget';

export class UseGridCell extends UseWidget {
  @property({ type: String, reflect: true })
  mode: 'widget' | 'default' = 'default';

  connectedCallback() {
    if (this.getAttribute('mode') === 'widget') {
      super.connectedCallback();
    }

    // Role will be set by parent context (header/body)
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'gridcell');
    }

    this.tabIndex = -1;
  }
}

customElements.define('use-gridcell', UseGridCell);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridcell': UseGridCell;
  }
}

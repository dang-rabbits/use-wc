import { UseWidget } from '../use-widget/use-widget';
import { UseGridCell } from './use-gridcell';

export class UseGridCellWidget extends UseWidget {
  connectedCallback() {
    super.connectedCallback();
    UseGridCell.prototype.connectedCallback.call(this);
  }
}

customElements.define('use-gridcellwidget', UseGridCellWidget);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridcellwidget': UseGridCellWidget;
  }
}

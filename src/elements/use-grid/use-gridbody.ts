export class UseGridBody extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'rowgroup');
  }
}

customElements.define('use-gridbody', UseGridBody);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridbody': UseGridBody;
  }
}

export class UseGridHead extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'rowgroup');
  }
}

customElements.define('use-gridhead', UseGridHead);

declare global {
  interface HTMLElementTagNameMap {
    'use-gridhead': UseGridHead;
  }
}

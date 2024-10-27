import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {  GapType } from '../../styles/gap';


/**
 * An example element.
 *
 * @slot - This element has a slot
 */
@customElement('flex-layout')
export class FlexLayout extends LitElement {
  @property()
  direction?: 'row' | 'column';

  @property()
  align?: 'start' | 'center' | 'end';

  @property()
  justify?: 'start' | 'center' | 'end';

  @property({ type: Boolean })
  fill?: boolean;

  @property({ type: Boolean })
  inline?: boolean;

  @property()
  gap?: GapType;

  render() {
    return html`<slot></slot>`;
  }

  protected createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'flex-layout': FlexLayout
  }
}

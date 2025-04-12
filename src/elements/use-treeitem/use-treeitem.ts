import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import createId from '../../utils/create-id';

/**
 * `use-option` is a custom element that represents an option in a `use-select` custom element.
 *
 * The children of this element are the content of the option and must not contain any interactive elements.
 *
 * ## To Do
 *
 * - [ ] When the parent is no longer disabled, update the items without their own `[disabled]`
 *
 * @slot selected-indicator
 * @slot
 */
@customElement('use-treeitem')
export class UseTreeitem extends LitElement {
  @property({ type: Boolean })
  set selected(flag) {
    if (flag) {
      this.#internals.states.add('selected');
    } else {
      this.#internals.states.delete('selected');
    }
  }

  get selected() {
    return this.#internals.states.has('selected');
  }

  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add('disabled');
    } else {
      this.#internals.states.delete('disabled');
    }
  }

  get disabled() {
    return this.#internals.states.has('disabled') && !this.#isParentDisabled();
  }

  @property({ type: Boolean })
  set expanded(flag) {
    if (flag) {
      this.#internals.states.add('expanded');
    } else {
      this.#internals.states.delete('expanded');
    }
  }

  get expanded() {
    return this.#internals.states.has('expanded');
  }

  @property()
  set value(v: string | null) {
    if (v != null) {
      this.setAttribute('value', v);
    }
  }

  get value() {
    return this.getAttribute('value') ?? this.textContent;
  }

  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();

    if (!this.id) {
      this.id = createId();
    }

    /**
     * Boolean attributes are reflected as true if they are present on the
     * element, we do not need to check for [attr]==='false'
     *
     * @link https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
     */
    if (this.hasAttribute('selected')) {
      this.#internals.states.add('selected');
    }

    if (this.hasAttribute('disabled') || this.#isParentDisabled()) {
      this.#internals.states.add('disabled');
    }

    if (this.parentElement instanceof UseTreeitem) {
      this.slot = 'tree-items';
    }

    if (this.querySelector('use-treeitem')) {
      this.#internals.states.add('has-children');
    }
  }

  #isParentDisabled() {
    return this.parentElement instanceof UseTreeitem && this.parentElement.hasAttribute('disabled');
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  firstUpdated() {
    this.role = 'treeitem';
  }

  render() {
    return html`
      <div part="content" .aria-expanded=${this.expanded ? 'true' : 'false'}>
        <div part="toggle-indicator" aria-hidden="true" @click=${this.toggle}>
          <slot name="expanded-indicator" part="expanded-indicator">
            <span part="expanded-indicator-default">-</span>
          </slot>
          <slot name="collapsed-indicator" part="collapsed-indicator">
            <span part="collapsed-indicator-default">+</span>
          </slot>
        </div>
        <slot name="selected-indicator" part="selected-indicator" aria-hidden="true">
          <span part="selected-indicator-default">✔</span>
        </slot>
        <slot></slot>
      </div>
      <div part="tree-items" role="group">
        <slot name="tree-items"></slot>
      </div>
    `;
  }

  /**
   * Consumers will need to override the `::after` pseudo-element if they want
   * to customize it until `:has-slotted` pseudo-class is available
   *
   * @link https://github.com/w3c/csswg-drafts/issues/6867
   */
  static styles = css`
    :host {
      display: block;
      cursor: default;
    }

    slot[name='selected-indicator'] {
      display: contents;
      visibility: hidden;
    }

    slot[name='selected-indicator'],
    slot[name='expanded-indicator'],
    slot[name='collapsed-indicator'] {
      font-family: monospace;
    }

    slot[name='expanded-indicator'] {
      display: none;
    }

    slot[name='collapsed-indicator'] {
      display: contents;
    }

    [part='toggle-indicator'] {
      visibility: hidden;
      display: contents;
    }

    :host(:state(has-children)) [part='toggle-indicator'] {
      visibility: visible;
    }

    :host(:state(expanded)) slot[name='collapsed-indicator'] {
      display: none;
    }

    :host(:state(expanded)) slot[name='expanded-indicator'] {
      display: contents;
    }

    :host(:state(selected)) slot[name='selected-indicator'] {
      visibility: visible;
    }

    :host(:state(disabled)) {
      opacity: 0.5;
    }

    ::slotted(use-treeitem) {
      padding-inline-start: 1rem;
      display: none;
    }

    :host(:state(expanded)) ::slotted(use-treeitem) {
      display: block;
    }

    [part='content'] {
      display: flex;
      align-items: center;
    }

    :host(:focus) [part='content'],
    [part='content']:hover {
      outline: none;
      background-color: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-treeitem': UseTreeitem;
  }
}

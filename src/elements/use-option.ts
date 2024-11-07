import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * `use-option` is a custom element that represents an option in a `use-select` custom element.
 *
 * The children of this element are the content of the option and must not contain any interactive elements.
 *
 * @slot selected-indicator
 * @slot
 */
@customElement('use-option')
export class UseOption extends LitElement {
  @property({ type: Boolean })
  set selected(flag) {
    if (flag) {
      this.#internals.states.add("selected");
    } else {
      this.#internals.states.delete("selected");
    }
  }

  get selected() {
    return this.#internals.states.has("selected");
  }

  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add("disabled");
    } else {
      this.#internals.states.delete("disabled");
    }
  }

  get disabled() {
    return this.#internals.states.has("disabled");
  }

  @property()
  set value(v: string | null) {
    if (v != null) {
      this.setAttribute('value', v);
    }
  };

  get value() {
    return this.getAttribute('value') ?? this.textContent;
  }

  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();

    if (!this.id) {
      this.id = ':' + Math.random().toString(36).substring(2, 6) + ':';
    }

    /**
     * Boolean attributes are reflected as true if they are present on the
     * element, we do not need to check for [attr]==='false'
     *
     * @link https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
     */
    if (this.hasAttribute("selected")) {
      this.#internals.states.add("selected");
    }

    if (this.hasAttribute("disabled")) {
      this.#internals.states.add("disabled");
    }
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  setActive(value: boolean) {
    if (value) {
      this.#internals.states.add("active");
    } else {
      this.#internals.states.delete("active");
    }
  }

  render() {
    return html`
      <slot part="selected-indicator" name="selected-indicator">
        <span part="selected-indicator-default">✔</span>
      </slot>
      <slot></slot>
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
      display: flex;
      cursor: default;
    }

    slot[name="selected-indicator"] {
      visibility: hidden;
    }

    :host(:state(selected)) slot[name="selected-indicator"] {
      visibility: visible;
    }

    :host(:is(:state(active), :hover)) {
      background-color: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }

    :host(:state(disabled)) {
      color: light-dark(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.5));
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-option': UseOption
  }
}

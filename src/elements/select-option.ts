import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * `select-option` is a custom element that represents an option in a `select-next` custom element.
 *
 * The children of this element are the content of the option and must not contain any interactive elements.
 *
 * @slot NodeList of `select-option` elements
 * @slot arrow
 */
@customElement('select-option')
export class SelectOption extends LitElement {
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

    /**
     * Boolean attributes are reflected as true if they are present on the
     * element, we do not need to check for [attr]==='false'
     *
     * @link https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
     */
    if (this.hasAttribute("selected")) {
      this.#internals.states.add("selected");
    }
  }

  toggleSelected() {
    this.selected = !this.selected;
  }

  render() {
    return html`<button>
      <slot part="selected-indicator" name="selected-indicator">
        <span part="selected-indicator-default">✔</span>
      </slot>
      <slot></slot>
    </button>`;
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
    }

    button {
      appearance: none;
      all: unset;
    }

    slot[name="selected-indicator"] {
      visibility: hidden;
    }

    :host(:state(selected)) slot[name="selected-indicator"] {
      visibility: visible;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'select-option': SelectOption
  }
}

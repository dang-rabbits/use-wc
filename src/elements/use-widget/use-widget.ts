import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FocusableElement, getTabIndex, tabbable } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'usewcInitialTabindex';

/**
 * `use-widget` is a polyfill for the proposed focusgroup attribute.
 *
 * Nested controls are removed from the tab flow until the user activates the widget with `Enter` or `F2`. Clicking on a control will also activate the widget. Widgets are deactivated with `Escape` or `F2` keys or when the user clicks outside of the widget.
 *
 * - [ ] Convert to a standard web component instead of LitElement
 *
 * @slot
 */
@customElement('use-widget')
export class UseWidget extends LitElement {
  #active: boolean = false;
  #tabbables: FocusableElement[] = [];

  createRenderRoot() {
    return this;
  }

  initializeWidget() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    this.#tabbables = tabbable(this);
    this.#tabbables.forEach((element) => {
      element.dataset[INITIAL_TABINDEX_ATTR] = String(getTabIndex(element));
      element.tabIndex = -1;
    });
  }

  enableWidget(autofocus: boolean = false) {
    if (!this.#active) {
      this.#active = true;
      this.#tabbables.forEach((element) => {
        if (element.dataset[INITIAL_TABINDEX_ATTR]) {
          element.tabIndex = parseInt(element.dataset[INITIAL_TABINDEX_ATTR]);
        }
      });

      if (autofocus) {
        this.#tabbables.at(0)?.focus();
      }
    }
  }

  disableWidget(returnFocus: boolean = true) {
    if (this.#active) {
      this.#active = false;
      this.#tabbables.forEach((element) => {
        if (element.dataset[INITIAL_TABINDEX_ATTR]) {
          element.tabIndex = -1;
        }
      });

      if (returnFocus) {
        this.focus();
      }
    }
  }

  firstUpdated() {
    this.initializeWidget();

    this.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Enter':
          this.enableWidget(true);
          break;

        case 'Escape':
          this.disableWidget();
          break;

        case 'F2':
          if (this.#active) {
            this.disableWidget();
          } else {
            this.enableWidget(true);
          }
          break;
      }
    });

    this.addEventListener('click', () => {
      this.enableWidget();
    });

    this.addEventListener('blur', (event) => {
      if (!this.contains(event.relatedTarget as Node)) {
        this.disableWidget(false);
      }
      // `blur` doesn't bubble up so we need to capture it: https://stackoverflow.com/a/49311941/28250656
    }, true);
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-widget': UseWidget
  }
}

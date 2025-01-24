import { customElement } from 'lit/decorators.js'
import { getTabIndex, tabbable } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'data-usewc-focusgroup-tabindex';

/**
 * Nested controls are removed from the tab flow until the user navigates the nested controls with arrow keys.
 *
 * `use-focusgroup` is most useful for things like WYSIWYG toolbars, sets of tabs, or lists of navigation links (like a list of emails in a master detail layout).
 *
 * ## To do
 *
 * - [ ] add `axis=inline|block` attribute
 * - [ ] add `nomemory` attribute
 *
 * ## Sources
 *
 * - [tabbable](https://www.npmjs.com/package/tabbable)
 * - [Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
 */
@customElement('use-focusgroup')
export class UseFocusgroup extends HTMLElement {
  #tabbables: HTMLElement[] = [];

  connectedCallback() {
    window.requestAnimationFrame(() => {
      this.#initializeTabbables();
    })
    this.#initializeListeners();
  }

  #initializeListeners() {
    this.addEventListener('keydown', (event) => {
      let moveTo = -1;
      const target = event.target as HTMLElement;
      switch (event.key) {
        case 'ArrowRight':
        // case 'ArrowDown':
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex = this.#tabbables.indexOf(event.target as HTMLElement);

          if (currentIndex < this.#tabbables.length - 1) {
            moveTo = currentIndex + 1;
          } else {
            moveTo = 0;
          }

          break;

        case 'ArrowLeft':
        // case 'ArrowUp':
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex2 = this.#tabbables.indexOf(event.target as HTMLElement);

          if (currentIndex2 > 0) {
            moveTo = currentIndex2 - 1;
          } else {
            moveTo = this.#tabbables.length - 1;
          }

          break;
      }

      if (moveTo > -1) {
        event.preventDefault();
        event.stopPropagation();

        const targetEl = this.#tabbables[moveTo];
        targetEl.focus();

        if (this.getAttribute('no-memory') === null) {
          this.#tabbables.forEach((element) => {
            if (element.getAttribute(INITIAL_TABINDEX_ATTR)) {
              element.setAttribute('tabindex', '-1');
            }
          });

          const tabindex = targetEl.getAttribute(INITIAL_TABINDEX_ATTR);
          if (tabindex === 'default') {
            targetEl.removeAttribute('tabindex');
          } else if (tabindex) {
            targetEl.setAttribute('tabindex', tabindex);
          }
        }
      }
    });
  }

  #findTabbables() {
    return tabbable(this, { getShadowRoot: true }).map((node) => {
      // @ts-expect-error - `getRootNode` doesn't return an object with `host` but it works in the browser
      return node.getRootNode()?.host ?? node;
    });
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus && element.getAttribute('tabindex') === null) {
      return '0';
    }

    if (element.getAttribute('tabindex') === null) {
      return 'default';
    }

    return String(getTabIndex(element));
  }

  #initializeTabbables() {
    this.#tabbables = this.#findTabbables();
    this.#tabbables.forEach((element, index) => {
      element.setAttribute(INITIAL_TABINDEX_ATTR, this.#getTabIndex(element));

      if (index > 0) {
        element.setAttribute('tabindex', '-1');
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-focusgroup': UseFocusgroup
  }
}

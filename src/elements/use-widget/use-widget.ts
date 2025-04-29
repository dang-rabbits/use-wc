import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getTabIndex, isTabbable } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'data-usewc-widget-tabindex';

/**
 * Nested controls are removed from the tab flow until the user activates the widget with `Enter` or `F2`. Clicking on a control will also activate the widget. Widgets are deactivated with `Escape` or `F2` keys or when the user clicks outside of the widget.
 *
 * `use-widget` can be used for easily navigating customizable dashboard widgets that contain multiple interactive elements. It can also be used for table and grid cells that contain multiple interactive elements, as described in the [WCAG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
 *
 * ## To do
 *
 * - [ ] Convert to a standard web component instead of LitElement
 * - [ ] implement Arrow Key navigation for tabbable elements when activated
 *
 * ## Sources
 *
 * - [tabbable](https://www.npmjs.com/package/tabbable)
 * - [Grid (Interactive Tabular Data and Layout Containers) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
 *
 * @slot
 */
@customElement('use-widget')
export class UseWidget extends LitElement {
  #active: boolean = false;
  #tabbables: HTMLElement[] = [];

  createRenderRoot() {
    return this;
  }

  #findTabbables() {
    const walker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (node instanceof HTMLElement && (isTabbable(node) || node.shadowRoot?.delegatesFocus)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    });

    const elements = [];
    while (walker.nextNode()) {
      elements.push(walker.currentNode);
    }

    return elements as HTMLElement[];
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus && element.getAttribute('tabindex') === null) {
      return '0';
    }

    return String(getTabIndex(element));
  }

  initializeWidget() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    this.#tabbables = this.#findTabbables();
    this.#tabbables.forEach((element) => {
      element.setAttribute(INITIAL_TABINDEX_ATTR, this.#getTabIndex(element));
      element.setAttribute('tabindex', '-1');
    });

    this.#unwatchMutations();
    this.#watchMutations();
  }

  enableWidget(autofocus: boolean = true) {
    if (!this.#active) {
      this.#active = true;
      this.setAttribute('active', '');
      this.#tabbables.forEach((element) => {
        const tabindex = element.getAttribute(INITIAL_TABINDEX_ATTR);
        if (tabindex) {
          element.setAttribute('tabindex', tabindex);
        }
      });

      if (autofocus) {
        this.#tabbables.at(0)?.focus();
      }

      this.setAttribute('tabindex', '-1');
    }
  }

  disableWidget(returnFocus: boolean = true) {
    if (this.#active) {
      this.#active = false;
      this.removeAttribute('active');

      this.#tabbables.forEach((element) => {
        if (element.getAttribute(INITIAL_TABINDEX_ATTR)) {
          element.setAttribute('tabindex', '-1');
        }
      });

      if (returnFocus) {
        this.focus();
      }

      this.setAttribute('tabindex', '0');
    }
  }

  firstUpdated() {
    this.initializeWidget();

    this.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;

      switch (event.key) {
        case 'Enter':
          this.enableWidget();
          break;

        case 'Escape':
          this.disableWidget();
          break;

        case 'F2':
          if (this.#active) {
            this.disableWidget();
          } else {
            this.enableWidget();
          }
          break;
      }

      if (!this.#active) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex = this.#tabbables.indexOf(event.target as HTMLElement);

          if (currentIndex < this.#tabbables.length - 1) {
            this.#tabbables[currentIndex + 1].focus();
          } else {
            this.#tabbables[0].focus();
          }

          event.preventDefault();
          event.stopPropagation();

          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex2 = this.#tabbables.indexOf(event.target as HTMLElement);

          if (currentIndex2 > 0) {
            this.#tabbables[currentIndex2 - 1].focus();
          } else {
            this.#tabbables[this.#tabbables.length - 1].focus();
          }

          event.preventDefault();
          event.stopPropagation();

          break;
      }
    });

    this.addEventListener('click', () => {
      this.enableWidget(false);
    });

    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget as Node)) {
        this.disableWidget(false);
      }
    });

    this.addEventListener(
      'toggle',
      () => {
        this.initializeWidget();
      },
      true
    );
  }

  disconnectedCallback() {
    this.#unwatchMutations();
  }

  #observer: MutationObserver | null = null;
  #watchMutations() {
    if (this.#observer) {
      return;
    }

    this.#observer = new MutationObserver(() => {
      this.initializeWidget();
    });
    this.#observer.observe(this, { attributes: false, childList: true, subtree: true });
  }

  #unwatchMutations() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'use-widget': UseWidget;
  }
}

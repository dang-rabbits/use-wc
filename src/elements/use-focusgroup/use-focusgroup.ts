import { getTabIndex, tabbable } from 'tabbable';

const INITIAL_TABINDEX_ATTR = 'data-usewc-focusgroup-tabindex';
const INITIAL_TABINDEX_VALUE = 'initial';

function isUseFocusgroup(element: HTMLElement): element is UseFocusgroup {
  return element instanceof UseFocusgroup;
}

/**
 * Nested controls are removed from the tab flow until the user navigates the nested controls with arrow keys.
 *
 * `use-focusgroup` is most useful for things like WYSIWYG toolbars, sets of tabs, or lists of navigation links (like a list of emails in a master detail layout).
 *
 * ## To do
 *
 * - [ ] add `grid` navigation feature
 * - [ ] add `autofocus` attribute support
 *
 * ## Long term plan
 *
 * This web component was built with the intent to be replaced by browser-native focusgroup support once it becomes baseline. Hopefully migration will be as simple as changing the tag name from `use-focusgroup` to `div` and the `options` attribute to `focusgroup`.
 *
 * <baseline-status featureId="focusgroup_attribute"></baseline-status>
 *
 * ## Sources
 *
 * - [Open UI focusgroup Explainer](https://open-ui.org/components/focusgroup.explainer/)
 * - [tabbable](https://www.npmjs.com/package/tabbable)
 * - [Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
 * - [@gfellerph/focusgroup-polyfill](https://github.com/gfellerph/focusgroup-polyfill)
 */
export class UseFocusgroup extends HTMLElement {
  static observedAttributes = ['features'];

  /**
   * A list of space-separated features that can be used to customize the behavior of the focusgroup.
   *
   * The following options are available:
   *
   * - `inline` opts into keyboard navigation via left and right arrow keys
   * - `block` opts into keyboard navigation via up and down arrow keys
   * - `wrap` arrow navigation should wrap around when reaching the end
   * - `no-memory` whether the focusgroup should not remember the last focused element
   *
   * If nothing if neither `inline` nor `block` is specified, both are assumed.
   *
   * @attr {string} features
   */
  features: string = '';

  /**
   * The most recently focused element in the focusgroup.
   */
  focusedElement: HTMLElement | null = null;

  #tabbables: HTMLElement[] = [];
  #arrowLeftKey!: string;
  #arrowRightKey!: string;
  #arrowDownKey!: string;
  #arrowUpKey!: string;
  #noMemory: boolean = false;
  #wrap: boolean = true;
  #parent: HTMLElement | null | undefined = null;
  #nested: boolean = false;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#initializeFeatures();
    this.#parent = this.parentElement?.closest('use-focusgroup');
    this.#nested = this.#parent != null;

    setTimeout(() => {
      this.#initializeTabbables();
    }, 0);
    this.#initializeListeners();
  }

  #initializeFeatures() {
    this.features = this.getAttribute('features') ?? '';
    const features = ` ${this.features} `;
    const inline = features.includes(' inline ');
    const block = features.includes(' block ');
    const both = (!block && !inline) || (block && inline);

    this.#arrowLeftKey = both || inline ? 'ArrowLeft' : 'ArrowLeft-DISABLED';
    this.#arrowRightKey = both || inline ? 'ArrowRight' : 'ArrowRight-DISABLED';
    this.#arrowDownKey = both || block ? 'ArrowDown' : 'ArrowDown-DISABLED';
    this.#arrowUpKey = both || block ? 'ArrowUp' : 'ArrowUp-DISABLED';
    this.#noMemory = features.includes(' no-memory ');
    this.#wrap = features.includes(' wrap ');
  }

  attributeChangedCallback(name: string) {
    if (name === 'features') {
      this.#initializeFeatures();
    }
  }

  #initializeListeners() {
    this.addEventListener('keydown', (event) => {
      let moveTo = -1;
      const target = event.target as HTMLElement;
      const parent = target.closest('use-focusgroup');

      switch (event.key) {
        case this.#arrowRightKey:
        case this.#arrowDownKey:
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex = this.#tabbables.indexOf((this === parent ? event.target : parent) as HTMLElement);

          if (currentIndex < this.#tabbables.length - 1) {
            moveTo = currentIndex + 1;
          } else if (this.#wrap) {
            moveTo = 0;
          }

          break;

        case this.#arrowLeftKey:
        case this.#arrowUpKey:
          if (target.matches('select, input, textarea')) {
            break;
          }

          const currentIndex2 = this.#tabbables.indexOf((this === parent ? event.target : parent) as HTMLElement);

          if (currentIndex2 > 0) {
            moveTo = currentIndex2 - 1;
          } else if (this.#wrap) {
            moveTo = this.#tabbables.length - 1;
          }

          break;
      }

      if (moveTo > -1) {
        event.preventDefault();
        event.stopPropagation();

        this.#tabbables[moveTo].focus();
      }
    });

    this.addEventListener('focusout', (event) => {
      if (!this.contains(event.relatedTarget as HTMLElement)) {
        return;
      }

      if (this.#nested && this.#parent?.contains(event.target as HTMLElement)) {
        this.#removeTabbable(event.target as HTMLElement);
      }

      if (!this.#nested) {
        this.#removeTabbable(event.target as HTMLElement);
      }
    });

    this.addEventListener('focusin', (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.#makeTabbable(event.target as HTMLElement);
    });
  }

  focus() {
    if (this.focusedElement) {
      this.focusedElement.focus();
    } else {
      this.#tabbables[0].focus();
    }
  }

  #makeTabbable(element?: HTMLElement | null) {
    if (element == null) {
      return;
    }

    if (!this.#noMemory) {
      this.focusedElement = element;
      this.#tabbables.forEach((element) => {
        this.#removeTabbable(element);
      });

      if (isUseFocusgroup(element)) {
        // element.promoteFocusable();
      } else {
        const tabindex = element.getAttribute(INITIAL_TABINDEX_ATTR);
        if (tabindex === INITIAL_TABINDEX_VALUE) {
          element.removeAttribute('tabindex');
        } else if (tabindex) {
          element.setAttribute('tabindex', tabindex);
        }
      }
    }
  };

  #removeTabbable(element: HTMLElement) {
    if (this.#noMemory) {
      return;
    }

    if (!isUseFocusgroup(element) && element.getAttribute(INITIAL_TABINDEX_ATTR)) {
      element.setAttribute('tabindex', '-1');
    }
  }

  #findTabbables() {
    const allTabbables = tabbable(this, { getShadowRoot: true });
    const filteredTabbables = [];

    let parentPushed = false;
    for (const node of allTabbables) {
      const parent = node.closest('use-focusgroup');
      if (this !== parent) {
        if (this.contains(parent) && !parentPushed) {
          filteredTabbables.push(parent);
          parentPushed = true;
        }
      } else {
        filteredTabbables.push(node);
        parentPushed = false;
      }
    }

    return filteredTabbables.map((node) => {
      // @ts-expect-error - `getRootNode` doesn't return an object with `host` but it works in the browser
      return node.getRootNode()?.host ?? node;
    });
  }

  #getTabIndex(element: HTMLElement) {
    if (element.shadowRoot?.delegatesFocus && element.getAttribute('tabindex') === null) {
      return '0';
    }

    if (element.getAttribute('tabindex') === null) {
      return INITIAL_TABINDEX_VALUE;
    }

    return String(getTabIndex(element));
  }

  #initializeTabbables() {
    this.#tabbables = this.#findTabbables();
    this.#resetTabbables();
  }

  #promoted = false;

  /**
   * Whether the use-focusgroup is promoted to the top of the tab order inside a parent use-focusgroup.
   *
   * @prop {boolean} promoted
   * @readonly
   * @default false
   */
  get promoted() {
    return this.#promoted;
  }

  /**
   * Promotes the use-focusgroup to the top of the tab order inside a parent use-focusgroup.
   */
  promote() {
    this.#promoted = true;
  }

  #resetTabbables() {
    this.#tabbables.forEach((element, index) => {
      if (isUseFocusgroup(element)) {
        if (index === 0) {
          element.promote();
        }

        return;
      }

      if (!element.hasAttribute(INITIAL_TABINDEX_ATTR)) {
        element.setAttribute(INITIAL_TABINDEX_ATTR, this.#getTabIndex(element));
      }

      if (this.#noMemory || (index === 0 && !this.focusedElement)) {
        this.focusedElement = element;
      }

      if ((this.#nested && !this.#promoted) || index > 0) {
        element.setAttribute('tabindex', '-1');
      }
    });
  }
}

customElements.define('use-focusgroup', UseFocusgroup);

declare global {
  interface HTMLElementTagNameMap {
    'use-focusgroup': UseFocusgroup
  }
}

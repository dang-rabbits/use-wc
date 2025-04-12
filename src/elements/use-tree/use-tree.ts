import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import createId from '../../utils/create-id';
import { UseTreeitem } from '../use-treeitem/use-treeitem';

const FORM_DATA_KEY = '__value';

// TODO `mode?: 'single' | 'multiple' | 'leaf'`

/**
 * Custom input control for managing selected values in a hierarchy.
 *
 * @slot default NodeList of `use-treeitem` elements
 * @slot arrow
 */
@customElement('use-tree')
export class UseTree extends LitElement {
  static formAssociated = true;

  #id: string;
  #internals: ElementInternals;
  #value = new FormData();

  @property()
  name?: string;

  @property({ type: Boolean, reflect: true })
  multiple = false;

  @property({ type: Boolean })
  set disabled(flag) {
    if (flag) {
      this.#internals.states.add('disabled');
    } else {
      this.#internals.states.delete('disabled');
    }
  }

  get disabled() {
    return this.#internals.states.has('disabled');
  }

  /**
   * UseTreeItem[]
   * @readonly
   */
  get selected() {
    return this.lazyQueryItems().filter((item) => item.selected);
  }

  get firstSelected() {
    return this.lazyQueryItems().find((item) => item.selected);
  }

  @query('use-treeitem')
  items!: Array<UseTreeitem>;

  @query('[part="tree"]', true)
  tree!: HTMLDivElement;

  lazyItems: Array<UseTreeitem> = [];

  constructor() {
    super();
    this.#id = createId();
    this.#internals = this.attachInternals();

    if (this.hasAttribute('disabled')) {
      this.#internals.states.add('disabled');
    }

    this.addEventListener('focusin', this.#handleFocusIn);
    this.addEventListener('focusout', this.#handleFocusOut);
  }

  #mouseDownTarget = null as HTMLElement | null;
  #handleMouseDown(event: MouseEvent) {
    this.#mouseDownTarget = event.target as HTMLElement;
    this.#mouseDownTarget?.setAttribute('tabindex', '0');
  }

  #handleFocusIn(event: HTMLElementEventMap['focusin']) {
    let target = event.target as HTMLElement | null;

    if (this.#mouseDownTarget) {
      target = this.#mouseDownTarget;
    } else if (target === this) {
      target = this.activeOption;
    }

    this.activeOption = target as UseTreeitem;
    target?.focus();
    this.setAttribute('tabindex', '-1');
  }

  #handleFocusOut(event: HTMLElementEventMap['focusout']) {
    if (event.relatedTarget === this) {
      if (this.#activeOption) {
        this.activeOption = this.#activeOption;
        this.#activeOption.focus();
        this.setAttribute('tabindex', '-1');
      }

      return;
    }

    if (this.contains(event.relatedTarget as Node)) {
      return;
    }

    this.setAttribute('tabindex', '0');
  }

  #handleClick(event: HTMLElementEventMap['click']) {
    this.#mouseDownTarget = null;

    if (this.disabled) {
      return;
    }

    const target = event.target as HTMLElement;
    const selectOption = target?.closest<UseTreeitem>('use-treeitem');

    if (selectOption?.disabled) {
      return;
    }

    if (selectOption?.value != null) {
      event.preventDefault();
      // this.activeOption = selectOption;
      const isToggleIndicator = event
        .composedPath()
        .some((el) => (el instanceof HTMLElement ? el.getAttribute('part') === 'toggle-indicator' : false));

      if (!isToggleIndicator) {
        this.#toggleOptionValue(selectOption);
      }
    }
  }

  getId() {
    return this.id ? this.id : this.#id;
  }

  #toggleOptionValue(target: UseTreeitem) {
    let newValue = this.#value.getAll(this.#dataKey) as string[];
    const targetValue = target.value;
    if (targetValue == null || target.disabled) {
      return;
    }

    if (target.selected) {
      newValue = newValue.filter((value) => value !== targetValue);
    } else if (this.multiple) {
      newValue.push(targetValue);
    } else {
      newValue = [targetValue];
    }

    this.value = newValue;
  }

  #initializeValue() {
    const selectedValues = this.selected.map((option) => option.getAttribute('value') ?? option.textContent);
    if (this.multiple) {
      this.value = selectedValues.map((value) => value ?? null).filter((value) => value != null);
    } else if (selectedValues[0] && selectedValues[0].length > 0) {
      this.value = selectedValues[0];
    }
  }

  #initializeTreeItems() {
    const lazyItems = this.lazyQueryItems();
    const expandedNodeIcon = (
      this.shadowRoot?.querySelector('slot[name="expanded-indicator"]') as HTMLSlotElement | null
    )?.assignedElements({ flatten: true })[0] as HTMLElement;

    const collapsedNodeIcon = (
      this.shadowRoot?.querySelector('slot[name="collapsed-indicator"]') as HTMLSlotElement | null
    )?.assignedElements({ flatten: true })[0] as HTMLElement;

    const selectedNodeIcon = (
      this.shadowRoot?.querySelector('slot[name="selected-indicator"]') as HTMLSlotElement | null
    )?.assignedElements({ flatten: true })[0] as HTMLElement;

    lazyItems.forEach((item) => {
      const expandedNodeClone = expandedNodeIcon?.cloneNode(true) as HTMLElement;
      if (expandedNodeClone) {
        expandedNodeClone.slot = 'expanded-indicator';
        item.appendChild(expandedNodeClone);
      }

      const collapsedNodeClone = collapsedNodeIcon?.cloneNode(true) as HTMLElement;
      if (collapsedNodeClone) {
        collapsedNodeClone.slot = 'collapsed-indicator';
        item.appendChild(collapsedNodeClone);
      }

      const selectedNodeClone = selectedNodeIcon?.cloneNode(true) as HTMLElement;
      if (selectedNodeClone) {
        selectedNodeClone.slot = 'selected-indicator';
        item.appendChild(selectedNodeClone);
      }
    });
  }

  #activeOption: UseTreeitem | null = null;
  get activeOption() {
    return this.#activeOption;
  }
  set activeOption(option: UseTreeitem | null) {
    this.#activeOption?.setAttribute('tabindex', '-1');
    this.#activeOption = option;
    option?.setAttribute('tabindex', '0');
  }

  firstUpdated() {
    this.#initializeValue();
    this.#initializeTreeItems();

    this.setAttribute('role', 'tree');

    if (!this.hasAttribute('disabled')) {
      this.activeOption = this.firstSelected ?? this.lazyQueryItems().at(0) ?? null;
      this.setAttribute('tabindex', '0');
    }
  }

  get #dataKey() {
    return this.name ?? FORM_DATA_KEY;
  }

  set value(value: string[] | string) {
    this.#value.delete(this.#dataKey);

    if (this.multiple) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          this.#value.append(this.#dataKey, v);
        });
      } else {
        this.#value.append(this.#dataKey, value);
      }
    } else if (Array.isArray(value) && value.length > 0) {
      this.#value.set(this.#dataKey, value[0]);
    } else if (typeof value === 'string' && value.length > 0) {
      this.#value.set(this.#dataKey, value);
    }

    const values = this.#value.getAll(this.#dataKey);
    const options = this.queryLazyAvailableItems();

    options.forEach((option) => {
      option.selected = values.includes(option.getAttribute('value') ?? option.textContent ?? '');
    });

    this.#internals.setFormValue(this.#value);
  }

  get value(): FormData {
    return this.#value;
  }

  lazyQueryItems() {
    return Array.from(this.querySelectorAll('use-treeitem'));
  }

  queryLazyAvailableItems() {
    return this.lazyQueryItems().filter((item) => {
      if (item.disabled) {
        return false;
      }

      if (this.parentElement === item) {
        return true;
      }

      const parent = item.parentElement?.closest('[role="treeitem"]') as UseTreeitem;

      if (parent && parent.expanded) {
        return true;
      }

      return item.parentElement === this || item.parentElement?.closest('use-treeitem')?.expanded;
    });
  }

  #handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    if (['Enter', ' '].includes(event.key) && this.activeOption) {
      event.preventDefault();
      this.#toggleOptionValue(this.activeOption);
      return;
    }

    const options = this.queryLazyAvailableItems();
    const activeId = this.activeOption?.id;
    const activeIndex = activeId ? options.findIndex((option) => option.id === activeId) : -1;

    let moveTo: UseTreeitem | undefined;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (activeIndex > 0) {
          moveTo = options.at(activeIndex - 1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(activeIndex + 1);
        break;
      // TODO RTL support
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        if (this.activeOption && !this.activeOption.expanded) {
          this.activeOption.toggle();
        }
        break;
      // TODO RTL support
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        if (this.activeOption && this.activeOption.expanded) {
          this.activeOption.toggle();
        } else if (this.activeOption?.parentElement instanceof UseTreeitem) {
          this.activeOption.parentElement.toggle();
          moveTo = this.activeOption.parentElement;
        }
        break;
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(0);
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        moveTo = options.at(options.length - 1);
        break;
    }

    if (moveTo) {
      this.activeOption = moveTo;
      this.activeOption.focus();
    }
  }

  render() {
    return html`
      <div
        role="tree"
        part="tree"
        @mousedown=${this.#handleMouseDown}
        @click=${this.#handleClick}
        @keydown=${this.#handleKeyDown}
      >
        <slot name="expanded-indicator" part="expanded-indicator"></slot>
        <slot name="collapsed-indicator" part="collapsed-indicator"></slot>
        <slot name="selected-indicator" part="selected-indicator" aria-hidden="true"></slot>
        <slot></slot>
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
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }

    slot[name] {
      display: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'use-tree': UseTree;
  }
}

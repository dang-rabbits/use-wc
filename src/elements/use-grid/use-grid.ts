import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UseGridRow } from './use-gridrow';
import { UseGridCell } from './use-gridcell';

const FORM_DATA_KEY = '__value';
const indicators = ['selected', 'deselected'] as const;
type Indicator = (typeof indicators)[number];

/**
 * Accessible grid component following [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
 *
 * ## Grid Cell Modes
 * The `mode` attribute of the `use-gridcell` element determines how the cell behaves in terms of focus and interaction. The possible values are:
 *
 * - `'none'` - the cell itself is focusable and it does not contain any interactive elements.
 * - `'widget'` - the cell itself is focusable and it contains more than one interactive element. To access the interactive elements, the user must press `Enter` or `F2`, and to restore focus to the cell, the user must press `Esc` or `F2`.
 * - `'action'` - the cell itself is not focusable and it contains more than one interactive element. The user can tab to the interactive elements directly.
 *
 * @slot - Grid content (use-gridhead/use-gridbody rows)
 */
@customElement('use-grid')
export class UseGrid extends LitElement {
  static formAssociated = true;
  #internals: ElementInternals;

  get internals() {
    return this.#internals;
  }

  @property({ type: String, reflect: true, attribute: 'selectmode' })
  selectmode: 'multiple' | 'single' | 'none' = 'none';

  @property({ type: String, reflect: true })
  name = '';

  @property({ type: String, reflect: true })
  role = 'grid';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  #value: string[] | string | null = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  #observer: MutationObserver | null = null;
  #watchMutations() {
    if (this.#observer) {
      return;
    }

    this.#observer = new MutationObserver(() => {
      this.#initializeGridRows();
    });
    this.#observer.observe(this, { attributes: false, childList: true, subtree: true });
  }

  #unwatchMutations() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  get #dataKey() {
    return this.name ?? FORM_DATA_KEY;
  }

  set value(value: string[] | string) {
    const newValue = new FormData();

    if (this.selectmode === 'multiple') {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          newValue.append(this.#dataKey, v);
        });
      } else {
        newValue.append(this.#dataKey, value);
      }
    } else if (Array.isArray(value) && value.length > 0) {
      newValue.set(this.#dataKey, value[0]);
    } else if (typeof value === 'string' && value.length > 0) {
      newValue.set(this.#dataKey, value);
    }

    const values = newValue.getAll(this.#dataKey);
    const rows = Array.from(this.querySelectorAll('use-gridrow')) as Array<UseGridRow>;

    rows.forEach((row) => {
      row.selected = values.includes(row.getAttribute('value') ?? row.textContent ?? '');
    });

    this.#internals.setFormValue(newValue);

    // @ts-expect-error - we're not using File
    this.#value = this.selectmode === 'multiple' ? values : values[0];

    this.dispatchEvent(
      new CustomEvent('use-change', {
        detail: {
          value: this.selectmode === 'multiple' ? values : newValue.get(this.#dataKey),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  get value(): string[] | string | null {
    return this.#value;
  }

  // Keyboard navigation and selection logic
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.#onKeyDown);
    this.addEventListener('click', this.#handleClick);
  }
  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeyDown);
    this.removeEventListener('click', this.#handleClick);
    this.#unwatchMutations();
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.#initializeGridRows();
  }

  #onKeyDown = (event: KeyboardEvent) => {
    const active = document.activeElement?.closest('use-gridcell') as HTMLElement;
    // Only consider cells in enabled rows
    const cells = Array.from(this.querySelectorAll<HTMLElement>('use-gridrow:not([disabled]) use-gridcell'));
    if (!cells.length) return;
    const currentIndex = cells.indexOf(active);
    if (currentIndex === -1) return;

    if (event.key === ' ' && event.shiftKey) {
      if (this.selectmode === 'none' || this.readonly || this.disabled) return;

      const row = active.closest('use-gridrow');
      if (row && !row.hasAttribute('disabled') && !row.closest('use-gridhead')) {
        this.#toggleRowSelection(row);
        event.preventDefault();
        return;
      }
    }

    let nextIndex = currentIndex;
    const cols = this.#getColCount();

    switch (event.key) {
      case 'ArrowRight':
        if ((currentIndex + 1) % cols !== 0 && currentIndex + 1 < cells.length) {
          nextIndex = currentIndex + 1;
        } else {
          return;
        }
        break;
      case 'ArrowLeft':
        if (currentIndex % cols !== 0) {
          nextIndex = currentIndex - 1;
        } else {
          return;
        }
        break;
      case 'ArrowDown':
        if (currentIndex + cols < cells.length) {
          nextIndex = currentIndex + cols;
        } else {
          return;
        }
        break;
      case 'ArrowUp':
        if (currentIndex - cols >= 0) {
          nextIndex = currentIndex - cols;
        } else {
          return;
        }
        break;
      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          // Move to first row, same column
          nextIndex = currentIndex % cols;
        } else {
          nextIndex = currentIndex - (currentIndex % cols);
        }
        break;
      case 'End': {
        if (event.ctrlKey || event.metaKey) {
          // Move to last row, same column
          nextIndex = (currentIndex % cols) + cols * Math.floor((cells.length - 1) / cols);
          if (nextIndex >= cells.length) nextIndex = cells.length - 1;
        } else {
          nextIndex = currentIndex - (currentIndex % cols) + cols - 1;
          if (nextIndex >= cells.length) nextIndex = cells.length - 1;
        }
        break;
      }
      case 'PageDown': {
        nextIndex = (currentIndex % cols) + cols * Math.floor((cells.length - 1) / cols);
        if (nextIndex >= cells.length) nextIndex = cells.length - 1;
        break;
      }
      case 'PageUp':
        nextIndex = currentIndex % cols;
        break;
      default:
        return;
    }
    event.preventDefault();
    cells.forEach((cell) => {
      cell.tabIndex = -1;
    });
    const nextCell = cells[nextIndex];
    nextCell.tabIndex = 0;
    nextCell.focus();
  };

  #toggleRowSelection(target: UseGridRow) {
    if (this.selectmode === 'none') return;
    const selectRow = target?.closest('use-gridrow');

    if (
      selectRow &&
      !selectRow.hasAttribute('disabled') &&
      !selectRow.closest('use-gridhead') &&
      selectRow.getAttribute('value') != null
    ) {
      const rowValue = selectRow.getAttribute('value') ?? selectRow.textContent ?? '';
      let newValue = (this.#value as string[]) ?? [];
      if (selectRow.hasAttribute('selected')) {
        newValue = newValue.filter((v) => v !== rowValue);
      } else if (this.selectmode === 'multiple') {
        newValue.push(rowValue);
      } else {
        newValue = [rowValue];
      }

      this.value = newValue;
    }
  }

  #handleClick(event: HTMLElementEventMap['click']) {
    if (this.disabled || this.readonly) {
      return;
    }

    const target = event.target as HTMLElement;
    const selectRow = target?.closest<UseGridRow>('use-gridrow');

    if (selectRow?.disabled || selectRow?.readonly) {
      return;
    }

    if (selectRow?.value && selectRow?.value != '' && selectRow?.value != null) {
      event.preventDefault();
      const isToggleIndicator = event
        .composedPath()
        .some((el) => (el instanceof HTMLElement ? el.getAttribute('part') === 'toggle-indicator' : false));

      if (!isToggleIndicator) {
        this.#toggleRowSelection(selectRow);
      }
    }
  }

  #getColCount(): number {
    // Try to infer column count from first row
    const firstRow = this.querySelector('use-gridrow');
    if (firstRow) {
      return firstRow.querySelectorAll('use-gridcell').length || 1;
    }
    return 1;
  }

  render() {
    return html`
      <div role="grid" part="grid">
        <slot name="selected-indicator" part="selected-indicator">
          <span part="selected-indicator-default" aria-hidden="true">✔</span>
        </slot>
        <slot name="deselected-indicator" part="deselected-indicator">
          <span part="deselected-indicator-default" aria-hidden="true">&nbsp;</span>
        </slot>
        <slot></slot>
      </div>
    `;
  }

  #lazyQueryGridBodyRows() {
    return Array.from(this.querySelectorAll('use-gridbody use-gridrow')) as Array<UseGridRow>;
  }

  #indicatorSlotCache: Partial<Record<Indicator, HTMLElement>> = {};
  #getIndicator(indicator: Indicator) {
    if (!this.#indicatorSlotCache[indicator]) {
      this.#indicatorSlotCache[indicator] = (
        this.shadowRoot?.querySelector(`slot[name="${indicator}-indicator"]`) as HTMLSlotElement
      )?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    }

    return this.#indicatorSlotCache[indicator];
  }

  #initializeGridRows() {
    this.#unwatchMutations();
    const selectedValues: string[] = [];

    this.#lazyQueryGridBodyRows().forEach((row) => {
      if (row.selected && row.value) {
        selectedValues.push(row.value);
      }

      indicators.forEach((indicator) => {
        if (row.shadowRoot?.querySelector(`slot[name="${indicator}-indicator"]`)) {
          return;
        }

        const nodeClone = this.#getIndicator(indicator)?.cloneNode(true) as HTMLElement;

        if (nodeClone) {
          nodeClone.slot = `${indicator}-indicator`;
          row.appendChild(nodeClone);
        }
      });
    });

    this.value = selectedValues;

    const firstCell = this.querySelector('use-gridrow:not([disabled]) use-gridcell') as UseGridCell | null;
    if (firstCell) {
      firstCell.tabIndex = 0;
    }

    this.#watchMutations();
  }

  static styles = css`
    :host {
      display: block;
    }
    ::slotted(use-gridhead) {
      font-weight: bold;
    }
    slot[name] {
      display: none;
    }
  `;
}

// TypeScript global declarations

declare global {
  interface HTMLElementTagNameMap {
    'use-grid': UseGrid;
  }
}

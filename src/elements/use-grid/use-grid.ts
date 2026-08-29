import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isFocusable } from "tabbable";
import { UseGridRow } from "./use-gridrow";
import { UseGridCell } from "./use-gridcell";
import { SELECTION_CELL_ATTRIBUTE } from "./constants";
import createId from "../../utils/create-id";

const FORM_DATA_KEY = "__value";
const indicators = ["selected", "deselected"] as const;
type Indicator = (typeof indicators)[number];

const selectWithTokens = ["row", "control", "none"] as const;
type SelectWithToken = (typeof selectWithTokens)[number];

/** Accepted `selectwith` values — `"none"` alone, or `"row"` and/or `"control"` (canonical order). */
type SelectWith = "none" | "row" | "control" | "row control";

export { SELECTION_CELL_ATTRIBUTE };

// A row click that reached an interactive element was meant for that element, not for selecting
// the row. `isFocusable` (from `tabbable`, already used by use-gridcell) covers buttons, links,
// form controls, contenteditable, media controls, etc. — plus `<label>`, which activates its
// control without being focusable itself. `use-gridcell` is excluded: it's focusable for grid
// navigation, not because it's interactive content, so clicking a cell's padding still selects.
function isInteractiveContent(node: HTMLElement) {
  if (node.localName === "use-gridcell") return false;
  return (
    node.getAttribute("part") === "toggle-indicator" ||
    node.localName === "label" ||
    isFocusable(node)
  );
}

/**
 * Accessible grid component following [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
 *
 * ## Grid Cell Modes
 * The `mode` attribute of the `use-gridcell` element determines how the cell behaves in terms of focus and interaction. The possible values are:
 *
 * - `'none'` - the cell itself is focusable and it does not contain any interactive elements.
 * - `'widget'` - the cell itself is focusable and it contains more than one interactive element. To access the interactive elements, the user must press `Enter` or `F2`, and to restore focus to the cell, the user must press `Esc` or `F2`.
 * - `'action'` - the cell itself is not focusable and it contains a single interactive element. The user can tab to the interactive elements directly.
 *
 * ## Accessible Label
 * Provide `aria-label` or `aria-labelledby` on the `use-grid` element so screen readers can identify the grid.
 *
 * @slot - Grid content (use-gridhead/use-gridbody rows)
 */
@customElement("use-grid")
export class UseGrid extends LitElement {
  static formAssociated = true;
  #internals: ElementInternals;

  get internals() {
    return this.#internals;
  }

  @property({ type: String, reflect: true, attribute: "selectmode" })
  selectmode: "multiple" | "single" | "none" = "none";

  @property({ type: String, reflect: true })
  selectwith: SelectWith = "row";

  @property({ type: String, reflect: true })
  name = "";

  @property({ type: String, reflect: true })
  role = "grid";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  #value: string[] | string | null = null;

  #radioGroupName = "";

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  get #selectWithTokens(): Set<SelectWithToken> {
    const requested = new Set(
      this.selectwith
        .trim()
        .split(/\s+/)
        .filter((token): token is SelectWithToken =>
          (selectWithTokens as readonly string[]).includes(token),
        ),
    );

    if (requested.has("none")) {
      return new Set(["none"]);
    }

    // Emit in the canonical `selectWithTokens` order so the reflected attribute is stable
    // regardless of the order the author wrote the tokens in.
    const ordered = selectWithTokens.filter((token) => token !== "none" && requested.has(token));
    return new Set(ordered.length > 0 ? ordered : ["row"]);
  }

  get #selectionEnabled() {
    return this.selectmode !== "none";
  }

  /** `true` when `selectmode="multiple"`. Read by `use-gridcell` selection cells. */
  get isMultiSelect() {
    return this.selectmode === "multiple";
  }

  get #selectsOnRowClick() {
    return this.#selectionEnabled && this.#selectWithTokens.has("row");
  }

  /**
   * `true` when a checkbox/radio selection column should exist (`selectmode` on and `selectwith`
   * includes `control`). Read by `use-gridrow.reconcileSelectorCell`.
   */
  get injectsSelectionColumn() {
    return this.#selectionEnabled && this.#selectWithTokens.has("control");
  }

  /**
   * The shared `name` for injected radio controls — the grid's `name` when set, otherwise a stable
   * generated id. Lazily created so single-select grids without a `name` still group correctly.
   */
  get selectionGroupName() {
    if (!this.#radioGroupName) {
      this.#radioGroupName = this.name || `use-grid-selection-${createId().replace(/:/g, "")}`;
    }
    return this.#radioGroupName;
  }

  // A row is "disabled" for selection whether the author used the `disabled` prop or set
  // `aria-disabled="true"` directly. Disabled rows stay keyboard-navigable and AT-perceivable —
  // only the selection gestures are inert.
  isRowDisabled(row: Element | null | undefined) {
    return !!row && (row.hasAttribute("disabled") || row.getAttribute("aria-disabled") === "true");
  }

  #observer: MutationObserver | null = null;
  #watchMutations() {
    if (this.#observer) {
      return;
    }

    this.#observer = new MutationObserver((records) => {
      const hasGridRowChange = records.some(
        (record) =>
          Array.from(record.addedNodes).some(
            (n) =>
              n instanceof HTMLElement &&
              (n.tagName.toLowerCase() === "use-gridrow" ||
                n.querySelector("use-gridrow") !== null),
          ) ||
          Array.from(record.removedNodes).some(
            (n) => n instanceof HTMLElement && n.tagName.toLowerCase() === "use-gridrow",
          ),
      );
      if (hasGridRowChange) {
        this.#invalidateCellCache();
        this.#initializeGridRows();
      }
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

  #cellCache: { cells: HTMLElement[]; colCount: number } | null = null;

  #invalidateCellCache() {
    this.#cellCache = null;
  }

  #getCellCache(): { cells: HTMLElement[]; colCount: number } {
    if (!this.#cellCache) {
      // Disabled rows are still navigable — a keyboard/AT user must be able to read them — so the
      // roving-tabindex cell list includes them; the selection guards keep them un-selectable.
      const cells = Array.from(this.querySelectorAll<HTMLElement>("use-gridrow use-gridcell"));
      const firstRow = this.querySelector("use-gridrow");
      const colCount = firstRow ? firstRow.querySelectorAll("use-gridcell").length || 1 : 1;
      this.#cellCache = { cells, colCount };
    }
    return this.#cellCache;
  }

  #initializing = false;

  set value(value: string[] | string) {
    const newValue = new FormData();

    if (this.isMultiSelect) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          newValue.append(this.#dataKey, v);
        });
      } else {
        newValue.append(this.#dataKey, value);
      }
    } else if (Array.isArray(value) && value.length > 0) {
      newValue.set(this.#dataKey, value[0]);
    } else if (typeof value === "string" && value.length > 0) {
      newValue.set(this.#dataKey, value);
    }

    const values = newValue.getAll(this.#dataKey);
    const rows = Array.from(this.querySelectorAll("use-gridrow")) as Array<UseGridRow>;

    rows.forEach((row) => {
      if (row.closest("use-gridhead")) {
        return;
      }
      row.selected = values.includes(row.getAttribute("value") ?? row.textContent ?? "");
    });

    this.#internals.setFormValue(newValue);

    // @ts-expect-error - we're not using File
    this.#value = this.isMultiSelect ? values : values[0];

    this.#syncSelectAll();

    if (!this.#initializing) {
      this.dispatchEvent(
        new CustomEvent("use-change", {
          detail: {
            value: this.isMultiSelect ? values : newValue.get(this.#dataKey),
          },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  get value(): string[] | string | null {
    return this.#value;
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has("selectmode")) {
      if (this.isMultiSelect) {
        this.setAttribute("aria-multiselectable", "true");
      } else {
        this.removeAttribute("aria-multiselectable");
      }
    }

    if (changedProps.has("selectwith")) {
      const normalized = Array.from(this.#selectWithTokens).join(" ") as SelectWith;
      if (normalized !== this.selectwith) {
        this.selectwith = normalized;
      }
    }

    if (this.#skipReinitAfterFirstUpdate) {
      this.#skipReinitAfterFirstUpdate = false;
      return;
    }

    if (
      this.#hasInitializedRows &&
      (changedProps.has("selectmode") || changedProps.has("selectwith")) &&
      !this.#initializing
    ) {
      this.#initializeGridRows();
    }
  }

  #hasInitializedRows = false;
  #skipReinitAfterFirstUpdate = false;

  // Keyboard navigation and selection logic
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("change", this.#onChange);
  }
  disconnectedCallback() {
    this.removeEventListener("keydown", this.#onKeyDown);
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("change", this.#onChange);
    this.#unwatchMutations();
    super.disconnectedCallback();
  }

  // Move the roving tabindex to `cell` and focus it. A selection cell is `mode="action"`, so
  // focusing it forwards focus to its checkbox/radio and drops the cell back out of the tab
  // sequence — Tab / Shift+Tab then move in and out of the grid natively.
  #focusGridCell(cell: HTMLElement) {
    this.#getCellCache().cells.forEach((candidate) => {
      candidate.tabIndex = -1;
    });
    cell.tabIndex = 0;
    cell.focus();
  }

  firstUpdated() {
    this.#skipReinitAfterFirstUpdate = true;
    this.#initializeGridRows();
  }

  #onKeyDown = (event: KeyboardEvent) => {
    const active = (event.target as HTMLElement)?.closest("use-gridcell") as HTMLElement;
    const { cells, colCount: cols } = this.#getCellCache();
    if (!cells.length) return;
    const currentIndex = cells.indexOf(active);
    if (currentIndex === -1) return;

    // A focused radio in the injected column would arrow-navigate its own group; the grid owns
    // Arrow keys, so cancel that even when the grid itself doesn't move (edge of the grid).
    if (
      active.hasAttribute(SELECTION_CELL_ATTRIBUTE) &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
    }

    if (event.key === " " && event.shiftKey) {
      if (!this.#selectionEnabled || this.readonly || this.disabled) return;

      const row = active.closest("use-gridrow");
      if (row && !this.isRowDisabled(row) && !row.closest("use-gridhead")) {
        this.#toggleRowSelection(row);
        event.preventDefault();
        return;
      }
    }

    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        if ((currentIndex + 1) % cols !== 0 && currentIndex + 1 < cells.length) {
          nextIndex = currentIndex + 1;
        } else {
          return;
        }
        break;
      case "ArrowLeft":
        if (currentIndex % cols !== 0) {
          nextIndex = currentIndex - 1;
        } else {
          return;
        }
        break;
      case "ArrowDown":
        if (currentIndex + cols < cells.length) {
          nextIndex = currentIndex + cols;
        } else {
          return;
        }
        break;
      case "ArrowUp":
        if (currentIndex - cols >= 0) {
          nextIndex = currentIndex - cols;
        } else {
          return;
        }
        break;
      case "Home":
        if (event.ctrlKey || event.metaKey) {
          // Move to first row, same column
          nextIndex = currentIndex % cols;
        } else {
          nextIndex = currentIndex - (currentIndex % cols);
        }
        break;
      case "End": {
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
      case "PageDown": {
        nextIndex = (currentIndex % cols) + cols * Math.floor((cells.length - 1) / cols);
        if (nextIndex >= cells.length) nextIndex = cells.length - 1;
        break;
      }
      case "PageUp":
        nextIndex = currentIndex % cols;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.#focusGridCell(cells[nextIndex]);
  };

  #toggleRowSelection(target: UseGridRow) {
    if (!this.#selectionEnabled) return;
    const selectRow = target?.closest("use-gridrow");

    if (
      selectRow &&
      !this.isRowDisabled(selectRow) &&
      !selectRow.closest("use-gridhead") &&
      selectRow.getAttribute("value") != null
    ) {
      const rowValue = selectRow.getAttribute("value") ?? selectRow.textContent ?? "";
      let newValue: string[] = Array.isArray(this.#value)
        ? [...this.#value]
        : this.#value
          ? [this.#value as string]
          : [];
      if (selectRow.hasAttribute("selected")) {
        newValue = newValue.filter((v) => v !== rowValue);
      } else if (this.isMultiSelect) {
        newValue.push(rowValue);
      } else {
        newValue = [rowValue];
      }

      this.value = newValue;
    }
  }

  #handleClick = (event: HTMLElementEventMap["click"]) => {
    if (this.disabled || this.readonly || !this.#selectsOnRowClick) {
      return;
    }

    const target = event.target as HTMLElement;
    const selectRow = target?.closest<UseGridRow>("use-gridrow");

    if (
      !selectRow ||
      this.isRowDisabled(selectRow) ||
      selectRow.readonly ||
      selectRow.closest("use-gridhead")
    ) {
      return;
    }

    if (!selectRow.value) {
      return;
    }

    const path = event.composedPath();
    const rowIndex = path.indexOf(selectRow);
    const landedOnInteractiveContent = path.some((node, index) => {
      if (rowIndex !== -1 && index >= rowIndex) {
        return false;
      }
      return node instanceof HTMLElement && isInteractiveContent(node);
    });

    if (landedOnInteractiveContent) {
      return;
    }

    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      selection.anchorNode &&
      selectRow.contains(selection.anchorNode)
    ) {
      return;
    }

    event.preventDefault();
    this.#toggleRowSelection(selectRow);
  };

  #onChange = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const selectionCell = target.closest(`use-gridcell[${SELECTION_CELL_ATTRIBUTE}]`);
    if (!selectionCell || !this.contains(selectionCell)) {
      return;
    }

    const row = selectionCell.closest<UseGridRow>("use-gridrow");
    if (!row) {
      return;
    }

    if (this.disabled || this.readonly) {
      target.checked = row.selected;
      this.#syncSelectAll();
      return;
    }

    if (row.closest("use-gridhead")) {
      this.#toggleSelectAll(target.checked);
      return;
    }

    if (this.isRowDisabled(row) || row.readonly) {
      target.checked = row.selected;
      return;
    }

    this.#toggleRowSelection(row);
  };

  #selectableBodyRows() {
    return this.#lazyQueryGridBodyRows().filter(
      (row) => !this.isRowDisabled(row) && row.getAttribute("value") != null,
    );
  }

  #toggleSelectAll(checked: boolean) {
    const selectable = this.#selectableBodyRows();
    this.value = checked
      ? selectable.map((row) => row.getAttribute("value") ?? row.textContent ?? "")
      : [];
  }

  #syncSelectAll() {
    if (!this.injectsSelectionColumn || !this.isMultiSelect) {
      return;
    }

    const headerInput = this.querySelector<HTMLInputElement>(
      `use-gridhead use-gridcell[${SELECTION_CELL_ATTRIBUTE}] input`,
    );
    if (!headerInput) {
      return;
    }

    const selectable = this.#selectableBodyRows();
    const selectedCount = selectable.filter((row) => row.selected).length;
    headerInput.checked = selectable.length > 0 && selectedCount === selectable.length;
    headerInput.indeterminate = selectedCount > 0 && selectedCount < selectable.length;
  }

  render() {
    return html`
      <div part="grid">
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
    return Array.from(this.querySelectorAll("use-gridbody use-gridrow")) as Array<UseGridRow>;
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
    this.#initializing = true;
    const selectedValues: string[] = [];

    this.#invalidateCellCache();

    const allRows = Array.from(this.querySelectorAll("use-gridrow")) as Array<UseGridRow>;

    allRows.forEach((row, rowIndex) => {
      // Add, remove, or re-sync the row's leading selection cell for the current
      // `selectmode` / `selectwith` before any column count is read — the row owns the cell's
      // existence and the cell owns its own control (`use-gridrow.reconcileSelectorCell`,
      // `use-gridcell`).
      row.reconcileSelectorCell();
      row.setAttribute("aria-rowindex", String(rowIndex + 1));
      const cells = Array.from(row.querySelectorAll<HTMLElement>("use-gridcell"));
      cells.forEach((cell, colIndex) => {
        cell.setAttribute("aria-colindex", String(colIndex + 1));
      });
    });

    const { colCount } = this.#getCellCache();
    this.setAttribute("aria-rowcount", String(allRows.length));
    this.setAttribute("aria-colcount", String(colCount));

    const cloneIndicators = !this.injectsSelectionColumn;

    this.#lazyQueryGridBodyRows().forEach((row) => {
      if (row.selected && row.value) {
        selectedValues.push(row.value);
      }

      if (!cloneIndicators) {
        row
          .querySelectorAll(
            ':scope > [part~="selected-indicator-default"], :scope > [part~="deselected-indicator-default"]',
          )
          .forEach((clone) => clone.remove());
        return;
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
    this.#initializing = false;
    this.#hasInitializedRows = true;
    this.#syncSelectAll();

    // Tab into the grid lands on the first cell of the first row that isn't disabled, falling
    // back to the very first cell so nothing is ever unreachable when every row is disabled.
    const firstCell = (this.querySelector(
      'use-gridrow:not([disabled]):not([aria-disabled="true"]) use-gridcell',
    ) ?? this.querySelector("use-gridrow use-gridcell")) as UseGridCell | null;
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
    "use-grid": UseGrid;
  }
}

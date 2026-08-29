import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { SELECTION_CELL_ATTRIBUTE, SELECTION_COLUMN_ATTRIBUTE } from "./constants";
import type { UseGridCell } from "./use-gridcell";

function setAriaFlag(element: Element, name: string, on: boolean) {
  if (on) {
    element.setAttribute(name, "true");
  } else {
    element.removeAttribute(name);
  }
}

@customElement("use-gridrow")
export class UseGridRow extends LitElement {
  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: String, reflect: true })
  value = "";

  #reflectsAriaDisabled = false;

  firstUpdated() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "row");
    }
    this.reconcileSelectorCell();
  }

  updated() {
    const selectmode = this.closest("use-grid")?.getAttribute("selectmode") ?? "none";
    if (selectmode !== "none") {
      this.setAttribute("aria-selected", this.selected ? "true" : "false");
    } else {
      this.removeAttribute("aria-selected");
    }

    // Reflect the `disabled` prop to `aria-disabled`, but don't clobber an `aria-disabled` the
    // author set directly (only remove the one we added).
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this.#reflectsAriaDisabled = true;
    } else if (this.#reflectsAriaDisabled) {
      this.removeAttribute("aria-disabled");
      this.#reflectsAriaDisabled = false;
    }

    if (!this.closest("use-gridhead")) {
      this.#syncSelectorCell();
    }
  }

  get #selectorCell() {
    return this.querySelector<UseGridCell>(`:scope > use-gridcell[${SELECTION_CELL_ATTRIBUTE}]`);
  }

  // The grid owns the selection *policy* (`selectmode` / `selectwith`); the row owns its leading
  // selection cell — it builds the `use-gridcell` (`mode="action"`) plus the native checkbox/radio,
  // and removes or rebuilds it when the policy changes. `#syncSelectorCell` keeps that control's
  // label / disabled state / checked value current. Called by the grid on (re)initialization and by
  // this row's own first render, so a dynamically added row provisions itself.
  reconcileSelectorCell() {
    const grid = this.closest("use-grid");
    const wantsColumn = grid?.injectsSelectionColumn ?? false;
    const existing = this.#selectorCell;

    if (!wantsColumn) {
      existing?.remove();
      this.removeAttribute(SELECTION_COLUMN_ATTRIBUTE);
      return;
    }

    this.setAttribute(SELECTION_COLUMN_ATTRIBUTE, "");

    const type = grid?.isMultiSelect ? "checkbox" : "radio";
    if (existing && existing.querySelector("input")?.type !== type) {
      existing.remove();
    }

    if (!this.#selectorCell) {
      const cell = document.createElement("use-gridcell");
      cell.setAttribute(SELECTION_CELL_ATTRIBUTE, "");
      cell.setAttribute("mode", "action");

      const input = document.createElement("input");
      input.type = type;
      // Kept out of the tab sequence — the grid's roving navigation reaches the cell and the cell
      // (`mode="action"`) forwards focus to this control.
      input.tabIndex = -1;
      cell.appendChild(input);

      this.prepend(cell);
    }

    this.#syncSelectorCell();
  }

  #syncSelectorCell() {
    const cell = this.#selectorCell;
    const grid = this.closest("use-grid");
    const input = cell?.querySelector<HTMLInputElement>("input");
    if (!cell || !grid || !input) {
      return;
    }

    if (this.closest("use-gridhead")) {
      if (grid.isMultiSelect) {
        input.setAttribute("aria-label", "Select all rows");
        setAriaFlag(input, "aria-disabled", grid.disabled);
        setAriaFlag(input, "aria-readonly", !grid.disabled && grid.readonly);
      } else {
        // Radio selection has no "select all"; this input is an inert, hidden spacer whose only
        // job is to size the header cell to match the radio column below it.
        input.disabled = true;
        input.setAttribute("aria-hidden", "true");
        input.style.visibility = "hidden";
      }
      return;
    }

    if (!grid.isMultiSelect) {
      input.name = grid.selectionGroupName;
    }

    const labelCell = Array.from(this.querySelectorAll<HTMLElement>("use-gridcell")).find(
      (candidate) => !candidate.hasAttribute(SELECTION_CELL_ATTRIBUTE),
    );
    const label = labelCell?.textContent?.trim();
    if (label) {
      input.setAttribute("aria-label", `Select ${label}`);
    } else {
      const index = Array.from(grid.querySelectorAll("use-gridbody use-gridrow")).indexOf(this);
      input.setAttribute("aria-label", `Select row ${index + 1}`);
    }

    const disabled = grid.isRowDisabled(this) || grid.disabled;
    const readonly = !disabled && (this.readonly || grid.readonly);
    setAriaFlag(input, "aria-disabled", disabled);
    setAriaFlag(input, "aria-readonly", readonly);

    if (input.checked !== this.selected) {
      input.checked = this.selected;
    }
  }

  render() {
    return html`
      <slot name="selected-indicator" part="selected-indicator"></slot>
      <slot name="deselected-indicator" part="deselected-indicator"></slot>
      <slot></slot>
    `;
  }

  static styles = css`
    :host {
      display: flex;
    }
    :host(:is([disabled], [aria-disabled="true"])) {
      opacity: 0.5;
    }
    :host-context(:is(use-grid[selectmode="none"]))
      :is([part="deselected-indicator"], [part="selected-indicator"]) {
      display: none;
    }
    :is([part="selected-indicator"], [part="deselected-indicator"]) {
      width: 1lh;
      height: 1lh;
    }
    [part="deselected-indicator"] {
      visibility: visible;
      display: initial;
    }
    [part="selected-indicator"] {
      visibility: hidden;
      display: none;
    }
    :host([selected]) [part="selected-indicator"] {
      visibility: visible;
      display: initial;
    }
    :host([selected]) [part="deselected-indicator"] {
      visibility: hidden;
      display: none;
    }
    /* When the selection control column is present (the row sets this attribute on itself while it
       holds a selection cell), the checkbox/radio is the indicator — collapse the built-in
       indicator slots so an empty 1lh box doesn't render as a ghost column beside the control. */
    :host([data-usewc-selection-column])
      :is([part="deselected-indicator"], [part="selected-indicator"]) {
      display: none;
    }
    ::slotted(use-gridcell) {
      flex: 1 1 0;
    }
    /* The selection-control column sizes to its checkbox/radio, not an equal share — so the column
       stays narrow without the theme layer. The theme adds padding and centering on top. */
    ::slotted(use-gridcell[data-usewc-selection-cell]) {
      flex: 0 0 auto;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "use-gridrow": UseGridRow;
  }
}

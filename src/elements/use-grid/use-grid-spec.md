# `use-grid`

## Markup

This should follow the same patterns as an HTML-standard `table` component and its children, except the elements will all be custom to improve performance and allow easier styling, accessibility, and functionality.

The custom elements will be as follows:

- `table` will be `use-grid`
- `thead` will be `use-gridhead` with a default `role` of `'rowgroup'`
- `tbody` will be `use-gridbody` with a default `role` of `'rowgroup'`
- `tr` will be `use-gridrow` with a default `role` of `'row'`
- `th` will be `use-gridcell`
  - when inside `use-gridheader` the default `role` will be `'columnheader'`
  - when inside `use-gridbody` the default `role` will be `'rowheader'`
- `td` will be `use-gridcell` with a default `role` of `'gridcell'`

## Shadow DOM

Shadow DOM will not be used for the following reasons:

- Overriding `tabindex` is more difficult with Shadow DOM
- Delegate focus is complicated for unknown children

## Selection

The `use-grid` web component holds a `FormData` state as a `value` property for row selection. Two
attributes configure it, on independent axes:

- `selectmode?: 'multiple' | 'single' | 'none'` (default `'none'`) — **how many** rows can be
  selected. `'none'` disables selection entirely and makes `selectwith` inert.
- `selectwith?: 'row' | 'control' | 'row control' | 'none'` (default `'row'`, a space-separated
  token set) — **how** selection is triggered and shown:
  - `row` — clicking anywhere in a row toggles it (the historical behavior).
  - `control` — a leading selection column appears: each `use-gridrow` provisions its own leading
    `use-gridcell[data-usewc-selection-cell]` (`use-gridrow.reconcileSelectorCell`) with a native
    control inside — an `<input type="checkbox">` when `selectmode="multiple"` or
    `<input type="radio">` when `selectmode="single"`, kept in sync with `row.selected`
    (`use-gridrow.#syncSelectorCell`). The cell is `mode="action"`, so the grid's roving navigation
    lands on the cell and the cell forwards focus to the control; the control itself stays out of
    the tab sequence. For `multiple`, the header row's cell holds a matching "select all" checkbox
    that reflects an indeterminate state when only some selectable rows are selected (the grid
    drives that state via `#syncSelectAll`); for `single` the header cell holds an inert,
    `visibility: hidden` radio that only exists to size the header column to match the body (no
    theme required). The grid itself only decides whether the column should exist and how many rows
    may be selected — it never constructs the cells.
  - `row control` — both: the column renders and a row click toggles it.
  - `none` — neither; only `Shift+Space` and programmatic `value` / `row.selected`.

A row click (`selectwith` includes `row`) is ignored only when it lands on an actual interactive
element inside the row — a `<button>`, `<a href>`, form control, `<label>`, `<summary>`,
`contenteditable`, or an ARIA widget role — or while the user is drag-selecting text. Clicking the
empty space of a cell (including a `mode="action"` / `mode="widget"` cell or the injected control
cell) or the gap between cells still selects the row. This guard applies in every `selectmode`.

The injected column is counted in `aria-colcount` / `aria-colindex` and is reachable by keyboard
arrow navigation like any other cell.

The `value` property is a custom getter that scans the nested `use-gridrow`s for a `selected` state.
When `selectwith` does not include `control`, a default checkmark indicator (as in `use-listbox` and
`use-tree`) marks the selected row; with a `control` column the checkbox/radio is the indicator.

## States

### `use-gridcell`

- **Focus** — this will come for free with `tabindex` being set and standard `:focus` CSS selectors

### `use-gridrow`

- **Selected** — a custom state needs to be implemented for when a row is selected and part of the `use-grid`'s form value
- **Disabled** — the `disabled` prop (reflected to `aria-disabled="true"`), or a bare
  `aria-disabled="true"` set by the author, prevents every selection gesture (click, `Shift+Space`,
  the injected control). A disabled row stays **keyboard-navigable and screen-reader perceivable** —
  its cells remain in the roving-tabindex order so the content can still be read; it just can't be
  selected. The theme dims it (`--usewc-effect-form-opacity-disabled`).

## Accessibility

### Keyboard navigation

Users must be able to navigate `use-gridcell` and `use-gridcolumnheader` by using the `ArrowUp`, `ArrowDown`, `ArrowLeft`, and `ArrowRight` keys. `PageUp`, `PageDown`, `Home`, `End`, `Control + [Home|End]`, keys need to be supported too. The logic can be derived from [Grid (Interactive Tabular Data and Layout Containers) Pattern | APG | WAI | W3C](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

To make this work, `use-gridcell`, `use-gridrowheader`, and `use-gridcolumnheader` need to have `tabindex="-1"` by default and then `tabindex="0"` when it is the active cell. `tabindex="-1"` is important so there isn’t lag when programmatically calling `cell.focus()`

Nested controls:

- Tabbable controls inside a cell should have its `tabindex` set to `-1` and a custom data prop to remember the original value, which could be `'initial'`
- When a non-header cell has more than one tabbable element then the cell itself becomes focused, and the user must press `Enter` or `F2` to focus into the control. Similarly, the user must press `Escape` or `F2` to restore grid navigation. When a cell is activated and the user uses `Tab` to navigate outside the `use-grid` then the grid navigation must be restored.
- When a non-header cell has no tabbable elements then the cell is focused.
- When a non-header cell has one tabbable element then that element becomes focused instead of the parent cell.
  - If the tabbable element implements its own arrow key controls, such as a dropdown with `ArrowDown` or a native input with `ArrowLeft` and `ArrowRight` then the cell should implement the _widget_ _mode_ as if the cell has more than one control.
  - This works best when the tabbable element is either a standalone button without a dropdown, a link, or checkbox.
  - Tabbable elements that delegate focus should also follow the _widget_ _mode_.

<aside>
💡

Editing and Navigating Inside a Cell: [Grid (Interactive Tabular Data and Layout Containers) Pattern | APG | WAI | W3C](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#gridNav_focus)

</aside>

### Keyboard controls

- To select a row the user must press `Shift + Space`
- Headers can only contain one tabbable element, which is generally the cell or label, but additional controls may be available for mouse-users as long as there is alternative method for accessing these functions with standard keyboard combinations. All alternative actions must live in a _more menu_, as defined below.
  - **Sort** — the header label can be clicked or `Enter` keypress to change the sort. `Shift` can be used as a modifier for `click` and `Enter` to append a sorted column to the state.
  - **More Menu** — There can be a secondary menu button with options to sort, filter, pin, etc. Keyboard users can access this menu with `Control + Enter`
- When a non-header row has focus within then pressing `Shift + Space` will select the row, unless the row or the parent `use-grid` is disabled.

### Aria attributes

WCAG recommended `role` and `aria-*` attributes should be automatically added to the `use-grid*` elements, this allows developers to quickly stand up an accessible grid.

It will be up to developers to implement `aria` attributes, and functionality, for sorting, filtering, readonly, etc.

## Examples

The showcase the flexibility of `use-grid` we will provide the following examples in Storybook:

- Single select mode
- Multiple select mode
- Checkbox selection column (`selectwith="control"`) with header select-all
- Radio selection column (`selectmode="single" selectwith="control"`)
- Click-row-to-toggle-checkbox (`selectwith="row control"`)
- Widget cell mode
- Sticky header
- Docked columns
- Sortable data
- Value for form submission
- Master Detail view using CSS grid layout

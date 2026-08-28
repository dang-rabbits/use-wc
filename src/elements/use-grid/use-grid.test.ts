import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import "./index";
import { UseGrid } from "./use-grid";
import { UseGridRow } from "./use-gridrow";
import { UseGridCell } from "./use-gridcell";

describe("use-grid", () => {
  function getGrid() {
    return document.querySelector("use-grid") as UseGrid;
  }

  function getRows(grid: UseGrid) {
    return Array.from(grid.querySelectorAll("use-gridrow")) as UseGridRow[];
  }

  function getBodyRows(grid: UseGrid) {
    return Array.from(grid.querySelectorAll("use-gridbody use-gridrow")) as UseGridRow[];
  }

  function getCells(grid: UseGrid) {
    return Array.from(grid.querySelectorAll("use-gridcell")) as UseGridCell[];
  }

  function keydown(target: Element, key: string, options: KeyboardEventInit = {}) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, composed: true, ...options }),
    );
  }

  function basicGrid() {
    return html`
      <use-grid>
        <use-gridhead>
          <use-gridrow>
            <use-gridcell>Name</use-gridcell>
            <use-gridcell>Role</use-gridcell>
          </use-gridrow>
        </use-gridhead>
        <use-gridbody>
          <use-gridrow value="1">
            <use-gridcell>Alice</use-gridcell>
            <use-gridcell>Admin</use-gridcell>
          </use-gridrow>
          <use-gridrow value="2">
            <use-gridcell>Bob</use-gridcell>
            <use-gridcell>User</use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
    `;
  }

  describe("ARIA attributes", () => {
    it("sets aria-rowcount to total number of rows", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.getAttribute("aria-rowcount")).toBe("3");
    });

    it("sets aria-colcount to number of columns", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.getAttribute("aria-colcount")).toBe("2");
    });

    it("sets aria-rowindex on each row (1-based)", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getRows(grid);
      expect(rows[0].getAttribute("aria-rowindex")).toBe("1");
      expect(rows[1].getAttribute("aria-rowindex")).toBe("2");
      expect(rows[2].getAttribute("aria-rowindex")).toBe("3");
    });

    it("sets aria-colindex on each cell (1-based)", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const firstRow = getRows(grid)[0];
      const cells = Array.from(firstRow.querySelectorAll("use-gridcell")) as UseGridCell[];
      expect(cells[0].getAttribute("aria-colindex")).toBe("1");
      expect(cells[1].getAttribute("aria-colindex")).toBe("2");
    });

    it("sets aria-multiselectable when selectmode is multiple", async () => {
      render(html`<use-grid selectmode="multiple">${basicGrid()}</use-grid>`);
      render(
        html`<use-grid selectmode="multiple"
          ><use-gridbody
            ><use-gridrow value="1"><use-gridcell>A</use-gridcell></use-gridrow></use-gridbody
          ></use-grid
        >`,
      );
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.getAttribute("aria-multiselectable")).toBe("true");
    });

    it("does not set aria-multiselectable when selectmode is single", async () => {
      render(
        html`<use-grid selectmode="single"
          ><use-gridbody
            ><use-gridrow value="1"><use-gridcell>A</use-gridcell></use-gridrow></use-gridbody
          ></use-grid
        >`,
      );
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.getAttribute("aria-multiselectable")).toBeNull();
    });

    it("sets aria-selected on rows when selectmode is not none", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1"><use-gridcell>A</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const row = getBodyRows(grid)[0];
      expect(row.getAttribute("aria-selected")).toBe("false");
    });

    it("omits aria-selected when selectmode is none", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows.forEach((row) => {
        expect(row.getAttribute("aria-selected")).toBeNull();
      });
    });

    it("sets aria-selected to true on a selected row", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1" selected><use-gridcell>A</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const row = getBodyRows(grid)[0];
      await row.updateComplete;
      expect(row.getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("role assignment", () => {
    it("assigns role=grid to the host element", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.getAttribute("role")).toBe("grid");
    });

    it("assigns role=row to gridrow elements", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getRows(grid);
      rows.forEach((row) => {
        expect(row.getAttribute("role")).toBe("row");
      });
    });

    it("assigns role=columnheader to cells inside use-gridhead", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const headerRow = grid.querySelector("use-gridhead use-gridrow")!;
      const headerCells = Array.from(headerRow.querySelectorAll("use-gridcell")) as UseGridCell[];
      headerCells.forEach((cell) => {
        expect(cell.getAttribute("role")).toBe("columnheader");
      });
    });

    it("assigns role=gridcell to cells inside use-gridbody", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const bodyRows = getBodyRows(grid);
      bodyRows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll("use-gridcell")) as UseGridCell[];
        cells.forEach((cell) => {
          expect(cell.getAttribute("role")).toBe("gridcell");
        });
      });
    });
  });

  describe("single selection", () => {
    function singleGrid() {
      return html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1">
              <use-gridcell>Alice</use-gridcell>
              <use-gridcell>Admin</use-gridcell>
            </use-gridrow>
            <use-gridrow value="2">
              <use-gridcell>Bob</use-gridcell>
              <use-gridcell>User</use-gridcell>
            </use-gridrow>
          </use-gridbody>
        </use-grid>
      `;
    }

    it("clicking a row selects it", async () => {
      render(singleGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      expect(rows[0].selected).toBe(true);
    });

    it("clicking a row deselects the previously selected row", async () => {
      render(singleGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      rows[1].click();
      await grid.updateComplete;
      expect(rows[0].selected).toBe(false);
      expect(rows[1].selected).toBe(true);
    });

    it("clicking a selected row deselects it", async () => {
      render(singleGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      rows[0].click();
      await grid.updateComplete;
      expect(rows[0].selected).toBe(false);
    });

    it("dispatches use-change with the selected value string", async () => {
      render(singleGrid());
      const grid = getGrid();
      await grid.updateComplete;

      let detail: { value: unknown } | undefined;
      grid.addEventListener("use-change", (e) => (detail = (e as CustomEvent).detail), {
        once: true,
      });

      getBodyRows(grid)[0].click();
      await grid.updateComplete;

      expect(detail!.value).toBe("1");
    });

    it("does not dispatch use-change during initialization", async () => {
      let changeCount = 0;
      render(html`
        <use-grid selectmode="single" @use-change=${() => changeCount++}>
          <use-gridbody>
            <use-gridrow value="1" selected><use-gridcell>A</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      expect(changeCount).toBe(0);
    });

    it("sets value from a pre-selected row", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1" selected><use-gridcell>A</use-gridcell></use-gridrow>
            <use-gridrow value="2"><use-gridcell>B</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      expect(grid.value).toBe("1");
    });
  });

  describe("multiple selection", () => {
    function multiGrid() {
      return html`
        <use-grid selectmode="multiple">
          <use-gridbody>
            <use-gridrow value="1">
              <use-gridcell>Alice</use-gridcell>
            </use-gridrow>
            <use-gridrow value="2">
              <use-gridcell>Bob</use-gridcell>
            </use-gridrow>
            <use-gridrow value="3">
              <use-gridcell>Carol</use-gridcell>
            </use-gridrow>
          </use-gridbody>
        </use-grid>
      `;
    }

    it("clicking multiple rows selects them all", async () => {
      render(multiGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      rows[1].click();
      await grid.updateComplete;
      expect(rows[0].selected).toBe(true);
      expect(rows[1].selected).toBe(true);
    });

    it("clicking a selected row removes it from the selection", async () => {
      render(multiGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      rows[0].click();
      await grid.updateComplete;
      expect(rows[0].selected).toBe(false);
    });

    it("dispatches use-change with an array of selected values", async () => {
      render(multiGrid());
      const grid = getGrid();
      await grid.updateComplete;

      const values: unknown[] = [];
      grid.addEventListener("use-change", (e) => values.push((e as CustomEvent).detail.value));

      const rows = getBodyRows(grid);
      rows[0].click();
      await grid.updateComplete;
      rows[1].click();
      await grid.updateComplete;

      expect(values[values.length - 1]).toEqual(["1", "2"]);
    });
  });

  describe("disabled rows", () => {
    it("clicking a disabled row does not select it", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1" disabled><use-gridcell>Alice</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const row = getBodyRows(grid)[0];
      row.click();
      await grid.updateComplete;
      expect(row.selected).toBe(false);
    });

    it("reflects the disabled prop to aria-disabled but leaves an author-set value alone", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1" disabled><use-gridcell>A</use-gridcell></use-gridrow>
            <use-gridrow value="2" aria-disabled="true"><use-gridcell>B</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      const [propRow, ariaRow] = getBodyRows(grid);
      await propRow.updateComplete;
      await ariaRow.updateComplete;
      expect(propRow.getAttribute("aria-disabled")).toBe("true");
      expect(ariaRow.getAttribute("aria-disabled")).toBe("true");

      propRow.disabled = false;
      await propRow.updateComplete;
      expect(propRow.hasAttribute("aria-disabled")).toBe(false);
    });

    it("does not select a row that only has aria-disabled=true", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1" aria-disabled="true"><use-gridcell>A</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const row = getBodyRows(grid)[0];
      row.click();
      await grid.updateComplete;
      expect(row.selected).toBe(false);
    });

    it("keeps disabled rows keyboard-navigable so their content stays perceivable", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1"><use-gridcell>A1</use-gridcell></use-gridrow>
            <use-gridrow value="2" disabled><use-gridcell>B1</use-gridcell></use-gridrow>
            <use-gridrow value="3"><use-gridcell>C1</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[0].tabIndex = 0;
      cells[0].focus();
      keydown(cells[0], "ArrowDown");
      expect(document.activeElement).toBe(cells[1]);
      expect(cells[1].closest("use-gridrow")).toBe(getBodyRows(grid)[1]);
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowRight moves focus to the next cell", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[0].tabIndex = 0;
      cells[0].focus();
      keydown(cells[0], "ArrowRight");
      expect(document.activeElement).toBe(cells[1]);
    });

    it("ArrowLeft moves focus to the previous cell", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[1].tabIndex = 0;
      cells[1].focus();
      keydown(cells[1], "ArrowLeft");
      expect(document.activeElement).toBe(cells[0]);
    });

    it("ArrowDown moves focus down one row", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      const columnCount = 2;
      cells[0].tabIndex = 0;
      cells[0].focus();
      keydown(cells[0], "ArrowDown");
      expect(document.activeElement).toBe(cells[columnCount]);
    });

    it("ArrowUp moves focus up one row", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      const columnCount = 2;
      cells[columnCount].tabIndex = 0;
      cells[columnCount].focus();
      keydown(cells[columnCount], "ArrowUp");
      expect(document.activeElement).toBe(cells[0]);
    });

    it("ArrowRight does not move past the last cell in a row", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[1].tabIndex = 0;
      cells[1].focus();
      keydown(cells[1], "ArrowRight");
      expect(document.activeElement).toBe(cells[1]);
    });

    it("ArrowLeft does not move before the first cell in a row", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[0].tabIndex = 0;
      cells[0].focus();
      keydown(cells[0], "ArrowLeft");
      expect(document.activeElement).toBe(cells[0]);
    });

    it("Shift+Space selects the row of the focused cell", async () => {
      render(html`
        <use-grid selectmode="single">
          <use-gridbody>
            <use-gridrow value="1">
              <use-gridcell>Alice</use-gridcell>
              <use-gridcell>Admin</use-gridcell>
            </use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      cells[0].tabIndex = 0;
      cells[0].focus();
      keydown(cells[0], " ", { shiftKey: true });
      await grid.updateComplete;
      expect(getBodyRows(grid)[0].selected).toBe(true);
    });

    it("first non-disabled cell gets tabIndex 0 after initialization", async () => {
      render(basicGrid());
      const grid = getGrid();
      await grid.updateComplete;
      const cells = getCells(grid);
      expect(cells[0].tabIndex).toBe(0);
    });
  });

  describe("selectwith", () => {
    async function settle(grid: UseGrid) {
      await grid.updateComplete;
      await Promise.all(getRows(grid).map((row) => row.updateComplete));
      await grid.updateComplete;
    }

    function selectionCells(row: Element) {
      return Array.from(
        row.querySelectorAll("use-gridcell[data-usewc-selection-cell]"),
      ) as UseGridCell[];
    }

    function bodyInputs(grid: UseGrid) {
      return Array.from(
        grid.querySelectorAll<HTMLInputElement>(
          "use-gridbody use-gridcell[data-usewc-selection-cell] input",
        ),
      );
    }

    function headerInput(grid: UseGrid) {
      return grid.querySelector<HTMLInputElement>(
        "use-gridhead use-gridcell[data-usewc-selection-cell] input",
      );
    }

    function columnGrid(
      selectmode: "multiple" | "single",
      selectwith = "control",
      extra: { disabledSecondRow?: boolean } = {},
    ) {
      return html`
        <use-grid selectmode=${selectmode} selectwith=${selectwith} name="ids">
          <use-gridhead>
            <use-gridrow>
              <use-gridcell>Name</use-gridcell>
              <use-gridcell>Role</use-gridcell>
            </use-gridrow>
          </use-gridhead>
          <use-gridbody>
            <use-gridrow value="1">
              <use-gridcell>Alice</use-gridcell>
              <use-gridcell>Admin</use-gridcell>
            </use-gridrow>
            <use-gridrow value="2" ?disabled=${extra.disabledSecondRow ?? false}>
              <use-gridcell>Bob</use-gridcell>
              <use-gridcell>User</use-gridcell>
            </use-gridrow>
            <use-gridrow value="3">
              <use-gridcell>Carol</use-gridcell>
              <use-gridcell>User</use-gridcell>
            </use-gridrow>
          </use-gridbody>
        </use-grid>
      `;
    }

    it("injects one selection cell in the header and every body row when selectwith includes control", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      getRows(grid).forEach((row) => {
        expect(selectionCells(row)).toHaveLength(1);
        expect(selectionCells(row)[0]).toBe(row.firstElementChild);
      });
    });

    it("normalizes the selectwith token order to canonical (row before control)", async () => {
      render(html`
        <use-grid selectmode="multiple" selectwith="control row">
          <use-gridbody>
            <use-gridrow value="1"><use-gridcell>A</use-gridcell></use-gridrow>
          </use-gridbody>
        </use-grid>
      `);
      const grid = getGrid();
      await settle(grid);
      expect(grid.selectwith).toBe("row control");
      expect(grid.getAttribute("selectwith")).toBe("row control");
    });

    it("marks rows with data-usewc-selection-column while the control column is present", async () => {
      render(columnGrid("multiple", "row"));
      const grid = getGrid();
      await settle(grid);
      expect(getRows(grid).some((row) => row.hasAttribute("data-usewc-selection-column"))).toBe(
        false,
      );

      grid.selectwith = "control";
      await settle(grid);
      expect(getRows(grid).every((row) => row.hasAttribute("data-usewc-selection-column"))).toBe(
        true,
      );

      grid.selectwith = "row";
      await settle(grid);
      expect(getRows(grid).some((row) => row.hasAttribute("data-usewc-selection-column"))).toBe(
        false,
      );
    });

    it("does not inject a selection cell without the control token", async () => {
      render(columnGrid("multiple", "row"));
      const grid = getGrid();
      await settle(grid);
      expect(bodyInputs(grid)).toHaveLength(0);
      expect(headerInput(grid)).toBeNull();
    });

    it("adds and removes the column when selectwith changes at runtime", async () => {
      render(columnGrid("multiple", "row"));
      const grid = getGrid();
      await settle(grid);
      expect(bodyInputs(grid)).toHaveLength(0);

      grid.selectwith = "control";
      await settle(grid);
      expect(bodyInputs(grid)).toHaveLength(3);

      grid.selectwith = "row";
      await settle(grid);
      expect(bodyInputs(grid)).toHaveLength(0);
      expect(getGrid().querySelectorAll("use-gridcell[data-usewc-selection-cell]")).toHaveLength(0);
    });

    it("uses checkboxes and a header select-all for multiple", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      bodyInputs(grid).forEach((input) => expect(input.type).toBe("checkbox"));
      expect(headerInput(grid)?.type).toBe("checkbox");
    });

    it("keeps injected controls out of the tab sequence; a selection cell holds the roving tab stop", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      // Every injected control stays out of the tab sequence...
      [headerInput(grid)!, ...bodyInputs(grid)].forEach((input) => expect(input.tabIndex).toBe(-1));
      // ...and exactly one selection cell (mode="action") is the grid's single tab stop.
      const tabStops = Array.from(
        grid.querySelectorAll<HTMLElement>("use-gridcell[data-usewc-selection-cell]"),
      ).filter((cell) => cell.tabIndex === 0);
      expect(tabStops).toHaveLength(1);
      expect(tabStops[0].getAttribute("mode")).toBe("action");
    });

    it("hands focus to the control when its cell is focused", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      const selectionCell = getBodyRows(grid)[0].querySelector(
        "use-gridcell[data-usewc-selection-cell]",
      ) as HTMLElement;
      selectionCell.focus();
      expect(document.activeElement).toBe(bodyInputs(grid)[0]);
    });

    it("a disabled row's control is still reachable by focus", async () => {
      render(columnGrid("multiple", "control", { disabledSecondRow: true }));
      const grid = getGrid();
      await settle(grid);
      const cell = getBodyRows(grid)[1].querySelector(
        "use-gridcell[data-usewc-selection-cell]",
      ) as HTMLElement;
      cell.focus();
      expect(document.activeElement).toBe(bodyInputs(grid)[1]);
    });

    it("swaps the injected control type when selectmode flips between multiple and single", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      bodyInputs(grid).forEach((input) => expect(input.type).toBe("checkbox"));

      grid.selectmode = "single";
      await settle(grid);
      const radios = bodyInputs(grid);
      expect(radios).toHaveLength(3);
      radios.forEach((input) => expect(input.type).toBe("radio"));
      expect(new Set(radios.map((input) => input.name)).size).toBe(1);
      expect(headerInput(grid)?.type).toBe("radio");
      expect(headerInput(grid)?.disabled).toBe(true);

      grid.selectmode = "multiple";
      await settle(grid);
      bodyInputs(grid).forEach((input) => expect(input.type).toBe("checkbox"));
      expect(headerInput(grid)?.disabled).toBe(false);
    });

    it("uses radios sharing a name and an inert hidden header spacer for single", async () => {
      render(columnGrid("single"));
      const grid = getGrid();
      await settle(grid);
      const inputs = bodyInputs(grid);
      inputs.forEach((input) => expect(input.type).toBe("radio"));
      expect(new Set(inputs.map((input) => input.name)).size).toBe(1);

      const header = headerInput(grid);
      expect(header?.type).toBe("radio");
      expect(header?.disabled).toBe(true);
      expect(header?.getAttribute("aria-hidden")).toBe("true");
    });

    it("body control checked state tracks row.selected", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      const [alice] = getBodyRows(grid);
      expect(bodyInputs(grid)[0].checked).toBe(false);
      alice.selected = true;
      await settle(grid);
      expect(bodyInputs(grid)[0].checked).toBe(true);
    });

    it("clicking a body checkbox selects the row and fires use-change with the array", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);

      let detail: unknown;
      grid.addEventListener("use-change", (e) => (detail = (e as CustomEvent).detail.value));

      bodyInputs(grid)[0].click();
      await settle(grid);

      expect(getBodyRows(grid)[0].selected).toBe(true);
      expect(detail).toEqual(["1"]);
    });

    it("selecting one radio clears the others", async () => {
      render(columnGrid("single"));
      const grid = getGrid();
      await settle(grid);
      bodyInputs(grid)[0].click();
      await settle(grid);
      bodyInputs(grid)[2].click();
      await settle(grid);
      const rows = getBodyRows(grid);
      expect(rows[0].selected).toBe(false);
      expect(rows[2].selected).toBe(true);
      expect(grid.value).toBe("3");
    });

    it("header select-all checks and clears every non-disabled row", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      const selectAll = headerInput(grid)!;

      selectAll.click();
      await settle(grid);
      expect(getBodyRows(grid).every((row) => row.selected)).toBe(true);

      selectAll.click();
      await settle(grid);
      expect(getBodyRows(grid).some((row) => row.selected)).toBe(false);
    });

    it("header select-all reports indeterminate on a partial selection", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      bodyInputs(grid)[0].click();
      await settle(grid);
      const selectAll = headerInput(grid)!;
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(true);
    });

    it("marks the injected input of a disabled row aria-disabled (still focusable) and skips select-all", async () => {
      render(columnGrid("multiple", "control", { disabledSecondRow: true }));
      const grid = getGrid();
      await settle(grid);
      const secondInput = bodyInputs(grid)[1];
      expect(secondInput.disabled).toBe(false);
      expect(secondInput.getAttribute("aria-disabled")).toBe("true");
      expect(secondInput.tabIndex).toBe(-1);

      headerInput(grid)!.click();
      await settle(grid);
      const rows = getBodyRows(grid);
      expect(rows[0].selected).toBe(true);
      expect(rows[1].selected).toBe(false);
      expect(rows[2].selected).toBe(true);
      expect(headerInput(grid)!.checked).toBe(true);
    });

    it("counts the injected column in aria-colcount and aria-colindex", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      expect(grid.getAttribute("aria-colcount")).toBe("3");
      const firstBodyRow = getBodyRows(grid)[0];
      const cells = Array.from(firstBodyRow.querySelectorAll("use-gridcell"));
      expect(cells[0].getAttribute("aria-colindex")).toBe("1");
      expect(cells[1].getAttribute("aria-colindex")).toBe("2");
    });

    it("programmatic grid.value updates the injected checkboxes without clobbering select-all", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      grid.value = ["1", "3"];
      await settle(grid);
      const inputs = bodyInputs(grid);
      expect(inputs.map((input) => input.checked)).toEqual([true, false, true]);
      expect(headerInput(grid)!.indeterminate).toBe(true);
    });

    it("does not clone the checkmark indicators when a control column is present", async () => {
      render(columnGrid("multiple"));
      const grid = getGrid();
      await settle(grid);
      expect(grid.querySelectorAll('[part~="selected-indicator-default"]')).toHaveLength(0);
    });

    describe("row click", () => {
      it("row control: a row-body click toggles row and checkbox exactly once", async () => {
        render(columnGrid("multiple", "row control"));
        const grid = getGrid();
        await settle(grid);

        let changeCount = 0;
        grid.addEventListener("use-change", () => changeCount++);

        (getBodyRows(grid)[0].querySelectorAll("use-gridcell")[1] as HTMLElement).click();
        await settle(grid);

        expect(getBodyRows(grid)[0].selected).toBe(true);
        expect(bodyInputs(grid)[0].checked).toBe(true);
        expect(changeCount).toBe(1);
      });

      it("row control: clicking the checkbox toggles once, not twice", async () => {
        render(columnGrid("multiple", "row control"));
        const grid = getGrid();
        await settle(grid);

        let changeCount = 0;
        grid.addEventListener("use-change", () => changeCount++);

        bodyInputs(grid)[0].click();
        await settle(grid);

        expect(getBodyRows(grid)[0].selected).toBe(true);
        expect(changeCount).toBe(1);
      });

      it("control only: clicking the row body does nothing but the checkbox still works", async () => {
        render(columnGrid("multiple", "control"));
        const grid = getGrid();
        await settle(grid);

        (getBodyRows(grid)[0].querySelectorAll("use-gridcell")[1] as HTMLElement).click();
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(false);

        bodyInputs(grid)[0].click();
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(true);
      });

      it("selectwith none: neither click path selects, Shift+Space still does", async () => {
        render(columnGrid("multiple", "none"));
        const grid = getGrid();
        await settle(grid);
        expect(bodyInputs(grid)).toHaveLength(0);

        const firstCell = getBodyRows(grid)[0].querySelector("use-gridcell") as HTMLElement;
        firstCell.click();
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(false);

        firstCell.tabIndex = 0;
        firstCell.focus();
        keydown(firstCell, " ", { shiftKey: true });
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(true);
      });

      it("row control: clicking the selection cell (not the checkbox) still selects the row", async () => {
        render(columnGrid("multiple", "row control"));
        const grid = getGrid();
        await settle(grid);

        const selectionCell = getBodyRows(grid)[0].querySelector(
          "use-gridcell[data-usewc-selection-cell]",
        ) as HTMLElement;
        selectionCell.click();
        await settle(grid);

        expect(getBodyRows(grid)[0].selected).toBe(true);
        expect(bodyInputs(grid)[0].checked).toBe(true);
      });

      it("a click on the non-interactive area of a widget cell still selects the row", async () => {
        render(html`
          <use-grid selectmode="single">
            <use-gridbody>
              <use-gridrow value="1">
                <use-gridcell mode="widget">
                  <span>Alice</span>
                  <button type="button">Edit</button>
                </use-gridcell>
              </use-gridrow>
            </use-gridbody>
          </use-grid>
        `);
        const grid = getGrid();
        await settle(grid);
        (grid.querySelector("span") as HTMLElement).click();
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(true);
      });

      it("a click on a button in a widget cell does not toggle the row", async () => {
        render(html`
          <use-grid selectmode="multiple">
            <use-gridbody>
              <use-gridrow value="1">
                <use-gridcell>Alice</use-gridcell>
                <use-gridcell mode="widget">
                  <button type="button">Edit</button>
                  <button type="button">Remove</button>
                </use-gridcell>
              </use-gridrow>
            </use-gridbody>
          </use-grid>
        `);
        const grid = getGrid();
        await settle(grid);
        const button = grid.querySelector("button") as HTMLButtonElement;
        button.click();
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(false);
      });

      it("a click on a link inside a plain cell does not toggle the row or get its default prevented", async () => {
        render(html`
          <use-grid selectmode="single">
            <use-gridbody>
              <use-gridrow value="1">
                <use-gridcell><a href="#target">Alice</a></use-gridcell>
              </use-gridrow>
            </use-gridbody>
          </use-grid>
        `);
        const grid = getGrid();
        await settle(grid);
        const link = grid.querySelector("a") as HTMLAnchorElement;
        const event = new MouseEvent("click", { bubbles: true, composed: true, cancelable: true });
        link.dispatchEvent(event);
        await settle(grid);
        expect(getBodyRows(grid)[0].selected).toBe(false);
        expect(event.defaultPrevented).toBe(false);
      });
    });
  });
});

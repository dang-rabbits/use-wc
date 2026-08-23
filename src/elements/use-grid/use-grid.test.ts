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
});

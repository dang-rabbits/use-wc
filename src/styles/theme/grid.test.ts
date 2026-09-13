import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import type { UseGrid } from "../../elements/use-grid/use-grid";
import "../tokens.css";
import "../theme.css";
import "../../elements/use-grid/use-grid";
import "../../elements/use-grid/use-gridbody";
import "../../elements/use-grid/use-gridrow";
import "../../elements/use-grid/use-gridcell";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

describe("grid cell alignment", () => {
  it("centers a shorter cell against a row stretched taller by a sibling cell", async () => {
    render(html`
      <use-grid>
        <use-gridbody>
          <use-gridrow>
            <use-gridcell id="short">Short</use-gridcell>
            <use-gridcell id="tall" style="max-inline-size: 6rem">
              This is a much longer piece of text that wraps across two lines
            </use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
    `);

    const grid = document.querySelector("use-grid") as UseGrid;
    await grid.updateComplete;

    const row = document.querySelector("use-gridrow")!;
    const shortCell = document.getElementById("short")!;
    const tallCell = document.getElementById("tall")!;

    expect(styleOf(row, "align-items")).toBe("center");

    const rowRect = row.getBoundingClientRect();
    const shortRect = shortCell.getBoundingClientRect();
    const tallRect = tallCell.getBoundingClientRect();

    // The short cell sizes to its own content, not stretched to the row's full height.
    expect(shortRect.height).toBeLessThan(tallRect.height);

    // ...and that shorter box sits centred in the row rather than flush with its top edge.
    expect(shortRect.top).toBeGreaterThan(rowRect.top + 4);
    expect(shortRect.bottom).toBeLessThan(rowRect.bottom - 4);
  });

  it("keeps a cell's multiple children on one line instead of stacking them", async () => {
    render(html`
      <use-grid>
        <use-gridbody>
          <use-gridrow>
            <use-gridcell id="controls">
              <button type="button">Edit</button>
              <button type="button">Delete</button>
            </use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
    `);

    const grid = document.querySelector("use-grid") as UseGrid;
    await grid.updateComplete;

    const cell = document.getElementById("controls")!;
    const [edit, deleteButton] = Array.from(cell.querySelectorAll("button"));

    // Side by side, not stacked: the second button's top matches the first's, not its bottom.
    expect(deleteButton.getBoundingClientRect().top).toBeCloseTo(
      edit.getBoundingClientRect().top,
      0,
    );
  });
});

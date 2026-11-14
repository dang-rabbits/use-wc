import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";
import "../../elements/use-menu/use-menu.ts";

function height(id: string) {
  return document.getElementById(id)!.getBoundingClientRect().height;
}

describe("menu", () => {
  it("sizes menu items to the base button height", async () => {
    render(html`
      <button id="button">Button</button>
      <use-menu aria-label="Menu">
        <button role="menuitem" id="item">Item</button>
        <button role="menuitemcheckbox" aria-checked="true" id="checkbox-item">
          Checkbox item
        </button>
      </use-menu>
    `);

    await customElements.whenDefined("use-menu");

    expect(height("item")).toBe(height("button"));
    expect(height("checkbox-item")).toBe(height("button"));
  });
});

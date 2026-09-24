import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

describe("use-pattern", () => {
  it("does not inherit an ancestor variant's region padding token into a nested use-pattern", async () => {
    render(html`
      <use-pattern class="card">
        <main>
          <use-pattern id="nested"><div>item</div></use-pattern>
        </main>
      </use-pattern>
    `);

    expect(styleOf(document.getElementById("nested")!, "--usewc-layout-region-padding")).toBe("");
  });

  it("stacks a card in a column", async () => {
    render(html`<use-pattern class="card" id="card"><div>a</div></use-pattern>`);

    expect(styleOf(document.getElementById("card")!, "flex-direction")).toBe("column");
  });

  for (const variant of ["entry", "message", "card"]) {
    it(`${variant} grows and scrolls a use-layout[fill] region while pinning siblings`, async () => {
      render(html`
        <use-pattern class=${variant} style="height: 300px">
          <header id="header">header</header>
          <use-layout fill id="body">body</use-layout>
          <footer id="footer">footer</footer>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("header")!, "flex")).toBe("0 0 auto");
      expect(styleOf(document.getElementById("footer")!, "flex")).toBe("0 0 auto");
      expect(styleOf(document.getElementById("body")!, "flex-grow")).toBe("1");
      expect(styleOf(document.getElementById("body")!, "overflow-y")).toBe("auto");
    });

    it(`${variant} leaves children alone when no use-layout[fill] is present`, async () => {
      render(html`
        <use-pattern class=${variant}>
          <div id="child">x</div>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("child")!, "flex-shrink")).toBe("1");
    });
  }
});

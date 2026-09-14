import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-layout";
import { UseLayout } from "./use-layout";
import "../../styles/tokens.css";
import "../../styles/theme.css";

async function settle(layout: UseLayout) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (await layout.updateComplete) {
      return;
    }
  }
}

describe("use-layout", () => {
  it("carries no shadow DOM and leaves its light-DOM children untouched", async () => {
    render(html`
      <use-layout>
        <button id="one" type="button">One</button>
        <button id="two" type="button">Two</button>
      </use-layout>
    `);
    const layout = document.querySelector("use-layout") as UseLayout;
    await settle(layout);

    expect(layout.shadowRoot).toBeNull();
    expect(document.getElementById("one")?.parentElement).toBe(layout);
    expect(document.getElementById("two")?.parentElement).toBe(layout);
  });

  it("sets no align/justify/gap/direction attribute by default", async () => {
    render(html`<use-layout></use-layout>`);
    const layout = document.querySelector("use-layout") as UseLayout;
    await settle(layout);

    expect(layout.hasAttribute("direction")).toBe(false);
    expect(layout.hasAttribute("align")).toBe(false);
    expect(layout.hasAttribute("justify")).toBe(false);
    expect(layout.hasAttribute("gap")).toBe(false);
  });

  it("reflects its properties onto the matching attributes", async () => {
    render(html`<use-layout></use-layout>`);
    const layout = document.querySelector("use-layout") as UseLayout;
    await settle(layout);

    layout.direction = "row";
    layout.align = "center";
    layout.justify = "space-between";
    layout.gap = "small";
    layout.wrap = true;
    layout.inline = true;
    layout.fill = true;
    await settle(layout);

    expect(layout.getAttribute("direction")).toBe("row");
    expect(layout.getAttribute("align")).toBe("center");
    expect(layout.getAttribute("justify")).toBe("space-between");
    expect(layout.getAttribute("gap")).toBe("small");
    expect(layout.hasAttribute("wrap")).toBe(true);
    expect(layout.hasAttribute("inline")).toBe(true);
    expect(layout.hasAttribute("fill")).toBe(true);
  });

  it("drops the direction attribute again once set back to column", async () => {
    render(html`<use-layout direction="row"></use-layout>`);
    const layout = document.querySelector("use-layout") as UseLayout;
    await settle(layout);
    expect(layout.getAttribute("direction")).toBe("row");

    layout.direction = "column";
    await settle(layout);

    expect(layout.hasAttribute("direction")).toBe(false);
  });

  it("reads an attribute set at parse time into its matching property", async () => {
    render(html`<use-layout direction="row" align="center" gap="small"></use-layout>`);
    const layout = document.querySelector("use-layout") as UseLayout;
    await settle(layout);

    expect(layout.direction).toBe("row");
    expect(layout.align).toBe("center");
    expect(layout.gap).toBe("small");
  });

  describe("padding", () => {
    it("splits a two-token padding value into padding-block and padding-inline", async () => {
      render(html`<use-layout padding="medium small"></use-layout>`);
      const layout = document.querySelector("use-layout") as UseLayout;
      await settle(layout);

      expect(layout.paddingBlock).toBe("medium");
      expect(layout.paddingInline).toBe("small");
      expect(layout.getAttribute("padding-block")).toBe("medium");
      expect(layout.getAttribute("padding-inline")).toBe("small");
    });

    it("leaves padding-block/padding-inline alone for a single-token padding value", async () => {
      render(html`<use-layout padding="medium"></use-layout>`);
      const layout = document.querySelector("use-layout") as UseLayout;
      await settle(layout);

      expect(layout.hasAttribute("padding-block")).toBe(false);
      expect(layout.hasAttribute("padding-inline")).toBe(false);
    });

    it("re-splits when the compound value changes", async () => {
      render(html`<use-layout padding="medium small"></use-layout>`);
      const layout = document.querySelector("use-layout") as UseLayout;
      await settle(layout);

      layout.padding = "none large";
      await settle(layout);

      expect(layout.paddingBlock).toBe("none");
      expect(layout.paddingInline).toBe("large");
    });
  });
});

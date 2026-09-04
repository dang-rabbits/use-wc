import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

describe("use-layout", () => {
  it("is a flex column by default and leaves standalone children alone", async () => {
    render(html`
      <use-layout>
        <div id="child">item</div>
      </use-layout>
    `);
    const layout = document.querySelector("use-layout") as HTMLElement;

    expect(styleOf(layout, "display")).toBe("flex");
    expect(styleOf(layout, "flex-direction")).toBe("column");
    expect(styleOf(document.getElementById("child")!, "flex-shrink")).toBe("1");
  });

  it("maps direction, wrap, align, and justify attributes", async () => {
    render(html`
      <use-layout direction="row" wrap align="center" justify="space-between">
        <div>item</div>
      </use-layout>
    `);
    const layout = document.querySelector("use-layout") as HTMLElement;

    expect(styleOf(layout, "flex-direction")).toBe("row");
    expect(styleOf(layout, "flex-wrap")).toBe("wrap");
    expect(styleOf(layout, "align-items")).toBe("center");
    expect(styleOf(layout, "justify-content")).toBe("space-between");
  });

  it("renders inline-flex with the inline attribute", async () => {
    render(html`<use-layout inline><div>item</div></use-layout>`);
    const layout = document.querySelector("use-layout") as HTMLElement;

    expect(styleOf(layout, "display")).toBe("inline-flex");
  });

  it("resolves the named gap scale to its token value", async () => {
    render(html`<use-layout gap="medium"><div>item</div></use-layout>`);
    const layout = document.querySelector("use-layout") as HTMLElement;

    expect(styleOf(layout, "column-gap")).toBe("8px");
  });

  it("reverts to unstyled markup inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <use-layout gap="medium">
          <div>item</div>
        </use-layout>
      </use-theme-escape>
    `);
    const layout = document.querySelector("use-layout") as HTMLElement;

    expect(styleOf(layout, "display")).toBe("inline");
    expect(styleOf(layout, "column-gap")).toBe("normal");
  });

  describe("fill", () => {
    it("grows the fill child and pins every sibling, before and after it", async () => {
      render(html`
        <use-layout direction="column" style="height: 300px">
          <div id="header" style="height: 50px">header</div>
          <use-layout fill id="body"><div>body</div></use-layout>
          <div id="footer" style="height: 30px">footer</div>
        </use-layout>
      `);
      const body = document.getElementById("body") as HTMLElement;

      expect(styleOf(body, "flex-grow")).toBe("1");
      expect(styleOf(document.getElementById("header")!, "flex-shrink")).toBe("0");
      expect(styleOf(document.getElementById("footer")!, "flex-shrink")).toBe("0");
      expect(Math.round(body.getBoundingClientRect().height)).toBe(220);
    });

    it("keeps fixed siblings from shrinking when the fill content overflows", async () => {
      render(html`
        <use-layout style="height: 200px">
          <div id="header" style="height: 40px">header</div>
          <use-layout fill id="body" style="overflow: auto">
            <div style="height: 600px; flex: none">tall content</div>
          </use-layout>
        </use-layout>
      `);
      const body = document.getElementById("body") as HTMLElement;

      expect(Math.round(document.getElementById("header")!.getBoundingClientRect().height)).toBe(
        40,
      );
      expect(Math.round(body.getBoundingClientRect().height)).toBe(160);
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    });

    it("does not pin children when no child carries fill", async () => {
      render(html`
        <use-layout direction="column" style="height: 100px">
          <div id="a">a</div>
          <div id="b">b</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("a")!, "flex-shrink")).toBe("1");
    });

    it("ignores fill on anything but a use-layout, so an svg fill attribute is safe", async () => {
      render(html`
        <use-layout direction="column" style="height: 120px">
          <div id="sibling" style="height: 20px">sibling</div>
          <div fill id="plain">plain</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("plain")!, "flex-grow")).toBe("0");
      expect(styleOf(document.getElementById("sibling")!, "flex-shrink")).toBe("1");
    });
  });

  describe("variants", () => {
    for (const variant of ["page", "prose", "message", "card"]) {
      it(`${variant} grows and scrolls its fill region while pinning siblings`, async () => {
        render(html`
          <use-layout class=${variant} style="height: 300px">
            <header id="header">header</header>
            <use-layout fill id="body">body</use-layout>
            <footer id="footer">footer</footer>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("header")!, "flex")).toBe("0 0 auto");
        expect(styleOf(document.getElementById("footer")!, "flex")).toBe("0 0 auto");
        expect(styleOf(document.getElementById("body")!, "flex-grow")).toBe("1");
        expect(styleOf(document.getElementById("body")!, "overflow-y")).toBe("auto");
      });

      it(`${variant} leaves children alone when no use-layout[fill] is present`, async () => {
        render(html`
          <use-layout class=${variant}>
            <div id="child">x</div>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("child")!, "flex-shrink")).toBe("1");
      });

      it(`${variant} defaults to a column, with direction=row overriding`, async () => {
        render(html`
          <div>
            <use-layout id="stacked" class=${variant}><div>a</div></use-layout>
            <use-layout id="row" class=${variant} direction="row"><div>a</div></use-layout>
          </div>
        `);

        expect(styleOf(document.getElementById("stacked")!, "flex-direction")).toBe("column");
        expect(styleOf(document.getElementById("row")!, "flex-direction")).toBe("row");
      });
    }
  });
});

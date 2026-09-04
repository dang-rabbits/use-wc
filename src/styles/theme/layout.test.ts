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
          <div fill id="body" style="overflow: auto">
            <div style="height: 600px">tall content</div>
          </div>
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

    it("pins a plain element carrying fill, not only a nested use-layout", async () => {
      render(html`
        <use-layout direction="column" style="height: 120px">
          <div id="fixed" style="height: 20px">fixed</div>
          <div fill id="grow">grow</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("fixed")!, "flex-shrink")).toBe("0");
      expect(styleOf(document.getElementById("grow")!, "flex-grow")).toBe("1");
      expect(Math.round(document.getElementById("grow")!.getBoundingClientRect().height)).toBe(100);
    });
  });

  describe("shell composition", () => {
    it("class=shell pins every child and grows the [fill] region", async () => {
      render(html`
        <use-layout class="shell" direction="column" style="height: 300px">
          <div id="header">header</div>
          <div fill id="body">body</div>
          <div id="footer">footer</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("header")!, "flex")).toBe("0 0 auto");
      expect(styleOf(document.getElementById("footer")!, "flex")).toBe("0 0 auto");
      expect(styleOf(document.getElementById("body")!, "flex-grow")).toBe("1");
      expect(styleOf(document.getElementById("body")!, "overflow-y")).toBe("auto");
    });

    it("pins children even with no [fill] present, unlike a bare use-layout", async () => {
      render(html`
        <div>
          <use-layout id="bare" direction="column"><div id="bare-child">x</div></use-layout>
          <use-layout id="shell" class="shell" direction="column">
            <div id="shell-child">x</div>
          </use-layout>
        </div>
      `);

      expect(styleOf(document.getElementById("bare-child")!, "flex-shrink")).toBe("1");
      expect(styleOf(document.getElementById("shell-child")!, "flex-shrink")).toBe("0");
    });

    it("defaults .shell to a column, with direction=row overriding", async () => {
      render(html`
        <div>
          <use-layout id="bare-shell" class="shell"><div>a</div></use-layout>
          <use-layout id="row-shell" class="shell" direction="row"><div>a</div></use-layout>
        </div>
      `);

      expect(styleOf(document.getElementById("bare-shell")!, "flex-direction")).toBe("column");
      expect(styleOf(document.getElementById("row-shell")!, "flex-direction")).toBe("row");
    });
  });
});

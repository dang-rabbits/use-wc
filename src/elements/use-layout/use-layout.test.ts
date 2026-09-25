import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../../styles/tokens.css";
import "../../styles/theme.css";
import "./use-layout";
import { UseLayout } from "./use-layout";
import "../use-avatar/use-avatar";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

const supportsRowRule = CSS.supports("row-rule-style", "solid");

const imageSource =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3C/svg%3E";

describe("use-layout", () => {
  it("leaves children unpadded with no spacing attribute", async () => {
    render(html`<use-layout><div id="child">item</div></use-layout>`);

    expect(styleOf(document.getElementById("child")!, "padding-top")).toBe("0px");
  });

  it("halves the named spacing scale onto every direct child's block padding", async () => {
    render(html`
      <use-layout spacing="medium">
        <div id="first">item</div>
        <div id="middle">item</div>
        <div id="last">item</div>
      </use-layout>
    `);

    // Medium resolves to 12px — half of that (6px) lands on each side, so two neighbours'
    // touching edges add up to one full spacing unit between them.
    expect(styleOf(document.getElementById("first")!, "padding-bottom")).toBe("6px");
    expect(styleOf(document.getElementById("middle")!, "padding-top")).toBe("6px");
    expect(styleOf(document.getElementById("middle")!, "padding-bottom")).toBe("6px");
    expect(styleOf(document.getElementById("last")!, "padding-top")).toBe("6px");
  });

  it("forces the first child's own block-start to zero", async () => {
    render(html`
      <use-layout spacing="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("first")!, "padding-top")).toBe("0px");
  });

  it("forces the last child's own block-end to zero", async () => {
    render(html`
      <use-layout spacing="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("last")!, "padding-bottom")).toBe("0px");
  });

  it("zeroes both edges when there is only a single child", async () => {
    render(html`<use-layout spacing="medium"><div id="only">item</div></use-layout>`);

    const only = document.getElementById("only")!;
    expect(styleOf(only, "padding-top")).toBe("0px");
    expect(styleOf(only, "padding-bottom")).toBe("0px");
  });

  it("resolves none to an explicit zero", async () => {
    render(html`<use-layout spacing="none"><div id="child">item</div></use-layout>`);

    expect(styleOf(document.getElementById("child")!, "padding-bottom")).toBe("0px");
  });

  it("leaves children without inline padding with no gutter attribute", async () => {
    render(html`<use-layout><div id="child">item</div></use-layout>`);

    expect(styleOf(document.getElementById("child")!, "padding-left")).toBe("0px");
  });

  it("puts the named gutter scale's full value on every direct child's inline padding", async () => {
    render(html`
      <use-layout gutter="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-layout>
    `);

    // Unlike spacing, gutter isn't halved and has no first/last exception — every child gets
    // the full value on both sides uniformly.
    expect(styleOf(document.getElementById("first")!, "padding-left")).toBe("12px");
    expect(styleOf(document.getElementById("first")!, "padding-right")).toBe("12px");
    expect(styleOf(document.getElementById("last")!, "padding-left")).toBe("12px");
    expect(styleOf(document.getElementById("last")!, "padding-right")).toBe("12px");
  });

  it("resolves gutter's none to an explicit zero", async () => {
    render(html`<use-layout gutter="none"><div id="child">item</div></use-layout>`);

    expect(styleOf(document.getElementById("child")!, "padding-left")).toBe("0px");
  });

  it("combines spacing and gutter independently on the same layout", async () => {
    render(html`
      <use-layout spacing="small" gutter="large">
        <div id="only">item</div>
      </use-layout>
    `);

    const only = document.getElementById("only")!;
    expect(styleOf(only, "padding-top")).toBe("0px");
    expect(styleOf(only, "padding-left")).toBe("16px");
  });

  it("gives a nested use-layout child its parent's gutter and spacing", async () => {
    render(html`
      <use-layout spacing="medium" gutter="small">
        <div>item</div>
        <use-layout id="nested"><div>item</div></use-layout>
        <div>item</div>
      </use-layout>
    `);
    const nested = document.getElementById("nested")!;

    expect(styleOf(nested, "padding-left")).toBe("4px");
    expect(styleOf(nested, "padding-top")).toBe("6px");
    expect(styleOf(nested, "padding-bottom")).toBe("6px");
  });

  it("lets a nested use-layout child's own padding win over its parent's gutter and spacing", async () => {
    render(html`
      <use-layout spacing="medium" gutter="small">
        <div>item</div>
        <use-layout id="nested" paddinginline="large" paddingblock="xsmall">
          <div>item</div>
        </use-layout>
        <div>item</div>
      </use-layout>
    `);
    const nested = document.getElementById("nested")!;

    expect(styleOf(nested, "padding-left")).toBe("16px");
    expect(styleOf(nested, "padding-top")).toBe("2px");
  });

  describe("padding", () => {
    it("resolves a single named token to all four sides of the layout itself, not its children", async () => {
      render(html`<use-layout padding="medium"><div id="child">item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "padding-top")).toBe("12px");
      expect(styleOf(layout, "padding-left")).toBe("12px");
      expect(styleOf(document.getElementById("child")!, "padding-top")).toBe("0px");
    });

    it("resolves none to an explicit zero", async () => {
      render(html`<use-layout padding="none"><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "padding-top")).toBe("0px");
    });

    it("resolves paddingblock and paddinginline independently", async () => {
      render(
        html`<use-layout paddingblock="large" paddinginline="xsmall"><div>item</div></use-layout>`,
      );
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "padding-top")).toBe("16px");
      expect(styleOf(layout, "padding-left")).toBe("2px");
    });

    it("doesn't pass its own padding down to a nested use-layout", async () => {
      render(html`
        <use-layout padding="large" paddinginline="small">
          <use-layout id="inner" divided="full" gap="small">
            <div>item</div>
            <div>item</div>
          </use-layout>
        </use-layout>
      `);
      const inner = document.getElementById("inner")!;

      expect(styleOf(inner, "padding-top")).toBe("0px");
      expect(styleOf(inner, "padding-left")).toBe("0px");
      if (supportsRowRule) {
        expect(styleOf(inner, "row-rule-inset")).toBe("0px");
      }
    });

    it("lets paddingblock/paddinginline override padding when both are set", async () => {
      render(html`<use-layout padding="small" paddinginline="xlarge"><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "padding-top")).toBe("4px");
      expect(styleOf(layout, "padding-left")).toBe("24px");
    });
  });

  describe("gap", () => {
    it("resolves the named gap scale onto the layout's own real gap property", async () => {
      render(html`<use-layout gap="medium"><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "column-gap")).toBe("12px");
    });

    it("leaves the layout with no gap of its own with no gap attribute", async () => {
      render(html`<use-layout><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "column-gap")).toBe("0px");
    });
  });

  describe("direction", () => {
    it("is a flex column by default", async () => {
      render(html`<use-layout><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "display")).toBe("flex");
      expect(styleOf(layout, "flex-direction")).toBe("column");
    });

    it("switches to a row with direction=row", async () => {
      render(html`<use-layout direction="row"><div>item</div></use-layout>`);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "flex-direction")).toBe("row");
    });
  });

  describe("divided", () => {
    it("draws a rule on every child that follows another one, never the first", async () => {
      render(html`
        <use-layout divided>
          <div id="first">item</div>
          <div id="middle">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("first")!, "border-top-style")).toBe("none");
      expect(styleOf(document.getElementById("middle")!, "border-top-style")).toBe("solid");
      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
    });

    it("draws no rule at all with a single child", async () => {
      render(html`<use-layout divided><div id="only">item</div></use-layout>`);

      expect(styleOf(document.getElementById("only")!, "border-top-style")).toBe("none");
    });

    it("draws no rule at all with no divided attribute", async () => {
      render(html`
        <use-layout>
          <div id="first">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("none");
    });

    it("draws into the real gap with row-rule when gap is set and spacing isn't, or falls back to a border", async () => {
      render(html`
        <use-layout divided gap="medium">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      const layout = document.querySelector("use-layout")!;
      if (supportsRowRule) {
        expect(styleOf(layout, "row-rule-style")).toBe("solid");
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("none");
      } else {
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
      }
    });

    it("still uses a plain border when both gap and spacing are set", async () => {
      render(html`
        <use-layout divided gap="medium" spacing="small">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
    });

    it("bleeds the row-rule through the layout's own padding when divided is full", async () => {
      render(html`
        <use-layout divided="full" gap="medium" padding="large">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      const layout = document.querySelector("use-layout")!;
      if (supportsRowRule) {
        // Padding resolves to 16px; row-rule-inset takes it negated so the native rule bleeds
        // outward through that padding to the layout's edge instead of inward.
        expect(styleOf(layout, "row-rule-inset")).toBe("-16px");
      } else {
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
      }
    });

    it("keeps row-rule-inset at zero when divided is full but no padding is set", async () => {
      render(html`
        <use-layout divided="full" gap="medium">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-layout>
      `);

      if (supportsRowRule) {
        expect(styleOf(document.querySelector("use-layout")!, "row-rule-inset")).toBe("0px");
      }
    });
  });
  describe("element", () => {
    it("carries no shadow DOM and leaves its light-DOM children untouched", async () => {
      render(html`
        <use-layout>
          <button id="one" type="button">One</button>
          <button id="two" type="button">Two</button>
        </use-layout>
      `);
      const layout = document.querySelector("use-layout") as UseLayout;
      await layout.updateComplete;

      expect(layout.shadowRoot).toBeNull();
      expect(document.getElementById("one")?.parentElement).toBe(layout);
      expect(document.getElementById("two")?.parentElement).toBe(layout);
    });

    it("reflects its properties onto the matching attributes", async () => {
      render(html`<use-layout></use-layout>`);
      const layout = document.querySelector("use-layout") as UseLayout;
      await layout.updateComplete;

      layout.direction = "row";
      layout.paddingBlock = "small";
      layout.divided = "full";
      layout.wrap = true;
      layout.inline = true;
      layout.fill = true;
      await layout.updateComplete;

      expect(layout.getAttribute("direction")).toBe("row");
      expect(layout.getAttribute("paddingblock")).toBe("small");
      expect(layout.getAttribute("divided")).toBe("full");
      expect(layout.hasAttribute("wrap")).toBe(true);
      expect(layout.hasAttribute("inline")).toBe(true);
      expect(layout.hasAttribute("fill")).toBe(true);
    });

    it("reads a bare divided attribute as true and drops it again once cleared", async () => {
      render(html`<use-layout divided></use-layout>`);
      const layout = document.querySelector("use-layout") as UseLayout;
      await layout.updateComplete;
      expect(layout.divided).toBe("true");

      layout.divided = "";
      await layout.updateComplete;

      expect(layout.hasAttribute("divided")).toBe(false);
    });
  });

  describe("flex attributes", () => {
    it("maps wrap, align, and justify", async () => {
      render(html`
        <use-layout direction="row" wrap align="center" justify="space-between">
          <div>item</div>
        </use-layout>
      `);
      const layout = document.querySelector("use-layout")!;

      expect(styleOf(layout, "flex-wrap")).toBe("wrap");
      expect(styleOf(layout, "align-items")).toBe("center");
      expect(styleOf(layout, "justify-content")).toBe("space-between");
    });

    it("renders inline-flex with the inline attribute", async () => {
      render(html`<use-layout inline><div>item</div></use-layout>`);

      expect(styleOf(document.querySelector("use-layout")!, "display")).toBe("inline-flex");
    });
  });

  describe("fill", () => {
    it("grows the fill child and pins every sibling, before and after it", async () => {
      render(html`
        <use-layout style="height: 300px">
          <div id="header" style="height: 50px">header</div>
          <use-layout fill id="body"><div>body</div></use-layout>
          <div id="footer" style="height: 30px">footer</div>
        </use-layout>
      `);
      const body = document.getElementById("body")!;

      expect(styleOf(body, "flex-grow")).toBe("1");
      expect(styleOf(document.getElementById("header")!, "flex-shrink")).toBe("0");
      expect(styleOf(document.getElementById("footer")!, "flex-shrink")).toBe("0");
      expect(Math.round(body.getBoundingClientRect().height)).toBe(220);
    });

    it("scrolls its own overflow instead of letting its siblings shrink", async () => {
      render(html`
        <use-layout style="height: 200px">
          <div id="header" style="height: 40px">header</div>
          <use-layout fill id="body">
            <div style="height: 600px; flex: none">tall content</div>
          </use-layout>
        </use-layout>
      `);
      const body = document.getElementById("body")!;

      expect(Math.round(document.getElementById("header")!.getBoundingClientRect().height)).toBe(
        40,
      );
      expect(styleOf(body, "overflow-y")).toBe("auto");
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    });

    it("ignores fill on anything but a use-layout, so an svg fill attribute is safe", async () => {
      render(html`
        <use-layout style="height: 120px">
          <div id="sibling" style="height: 20px">sibling</div>
          <div fill id="plain">plain</div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("plain")!, "flex-grow")).toBe("0");
      expect(styleOf(document.getElementById("sibling")!, "flex-shrink")).toBe("1");
    });
  });

  describe("page", () => {
    it("spends its inset as spacing, gutter, and block padding, with no rule by default", async () => {
      render(html`
        <use-layout class="page" id="page">
          <header id="header">
            <hgroup><h4>Brand</h4></hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer">status</footer>
        </use-layout>
      `);
      const page = document.getElementById("page")!;
      const header = document.getElementById("header")!;
      const body = document.getElementById("body")!;
      const footer = document.getElementById("footer")!;

      expect(styleOf(page, "padding-top")).toBe("16px");
      expect(styleOf(page, "padding-bottom")).toBe("16px");
      expect(styleOf(page, "padding-left")).toBe("0px");
      expect(styleOf(page, "column-gap")).toBe("0px");
      expect(styleOf(header, "padding-top")).toBe("0px");
      expect(styleOf(header, "padding-bottom")).toBe("16px");
      expect(styleOf(body, "padding-top")).toBe("16px");
      expect(styleOf(body, "padding-bottom")).toBe("16px");
      expect(styleOf(body, "padding-left")).toBe("24px");
      expect(styleOf(body, "padding-right")).toBe("24px");
      expect(styleOf(footer, "padding-bottom")).toBe("0px");
      expect(styleOf(header, "border-bottom-width")).toBe("0px");
      expect(styleOf(footer, "border-top-width")).toBe("0px");
    });

    it("gives a plain child the same gutter as header/main/footer", async () => {
      render(html`
        <use-layout class="page">
          <div id="section">
            <p>first</p>
          </div>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("section")!, "padding-left")).toBe("24px");
    });

    it("rules its regions off with a border on each one after the first when divided", async () => {
      render(html`
        <use-layout class="page" divided id="page">
          <header id="header">
            <hgroup><h4>Brand</h4></hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer">status</footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("page")!, "row-rule-style")).not.toBe("solid");
      expect(styleOf(document.getElementById("header")!, "border-top-style")).toBe("none");
      expect(styleOf(document.getElementById("body")!, "border-top-style")).toBe("solid");
      expect(styleOf(document.getElementById("footer")!, "border-top-style")).toBe("solid");
    });

    it("keeps the topbar a flex row with its title group's margins shed", async () => {
      render(html`
        <use-layout class="page">
          <header id="header">
            <section>
              <hgroup id="hgroup"><h4 id="title">Brand</h4></hgroup>
            </section>
          </header>
          <footer>status</footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("header")!, "display")).toBe("flex");
      expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      expect(styleOf(document.getElementById("title")!, "margin-top")).toBe("0px");
      expect(styleOf(document.getElementById("title")!, "margin-bottom")).toBe("0px");
    });

    it("bleeds a leading figure past the gutter and its own block padding", async () => {
      render(html`
        <use-layout class="page">
          <figure id="figure"><img alt="" src=${imageSource} /></figure>
          <main>body</main>
        </use-layout>
      `);
      const figure = document.getElementById("figure")!;

      expect(styleOf(figure, "padding-left")).toBe("0px");
      expect(styleOf(figure, "margin-top")).toBe("-16px");
    });

    it("splits its footer so status sits opposite the actions", async () => {
      render(html`
        <use-layout class="page">
          <footer id="footer"><span>Saved</span></footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("space-between");
    });

    it("aligns its footer to the end when it ends in a submit button", async () => {
      render(html`
        <use-layout class="page">
          <footer id="footer">
            <button type="button">Cancel</button>
            <button type="submit">Save</button>
          </footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("end");
    });

    it("aligns its footer to the end with the actions class", async () => {
      render(html`
        <use-layout class="page">
          <footer id="footer" class="actions">
            <button type="button">Cancel</button>
            <button type="button">Apply</button>
          </footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("end");
    });

    it("still splits a footer holding two sections, even when it ends in a submit button", async () => {
      render(html`
        <use-layout class="page">
          <footer id="footer">
            <section><span>Draft saved</span></section>
            <section><button type="submit">Publish</button></section>
          </footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("space-between");
    });

    it("squares a figure avatar and grows the title group", async () => {
      render(html`
        <use-layout class="page">
          <header>
            <figure id="avatar"><img id="portrait" alt="" src=${imageSource} /></figure>
            <hgroup id="hgroup"><h4>Title</h4></hgroup>
          </header>
        </use-layout>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("36px");
      expect(styleOf(avatar, "height")).toBe("36px");
      expect(styleOf(avatar, "margin-left")).toBe("0px");
      expect(styleOf(document.getElementById("portrait")!, "object-fit")).toBe("cover");
      expect(styleOf(document.getElementById("hgroup")!, "flex-grow")).toBe("1");
    });

    it("sizes a use-avatar in a header to the page's avatar size", async () => {
      render(html`
        <use-layout class="page">
          <header><use-avatar id="avatar" name="Riley Quinn"></use-avatar></header>
        </use-layout>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("36px");
      expect(styleOf(avatar, "height")).toBe("36px");
    });

    it("leaves a bare img in a header alone, with no avatar class convention", async () => {
      render(html`
        <use-layout class="page">
          <header>
            <img id="logo" alt="" src=${imageSource} />
          </header>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("logo")!, "border-radius")).toBe("0px");
    });
    it("lets spacing, gutter, and padding attributes override its own defaults", async () => {
      render(html`
        <use-layout class="page" id="page" spacing="xsmall" gutter="none" paddingblock="none">
          <header></header>
          <main id="body"></main>
        </use-layout>
      `);
      const body = document.getElementById("body")!;

      expect(styleOf(document.getElementById("page")!, "padding-top")).toBe("0px");
      expect(styleOf(body, "padding-top")).toBe("1px");
      expect(styleOf(body, "padding-left")).toBe("0px");
    });

    it("grows and scrolls main while pinning the header and footer", async () => {
      render(html`
        <use-layout class="page" style="height: 300px">
          <header id="header">header</header>
          <main id="main"><div style="height: 900px">tall</div></main>
          <footer id="footer">footer</footer>
        </use-layout>
      `);
      const main = document.getElementById("main")!;

      expect(styleOf(main, "flex-grow")).toBe("1");
      expect(styleOf(main, "overflow-y")).toBe("auto");
      expect(styleOf(document.getElementById("header")!, "flex-shrink")).toBe("0");
      expect(styleOf(document.getElementById("footer")!, "flex-shrink")).toBe("0");
      expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
    });

    it("doesn't pass its page defaults down to a nested use-layout", async () => {
      render(html`
        <use-layout class="page">
          <main>
            <use-layout id="nested"><div id="nested-child">item</div></use-layout>
          </main>
        </use-layout>
      `);
      const nested = document.getElementById("nested")!;

      expect(styleOf(nested, "padding-top")).toBe("0px");
      expect(styleOf(nested, "column-gap")).toBe("0px");
      expect(styleOf(document.getElementById("nested-child")!, "padding-left")).toBe("0px");
    });
  });
});

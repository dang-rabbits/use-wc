import { expect, describe, it } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";
import "../../elements/use-control-set/use-control-set.ts";

function element(id: string) {
  return document.getElementById(id)!;
}

describe("control set", () => {
  it("holds a current page link in its pressed look", async () => {
    render(html`
      <use-control-set>
        <a class="appearance-button" href="#" id="page">1</a>
        <a class="appearance-button" href="#" id="current" aria-current="page">2</a>
      </use-control-set>
    `);

    const pageStyle = getComputedStyle(element("page"));
    const currentStyle = getComputedStyle(element("current"));
    expect(currentStyle.backgroundColor).not.toBe(pageStyle.backgroundColor);
  });

  it("ignores aria-current set to false", async () => {
    render(html`
      <use-control-set>
        <a class="appearance-button" href="#" id="page">1</a>
        <a class="appearance-button" href="#" id="not-current" aria-current="false">2</a>
      </use-control-set>
    `);

    expect(getComputedStyle(element("not-current")).backgroundColor).toBe(
      getComputedStyle(element("page")).backgroundColor,
    );
  });

  it("keeps the outer corners rounded and squares the touching ones", async () => {
    render(html`
      <use-control-set>
        <button id="first">1</button>
        <button id="middle">2</button>
        <button id="last">3</button>
      </use-control-set>
      <button id="standalone">4</button>
    `);

    const radius = getComputedStyle(element("standalone")).borderTopLeftRadius;
    expect(radius).not.toBe("0px");

    const firstStyle = getComputedStyle(element("first"));
    expect(firstStyle.borderTopLeftRadius).toBe(radius);
    expect(firstStyle.borderBottomLeftRadius).toBe(radius);
    expect(firstStyle.borderTopRightRadius).toBe("0px");
    expect(firstStyle.borderBottomRightRadius).toBe("0px");

    const middleStyle = getComputedStyle(element("middle"));
    expect(middleStyle.borderTopLeftRadius).toBe("0px");
    expect(middleStyle.borderTopRightRadius).toBe("0px");

    const lastStyle = getComputedStyle(element("last"));
    expect(lastStyle.borderTopLeftRadius).toBe("0px");
    expect(lastStyle.borderBottomLeftRadius).toBe("0px");
    expect(lastStyle.borderTopRightRadius).toBe(radius);
    expect(lastStyle.borderBottomRightRadius).toBe(radius);
  });

  it("keeps every corner of a lone child rounded", async () => {
    render(html`
      <use-control-set>
        <button id="lone">1</button>
      </use-control-set>
      <button id="standalone">2</button>
    `);

    const radius = getComputedStyle(element("standalone")).borderTopLeftRadius;
    const loneStyle = getComputedStyle(element("lone"));
    expect(loneStyle.borderTopLeftRadius).toBe(radius);
    expect(loneStyle.borderTopRightRadius).toBe(radius);
    expect(loneStyle.borderBottomLeftRadius).toBe(radius);
    expect(loneStyle.borderBottomRightRadius).toBe(radius);
  });

  it("keeps a focused child above a hovered sibling", async () => {
    render(html`
      <use-control-set>
        <button id="focused">1</button>
        <button id="hovered">2</button>
      </use-control-set>
    `);

    element("focused").focus();
    await userEvent.hover(element("hovered"));

    const focusedLayer = Number(getComputedStyle(element("focused")).zIndex);
    const hoveredLayer = Number(getComputedStyle(element("hovered")).zIndex);
    expect(hoveredLayer).toBe(1);
    expect(focusedLayer).toBeGreaterThan(hoveredLayer);
  });

  it("renders a plain span as a bordered cell matching its neighbors' height", async () => {
    render(html`
      <use-control-set>
        <a class="appearance-button" href="#" id="page">1</a>
        <span id="gap" aria-hidden="true">&hellip;</span>
        <a class="appearance-button" href="#">10</a>
      </use-control-set>
    `);

    const gapStyle = getComputedStyle(element("gap"));
    expect(gapStyle.borderTopWidth).toBe("1px");
    expect(gapStyle.marginInlineStart).toBe("-1px");
    expect(element("gap").getBoundingClientRect().height).toBe(
      element("page").getBoundingClientRect().height,
    );
  });

  it("casts one shadow from a set holding a primary button instead of one per child", async () => {
    render(html`
      <use-control-set id="set">
        <button type="button" class="primary" id="action">Save</button>
        <button type="button" class="primary" id="trigger" aria-label="More save options">
          <use-caret></use-caret>
        </button>
      </use-control-set>
      <button type="button" class="primary" id="lone">Save</button>
    `);

    const setShadow = getComputedStyle(element("set")).boxShadow;
    const loneShadow = getComputedStyle(element("lone")).boxShadow;
    expect(setShadow).not.toBe("none");
    expect(loneShadow).toContain(setShadow);
    for (const id of ["action", "trigger"]) {
      expect(getComputedStyle(element(id)).boxShadow).not.toContain("1px 2px");
      expect(getComputedStyle(element(id)).boxShadow).toContain("inset");
    }

    await userEvent.hover(element("trigger"));
    await expect
      .poll(() => getComputedStyle(element("set")).boxShadow)
      .toContain("0px 2px 4px 0px");
  });

  it("tints a danger set's shadow from the danger button", async () => {
    render(html`
      <use-control-set id="set">
        <button type="button" class="danger">Delete</button>
        <button type="button" class="danger" aria-label="More delete options">
          <use-caret></use-caret>
        </button>
      </use-control-set>
      <button type="button" class="danger" id="lone">Delete</button>
    `);

    expect(getComputedStyle(element("lone")).boxShadow).toContain(
      getComputedStyle(element("set")).boxShadow,
    );
  });

  it("follows the button shadow geometry tokens", async () => {
    render(html`
      <use-control-set
        id="set"
        style="--usewc-effect-button-shadow-outset-offset-x: 3px; --usewc-effect-button-shadow-outset-offset-y: 3px; --usewc-effect-button-shadow-outset-blur: 0px;"
      >
        <button type="button" class="primary">Save</button>
        <button type="button" class="primary" aria-label="More save options">
          <use-caret></use-caret>
        </button>
      </use-control-set>
    `);

    expect(getComputedStyle(element("set")).boxShadow).toContain("3px 3px 0px 0px");
  });

  it("casts one base-tinted shadow from a set of base buttons", async () => {
    render(html`
      <use-control-set id="set">
        <button type="button" id="first">Bold</button>
        <button type="button">Italic</button>
      </use-control-set>
      <button type="button" id="lone">Bold</button>
    `);

    const setShadow = getComputedStyle(element("set")).boxShadow;
    expect(setShadow).toContain("0px 1px 2px 0px");
    expect(getComputedStyle(element("lone")).boxShadow).toContain(setShadow);
    expect(getComputedStyle(element("first")).boxShadow).not.toContain("1px 2px");
  });

  it("leaves a set of only clear or auxiliary buttons without a shadow", async () => {
    render(html`
      <use-control-set id="set">
        <button type="button" class="clear">Bold</button>
        <button type="button" class="auxiliary">Italic</button>
      </use-control-set>
    `);

    expect(getComputedStyle(element("set")).boxShadow).toBe("none");
  });
});

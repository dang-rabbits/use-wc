import { expect, describe, it } from "vite-plus/test";
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
    expect(currentStyle.boxShadow).not.toBe(pageStyle.boxShadow);
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
});

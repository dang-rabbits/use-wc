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

import { expect, describe, it, afterEach } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function indicatorScale(id: string) {
  return getComputedStyle(document.getElementById(id)!, "::before").scale;
}

describe("details", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("mirrors the disclosure indicator in a right-to-left subtree", async () => {
    render(html`
      <details><summary id="left-to-right">Summary</summary></details>
      <div dir="rtl">
        <details><summary id="right-to-left">Summary</summary></details>
        <details>
          <summary class="appearance-button" id="right-to-left-button">Summary</summary>
        </details>
      </div>
    `);

    expect(indicatorScale("left-to-right")).toBe("none");
    expect(indicatorScale("right-to-left")).toBe("-1 1");
    expect(indicatorScale("right-to-left-button")).toBe("-1 1");
  });

  it("leaves the swapped icon alone in a right-to-left document", async () => {
    document.documentElement.setAttribute("dir", "rtl");
    render(html`
      <details><summary id="right-to-left">Summary</summary></details>
      <div dir="ltr">
        <details><summary id="left-to-right">Summary</summary></details>
      </div>
    `);

    expect(indicatorScale("right-to-left")).toBe("none");
    expect(indicatorScale("left-to-right")).toBe("-1 1");
  });
});

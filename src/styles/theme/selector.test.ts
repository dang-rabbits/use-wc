import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function style(id: string, pseudoElement?: string) {
  return getComputedStyle(document.getElementById(id)!, pseudoElement);
}

describe("selector", () => {
  it("keeps the checkbox checkmark's shape in right-to-left layouts", async () => {
    render(html`
      <input type="checkbox" checked aria-label="Left to right" id="left-to-right" />
      <div dir="rtl">
        <input type="checkbox" checked aria-label="Right to left" id="right-to-left" />
      </div>
    `);

    const leftToRight = style("left-to-right", "::after");
    const rightToLeft = style("right-to-left", "::after");
    expect(rightToLeft.left).toBe(leftToRight.left);
    expect(rightToLeft.borderRightWidth).toBe(leftToRight.borderRightWidth);
    expect(rightToLeft.borderLeftWidth).toBe("0px");
    expect(rightToLeft.transform).toBe(leftToRight.transform);
  });
});

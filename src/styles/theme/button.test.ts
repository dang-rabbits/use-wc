import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function box(id: string) {
  return document.getElementById(id)!.getBoundingClientRect();
}

describe("button", () => {
  it("squares a labelled button whose only child is an svg or icon", async () => {
    render(html`
      <button type="button" aria-label="Close" id="svg">
        <svg viewBox="0 0 2 2" width="24" height="24"></svg>
      </button>
      <button type="button" aria-label="Close" id="icon"><span class="icon">&times;</span></button>
    `);

    for (const id of ["svg", "icon"]) {
      expect(box(id).width).toBe(36);
      expect(box(id).height).toBe(36);
    }
  });

  it("keeps its inline padding without a label or a marked-up icon", async () => {
    render(html`
      <button type="button" id="unlabelled"><span class="icon">&times;</span></button>
      <button type="button" aria-label="Close" id="unmarked"><span>&times;</span></button>
    `);

    for (const id of ["unlabelled", "unmarked"]) {
      expect(getComputedStyle(document.getElementById(id)!).paddingLeft).toBe("15px");
    }
  });
});

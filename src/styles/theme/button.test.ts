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

  it("holds a pressed or mixed toggle in its pressed look", async () => {
    render(html`
      <button type="button" aria-pressed="false" id="off">Bold</button>
      <button type="button" aria-pressed="true" id="on">Bold</button>
      <button type="button" aria-pressed="mixed" id="mixed">Bold</button>
    `);

    const offStyle = getComputedStyle(document.getElementById("off")!);
    for (const id of ["on", "mixed"]) {
      const pressedStyle = getComputedStyle(document.getElementById(id)!);
      expect(pressedStyle.backgroundColor).not.toBe(offStyle.backgroundColor);
      expect(pressedStyle.boxShadow).not.toBe(offStyle.boxShadow);
    }
  });

  it("renders an unpressed toggle like a plain button", async () => {
    render(html`
      <button type="button" id="plain">Bold</button>
      <button type="button" aria-pressed="false" id="off">Bold</button>
    `);

    const plainStyle = getComputedStyle(document.getElementById("plain")!);
    const offStyle = getComputedStyle(document.getElementById("off")!);
    expect(offStyle.backgroundColor).toBe(plainStyle.backgroundColor);
    expect(offStyle.boxShadow).toBe(plainStyle.boxShadow);
  });

  it("themes the pressed look apart from the active one", async () => {
    render(html`
      <button type="button" id="plain">Bold</button>
      <button
        type="button"
        aria-pressed="true"
        id="pressed"
        style="--usewc-color-button-base-background-pressed: rgb(1, 2, 3)"
      >
        Bold
      </button>
    `);

    const pressedStyle = getComputedStyle(document.getElementById("pressed")!);
    expect(pressedStyle.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(pressedStyle.getPropertyValue("--usewc-local-button-background-active")).toBe(
      getComputedStyle(document.getElementById("plain")!).getPropertyValue(
        "--usewc-local-button-background-active",
      ),
    );
  });

  it("reads each variant's own pressed tokens", async () => {
    render(html`
      <button
        type="button"
        class="primary"
        aria-pressed="true"
        id="primary"
        style="--usewc-color-button-primary-background-pressed: rgb(1, 2, 3)"
      >
        Bold
      </button>
      <button
        type="button"
        class="primary auxiliary"
        aria-pressed="true"
        id="auxiliary"
        style="--usewc-color-button-primary-background-pressed-auxiliary: rgb(4, 5, 6)"
      >
        Bold
      </button>
    `);

    expect(getComputedStyle(document.getElementById("primary")!).backgroundColor).toBe(
      "rgb(1, 2, 3)",
    );
    expect(getComputedStyle(document.getElementById("auxiliary")!).backgroundColor).toBe(
      "rgb(4, 5, 6)",
    );
  });

  it("holds a pressed clear toggle in its pressed look", async () => {
    render(html`
      <button type="button" class="clear" aria-pressed="false" id="off">Bold</button>
      <button type="button" class="clear" aria-pressed="true" id="on">Bold</button>
    `);

    expect(getComputedStyle(document.getElementById("on")!).backgroundColor).not.toBe(
      getComputedStyle(document.getElementById("off")!).backgroundColor,
    );
  });
});

import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../../styles/tokens.css";
import "../../styles/theme.css";
import "./use-box";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

const supportsRowRule = CSS.supports("row-rule-style", "solid");

describe("use-box", () => {
  it("leaves children unpadded with no spacing attribute", async () => {
    render(html`<use-box><div id="child">item</div></use-box>`);

    expect(styleOf(document.getElementById("child")!, "padding-top")).toBe("0px");
  });

  it("halves the named spacing scale onto every direct child's block padding", async () => {
    render(html`
      <use-box spacing="medium">
        <div id="first">item</div>
        <div id="middle">item</div>
        <div id="last">item</div>
      </use-box>
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
      <use-box spacing="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-box>
    `);

    expect(styleOf(document.getElementById("first")!, "padding-top")).toBe("0px");
  });

  it("forces the last child's own block-end to zero", async () => {
    render(html`
      <use-box spacing="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-box>
    `);

    expect(styleOf(document.getElementById("last")!, "padding-bottom")).toBe("0px");
  });

  it("zeroes both edges when there is only a single child", async () => {
    render(html`<use-box spacing="medium"><div id="only">item</div></use-box>`);

    const only = document.getElementById("only")!;
    expect(styleOf(only, "padding-top")).toBe("0px");
    expect(styleOf(only, "padding-bottom")).toBe("0px");
  });

  it("resolves none to an explicit zero", async () => {
    render(html`<use-box spacing="none"><div id="child">item</div></use-box>`);

    expect(styleOf(document.getElementById("child")!, "padding-bottom")).toBe("0px");
  });

  it("leaves children without inline padding with no gutter attribute", async () => {
    render(html`<use-box><div id="child">item</div></use-box>`);

    expect(styleOf(document.getElementById("child")!, "padding-left")).toBe("0px");
  });

  it("puts the named gutter scale's full value on every direct child's inline padding", async () => {
    render(html`
      <use-box gutter="medium">
        <div id="first">item</div>
        <div id="last">item</div>
      </use-box>
    `);

    // Unlike spacing, gutter isn't halved and has no first/last exception — every child gets
    // the full value on both sides uniformly.
    expect(styleOf(document.getElementById("first")!, "padding-left")).toBe("12px");
    expect(styleOf(document.getElementById("first")!, "padding-right")).toBe("12px");
    expect(styleOf(document.getElementById("last")!, "padding-left")).toBe("12px");
    expect(styleOf(document.getElementById("last")!, "padding-right")).toBe("12px");
  });

  it("resolves gutter's none to an explicit zero", async () => {
    render(html`<use-box gutter="none"><div id="child">item</div></use-box>`);

    expect(styleOf(document.getElementById("child")!, "padding-left")).toBe("0px");
  });

  it("combines spacing and gutter independently on the same box", async () => {
    render(html`
      <use-box spacing="small" gutter="large">
        <div id="only">item</div>
      </use-box>
    `);

    const only = document.getElementById("only")!;
    expect(styleOf(only, "padding-top")).toBe("0px");
    expect(styleOf(only, "padding-left")).toBe("16px");
  });

  describe("padding", () => {
    it("resolves a single named token to all four sides of the box itself, not its children", async () => {
      render(html`<use-box padding="medium"><div id="child">item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "padding-top")).toBe("12px");
      expect(styleOf(box, "padding-left")).toBe("12px");
      expect(styleOf(document.getElementById("child")!, "padding-top")).toBe("0px");
    });

    it("resolves none to an explicit zero", async () => {
      render(html`<use-box padding="none"><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "padding-top")).toBe("0px");
    });

    it("resolves paddingblock and paddinginline independently", async () => {
      render(html`<use-box paddingblock="large" paddinginline="xsmall"><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "padding-top")).toBe("16px");
      expect(styleOf(box, "padding-left")).toBe("2px");
    });

    it("doesn't pass its own padding down to a nested use-box", async () => {
      render(html`
        <use-box padding="large" paddinginline="small">
          <use-box id="inner" divided="full" gap="small">
            <div>item</div>
            <div>item</div>
          </use-box>
        </use-box>
      `);
      const inner = document.getElementById("inner")!;

      expect(styleOf(inner, "padding-top")).toBe("0px");
      expect(styleOf(inner, "padding-left")).toBe("0px");
      if (supportsRowRule) {
        expect(styleOf(inner, "row-rule-inset")).toBe("0px");
      }
    });

    it("lets paddingblock/paddinginline override padding when both are set", async () => {
      render(html`<use-box padding="small" paddinginline="xlarge"><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "padding-top")).toBe("4px");
      expect(styleOf(box, "padding-left")).toBe("24px");
    });
  });

  describe("gap", () => {
    it("resolves the named gap scale onto the box's own real gap property", async () => {
      render(html`<use-box gap="medium"><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "column-gap")).toBe("12px");
    });

    it("leaves the box with no gap of its own with no gap attribute", async () => {
      render(html`<use-box><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "column-gap")).toBe("normal");
    });
  });

  describe("direction", () => {
    it("is a flex column by default", async () => {
      render(html`<use-box><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "display")).toBe("flex");
      expect(styleOf(box, "flex-direction")).toBe("column");
    });

    it("switches to a row with direction=row", async () => {
      render(html`<use-box direction="row"><div>item</div></use-box>`);
      const box = document.querySelector("use-box")!;

      expect(styleOf(box, "flex-direction")).toBe("row");
    });
  });

  describe("divided", () => {
    it("draws a rule on every child that follows another one, never the first", async () => {
      render(html`
        <use-box divided>
          <div id="first">item</div>
          <div id="middle">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      expect(styleOf(document.getElementById("first")!, "border-top-style")).toBe("none");
      expect(styleOf(document.getElementById("middle")!, "border-top-style")).toBe("solid");
      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
    });

    it("draws no rule at all with a single child", async () => {
      render(html`<use-box divided><div id="only">item</div></use-box>`);

      expect(styleOf(document.getElementById("only")!, "border-top-style")).toBe("none");
    });

    it("draws no rule at all with no divided attribute", async () => {
      render(html`
        <use-box>
          <div id="first">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("none");
    });

    it("draws into the real gap with row-rule when gap is set and spacing isn't, or falls back to a border", async () => {
      render(html`
        <use-box divided gap="medium">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      const box = document.querySelector("use-box")!;
      if (supportsRowRule) {
        expect(styleOf(box, "row-rule-style")).toBe("solid");
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("none");
      } else {
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
      }
    });

    it("still uses a plain border when both gap and spacing are set", async () => {
      render(html`
        <use-box divided gap="medium" spacing="small">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
    });

    it("bleeds the row-rule through the box's own padding when divided is full", async () => {
      render(html`
        <use-box divided="full" gap="medium" padding="large">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      const box = document.querySelector("use-box")!;
      if (supportsRowRule) {
        // Padding resolves to 16px; row-rule-inset takes it negated so the native rule bleeds
        // outward through that padding to the box's edge instead of inward.
        expect(styleOf(box, "row-rule-inset")).toBe("-16px");
      } else {
        expect(styleOf(document.getElementById("last")!, "border-top-style")).toBe("solid");
      }
    });

    it("keeps row-rule-inset at zero when divided is full but no padding is set", async () => {
      render(html`
        <use-box divided="full" gap="medium">
          <div id="first">item</div>
          <div id="last">item</div>
        </use-box>
      `);

      if (supportsRowRule) {
        expect(styleOf(document.querySelector("use-box")!, "row-rule-inset")).toBe("0px");
      }
    });
  });
});

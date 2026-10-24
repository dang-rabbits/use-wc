import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function style(id: string, pseudoElement?: string) {
  return getComputedStyle(document.getElementById(id)!, pseudoElement);
}

describe("select", () => {
  it("stays enabled when only some of its options are disabled", async () => {
    render(html`
      <select id="partial">
        <option>One</option>
        <option disabled>Two</option>
        <optgroup label="Group" disabled>
          <option>Three</option>
        </optgroup>
      </select>
      <select id="disabled" disabled>
        <option>One</option>
      </select>
    `);

    expect(style("partial").opacity).toBe("1");
    expect(style("partial").pointerEvents).toBe("auto");
    expect(Number(style("disabled").opacity)).toBeLessThan(1);
  });

  it("draws the chevron only on dropdown selects", async () => {
    render(html`
      <select id="dropdown">
        <option>One</option>
      </select>
      <select size="1" id="single-row">
        <option>One</option>
      </select>
      <select multiple id="multiple">
        <option>One</option>
      </select>
      <select size="3" id="sized">
        <option>One</option>
      </select>
    `);

    for (const id of ["dropdown", "single-row"]) {
      expect(style(id).backgroundImage).not.toBe("none");
    }
    for (const id of ["multiple", "sized"]) {
      expect(style(id).backgroundImage).toBe("none");
    }
  });

  it("draws the chevron at the inline end in both directions", async () => {
    render(html`
      <select id="left-to-right">
        <option>One</option>
      </select>
      <div dir="rtl">
        <select id="right-to-left">
          <option>One</option>
        </select>
      </div>
    `);

    expect(style("left-to-right").backgroundPositionX).toBe("calc(100% - 7px)");
    expect(style("right-to-left").backgroundPositionX).toBe("7px");
  });

  it("restores the browser's appearance inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <select id="escaped">
          <option>One</option>
        </select>
      </use-theme-escape>
    `);

    expect(style("escaped").appearance).toBe("auto");
    expect(style("escaped").backgroundImage).toBe("none");
  });
});

describe.runIf(CSS.supports("appearance", "base-select"))("select base-select", () => {
  it("opts a themed dropdown into base-select", async () => {
    render(html`
      <select id="themed">
        <option>One</option>
      </select>
    `);

    expect(style("themed").appearance).toBe("base-select");
    expect(style("themed", "::picker-icon").display).toBe("none");
  });

  it("leaves native, multiple, and sized selects alone", async () => {
    render(html`
      <select class="appearance-native" id="native">
        <option>One</option>
      </select>
      <select multiple id="multiple">
        <option>One</option>
      </select>
      <select size="3" id="sized">
        <option>One</option>
      </select>
    `);

    for (const id of ["native", "multiple", "sized"]) {
      expect(style(id).appearance).not.toBe("base-select");
    }
  });

  it("styles the picker like a popover menu", async () => {
    render(html`
      <select id="themed">
        <option>One</option>
      </select>
    `);

    const pickerStyle = style("themed", "::picker(select)");
    expect(pickerStyle.paddingTop).toBe("4px");
    expect(pickerStyle.borderTopLeftRadius).toBe("8px");
    expect(pickerStyle.boxShadow).not.toBe("none");
  });

  it("styles options like menu items with a masked checkmark", async () => {
    render(html`
      <select>
        <option id="option">One</option>
        <option id="disabled" disabled>Two</option>
      </select>
    `);

    const optionStyle = style("option");
    expect(optionStyle.paddingLeft).toBe("4px");
    expect(optionStyle.borderTopLeftRadius).toBe("4px");
    expect(style("option", "::checkmark").maskImage).toContain("data:image/svg+xml");
    expect(Number(style("disabled").opacity)).toBeLessThan(1);
  });

  it("reverts to the browser's select inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <select id="escaped">
          <option id="option">One</option>
        </select>
      </use-theme-escape>
    `);

    expect(style("escaped").appearance).not.toBe("base-select");
    expect(style("option", "::checkmark").maskImage).toBe("none");
  });
});

import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { userEvent } from "vite-plus/test/browser";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function element(id: string) {
  return document.getElementById(id)!;
}

function textStart(id: string) {
  const textNode = [...element(id).childNodes]
    .reverse()
    .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim())!;
  const text = textNode.textContent!;
  const range = document.createRange();
  range.setStart(textNode, text.length - text.trimStart().length);
  range.setEnd(textNode, text.length);
  return range.getBoundingClientRect().left;
}

const icon = html`<svg viewBox="0 0 24 24" aria-hidden="true">
  <rect width="24" height="24" />
</svg>`;

describe("sidebar", () => {
  it("styles links nested inside a group the same as top-level links", async () => {
    render(html`
      <nav class="sidebar">
        <a href="#" id="top">Dashboard</a>
        <details open>
          <summary>Projects</summary>
          <a href="#" id="nested">Website</a>
        </details>
      </nav>
    `);

    const topStyle = getComputedStyle(element("top"));
    const nestedStyle = getComputedStyle(element("nested"));
    expect(nestedStyle.paddingTop).toBe(topStyle.paddingTop);
    expect(nestedStyle.borderTopLeftRadius).toBe(topStyle.borderTopLeftRadius);
  });

  it("renders a summary as a row the same height as a link", async () => {
    render(html`
      <nav class="sidebar">
        <a href="#" id="link">Dashboard</a>
        <details>
          <summary id="summary">Projects</summary>
        </details>
      </nav>
    `);

    expect(element("summary").getBoundingClientRect().height).toBe(
      element("link").getBoundingClientRect().height,
    );
    expect(getComputedStyle(element("summary")).paddingLeft).toBe(
      getComputedStyle(element("link")).paddingLeft,
    );
  });

  it("lines nested text up under the summary's text at every depth", async () => {
    render(html`
      <nav class="sidebar" style="inline-size: 16rem">
        <details open>
          <summary id="outer">Projects</summary>
          <a href="#" id="first-level">Website</a>
          <details open>
            <summary id="inner">Archived</summary>
            <a href="#" id="second-level">Launch</a>
          </details>
        </details>
        <details open>
          <summary id="with-icon">${icon} Settings</summary>
          <a href="#" id="under-icon">Profile</a>
        </details>
      </nav>
    `);

    expect(textStart("first-level")).toBeCloseTo(textStart("outer"), 0);
    expect(textStart("inner")).toBeCloseTo(textStart("outer") + 24, 0);
    expect(textStart("second-level")).toBeCloseTo(textStart("inner"), 0);
    expect(textStart("under-icon")).toBeCloseTo(textStart("with-icon"), 0);
  });

  it("strips list styling and keeps the same alignment when rows are in lists", async () => {
    render(html`
      <nav class="sidebar" style="inline-size: 16rem">
        <ul id="list">
          <li>
            <details open>
              <summary id="outer">Projects</summary>
              <ul>
                <li><a href="#" id="first-level">Website</a></li>
                <li>
                  <details open>
                    <summary id="inner">Archived</summary>
                    <ul>
                      <li><a href="#" id="second-level">Launch</a></li>
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    `);

    const listStyle = getComputedStyle(element("list"));
    expect(listStyle.listStyleType).toBe("none");
    expect(listStyle.paddingLeft).toBe("0px");
    expect(listStyle.marginTop).toBe("0px");
    expect(textStart("first-level")).toBeCloseTo(textStart("outer"), 0);
    expect(textStart("inner")).toBeCloseTo(textStart("outer") + 24, 0);
    expect(textStart("second-level")).toBeCloseTo(textStart("inner"), 0);
  });

  it("draws a single square guide line down a group rather than on each row", async () => {
    render(html`
      <nav class="sidebar">
        <details open id="group">
          <summary id="summary">Projects</summary>
          <a href="#" id="nested">Website</a>
        </details>
      </nav>
    `);

    const contentStyle = getComputedStyle(element("group"), "::details-content");
    expect(contentStyle.borderLeftWidth).toBe("1px");
    expect(contentStyle.borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(element("nested")).borderLeftWidth).toBe("0px");
    expect(getComputedStyle(element("summary")).borderLeftWidth).toBe("0px");
  });

  it("swaps a summary's icon for the caret on hover", async () => {
    render(html`
      <nav class="sidebar">
        <details>
          <summary id="summary">${icon} Projects</summary>
        </details>
      </nav>
    `);

    const summary = element("summary");
    const summaryIcon = summary.querySelector("svg")!;
    expect(getComputedStyle(summary, "::before").display).toBe("none");
    expect(getComputedStyle(summaryIcon).display).not.toBe("none");

    await userEvent.hover(summary);

    expect(getComputedStyle(summary, "::before").display).not.toBe("none");
    expect(getComputedStyle(summaryIcon).display).toBe("none");
  });

  it("always shows the caret on a summary without an icon", async () => {
    render(html`
      <nav class="sidebar">
        <details>
          <summary id="summary">Projects</summary>
        </details>
      </nav>
    `);

    expect(getComputedStyle(element("summary"), "::before").display).not.toBe("none");
  });

  it("shows a closed caret for a closed group nested in an open one", async () => {
    render(html`
      <nav class="sidebar">
        <details open>
          <summary id="open">Projects</summary>
          <details>
            <summary id="closed">Archived</summary>
          </details>
        </details>
        <details>
          <summary id="reference">Settings</summary>
        </details>
      </nav>
    `);

    const closedMask = getComputedStyle(element("closed"), "::before").maskImage;
    expect(closedMask).toBe(getComputedStyle(element("reference"), "::before").maskImage);
    expect(closedMask).not.toBe(getComputedStyle(element("open"), "::before").maskImage);
  });

  it("highlights the current page and the summary of every group containing it", async () => {
    render(html`
      <nav class="sidebar">
        <a href="#" id="other">Dashboard</a>
        <details open>
          <summary id="outer">Projects</summary>
          <details open>
            <summary id="inner">Archived</summary>
            <a href="#" id="current" aria-current="page">Launch</a>
          </details>
        </details>
        <details>
          <summary id="unrelated">Settings</summary>
        </details>
      </nav>
    `);

    const currentStyle = getComputedStyle(element("current"));
    expect(currentStyle.backgroundColor).not.toBe(
      getComputedStyle(element("other")).backgroundColor,
    );
    expect(currentStyle.color).not.toBe(getComputedStyle(element("other")).color);
    expect(getComputedStyle(element("outer")).color).toBe(currentStyle.color);
    expect(getComputedStyle(element("inner")).color).toBe(currentStyle.color);
    expect(getComputedStyle(element("unrelated")).color).not.toBe(currentStyle.color);
  });

  it("renders direct-child headings as group labels, leaving headings inside rows alone", async () => {
    render(html`
      <nav class="sidebar">
        <h2 id="label">Workspace</h2>
        <a href="#"><h4 id="inside-row">Dashboard</h4></a>
      </nav>
    `);

    const labelStyle = getComputedStyle(element("label"));
    expect(labelStyle.fontSize).toBe("12px");
    expect(labelStyle.marginTop).toBe("0px");
    expect(getComputedStyle(element("inside-row")).fontSize).not.toBe("12px");
  });
});

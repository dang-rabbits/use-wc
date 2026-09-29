import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function item(id: string) {
  return document.getElementById(id)!;
}

describe("breadcrumb", () => {
  it("lays the trail out in a single row", async () => {
    render(html`
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol id="trail">
          <li id="first"><a href="#">Home</a></li>
          <li id="second"><a href="#">Projects</a></li>
        </ol>
      </nav>
    `);

    expect(getComputedStyle(item("trail")).listStyleType).toBe("none");
    expect(item("first").getBoundingClientRect().top).toBe(
      item("second").getBoundingClientRect().top,
    );
  });

  it("separates every item after the first with the separator token", async () => {
    render(html`
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li id="first"><a href="#">Home</a></li>
          <li id="second"><a href="#">Projects</a></li>
        </ol>
      </nav>
    `);

    expect(getComputedStyle(item("first"), "::before").content).toBe("none");
    expect(getComputedStyle(item("second"), "::before").content).toBe('"/" / ""');
  });

  it("reads the separator from a themed token", async () => {
    render(html`
      <nav
        class="breadcrumb"
        aria-label="Breadcrumb"
        style='--usewc-effect-breadcrumb-separator: "›"'
      >
        <ol>
          <li><a href="#">Home</a></li>
          <li id="second"><a href="#">Projects</a></li>
        </ol>
      </nav>
    `);

    expect(getComputedStyle(item("second"), "::before").content).toBe('"›" / ""');
  });

  it("renders the current page in document text rather than link color", async () => {
    render(html`
      <p id="document-text">Text</p>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="#" id="link">Home</a></li>
          <li><a href="#" id="current" aria-current="page">Projects</a></li>
        </ol>
      </nav>
    `);

    const currentStyle = getComputedStyle(item("current"));
    expect(currentStyle.color).toBe(getComputedStyle(item("document-text")).color);
    expect(currentStyle.color).not.toBe(getComputedStyle(item("link")).color);
    expect(currentStyle.cursor).toBe("default");
  });
});

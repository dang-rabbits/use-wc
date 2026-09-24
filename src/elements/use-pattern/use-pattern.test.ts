import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-pattern";
import { UsePattern } from "./use-pattern";
import "../../styles/tokens.css";
import "../../styles/theme.css";

describe("use-pattern", () => {
  it("carries no shadow DOM and leaves its light-DOM children untouched", async () => {
    render(html`
      <use-pattern class="card">
        <header id="header">Title</header>
        <main id="main">Body</main>
      </use-pattern>
    `);
    const pattern = document.querySelector("use-pattern") as UsePattern;
    await pattern.updateComplete;

    expect(pattern.shadowRoot).toBeNull();
    expect(document.getElementById("header")?.parentElement).toBe(pattern);
    expect(document.getElementById("main")?.parentElement).toBe(pattern);
  });
});

import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

const avatarSource =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3C/svg%3E";

describe("surface header / footer", () => {
  it("aligns a header to the inline-start edge and a footer to the inline-end edge", async () => {
    render(html`
      <use-card>
        <header id="header">
          <hgroup><h4>Title</h4></hgroup>
        </header>
        <footer id="footer"><button type="button">Save</button></footer>
      </use-card>
    `);

    expect(styleOf(document.getElementById("header")!, "justify-content")).toBe("flex-start");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
  });

  it("keeps the default alignment with a single section", async () => {
    render(html`
      <use-card>
        <footer id="footer">
          <section><button type="button">Save</button></section>
        </footer>
      </use-card>
    `);

    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
  });

  it("switches to space-between with two or more sections", async () => {
    render(html`
      <use-card>
        <header id="header">
          <section><h4>Title</h4></section>
          <section><button type="button">Action</button></section>
        </header>
        <footer id="footer">
          <section><button type="button">Delete</button></section>
          <section><button type="button">Send</button></section>
        </footer>
      </use-card>
    `);

    expect(styleOf(document.getElementById("header")!, "justify-content")).toBe("space-between");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("space-between");
  });

  it("lays a section out as a flex row with the surface gap", async () => {
    render(html`
      <use-card>
        <footer>
          <section id="section">
            <button type="button">A</button>
            <button type="button">B</button>
          </section>
        </footer>
      </use-card>
    `);
    const section = document.getElementById("section")!;

    expect(styleOf(section, "display")).toBe("flex");
    expect(styleOf(section, "column-gap")).toBe("12px");
  });

  it("still sizes an img.avatar in the header", async () => {
    render(html`
      <use-card>
        <header>
          <img id="avatar" class="avatar" alt="" src=${avatarSource} />
          <hgroup><h4>Title</h4></hgroup>
        </header>
      </use-card>
    `);

    expect(styleOf(document.getElementById("avatar")!, "width")).toBe("32px");
  });

  it("reverts inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <use-card>
          <footer id="footer"><button type="button">Save</button></footer>
        </use-card>
      </use-theme-escape>
    `);

    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("normal");
  });
});

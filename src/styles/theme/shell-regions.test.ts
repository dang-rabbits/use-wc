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

describe("shell region treatment", () => {
  it("pads and rules the header / [fill] / footer of a bare .shell", async () => {
    render(html`
      <use-layout class="shell">
        <header id="header">
          <hgroup><h4>Title</h4></hgroup>
        </header>
        <div fill id="body">body</div>
        <footer id="footer"><button type="button">Save</button></footer>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("header")!, "padding")).toBe("16px");
    expect(styleOf(document.getElementById("footer")!, "padding")).toBe("16px");
    expect(styleOf(document.getElementById("footer")!, "border-top-style")).toBe("solid");
    expect(styleOf(document.getElementById("body")!, "padding-left")).toBe("16px");
    expect(styleOf(document.getElementById("body")!, "padding-top")).toBe("0px");
  });

  it("aligns a .shell header to the inline-start edge and its footer to the inline-end edge", async () => {
    render(html`
      <use-layout class="shell">
        <header id="header">
          <hgroup><h4>Title</h4></hgroup>
        </header>
        <footer id="footer"><button type="button">Save</button></footer>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("header")!, "justify-content")).toBe("flex-start");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
  });

  it("keeps the default alignment with a single section", async () => {
    render(html`
      <use-layout class="shell">
        <footer id="footer">
          <section><button type="button">Save</button></section>
        </footer>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
  });

  it("switches to space-between with two or more sections", async () => {
    render(html`
      <use-layout class="shell">
        <footer id="footer">
          <section id="section"><button type="button">Delete</button></section>
          <section><button type="button">Send</button></section>
        </footer>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("space-between");
    expect(styleOf(document.getElementById("section")!, "display")).toBe("flex");
    expect(styleOf(document.getElementById("section")!, "column-gap")).toBe("12px");
  });

  it("sizes an img.avatar in a .shell header", async () => {
    render(html`
      <use-layout class="shell">
        <header>
          <img id="avatar" class="avatar" alt="" src=${avatarSource} />
          <hgroup><h4>Title</h4></hgroup>
        </header>
      </use-layout>
    `);

    expect(styleOf(document.getElementById("avatar")!, "width")).toBe("32px");
  });

  it("applies the same treatment to a use-card surface", async () => {
    render(html`
      <use-card>
        <header id="header">
          <hgroup><h4>Title</h4></hgroup>
        </header>
        <footer id="footer"><button type="button">Save</button></footer>
      </use-card>
    `);

    expect(styleOf(document.getElementById("header")!, "padding")).toBe("16px");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
  });

  it("reverts inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <use-layout class="shell">
          <footer id="footer"><button type="button">Save</button></footer>
        </use-layout>
      </use-theme-escape>
    `);

    expect(styleOf(document.getElementById("footer")!, "padding")).toBe("0px");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("normal");
  });
});

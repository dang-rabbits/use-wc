import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

function box(id: string) {
  return document.getElementById(id)!.getBoundingClientRect();
}

describe("use-prose", () => {
  it("caps its measure and sets a reading line height", async () => {
    render(html`<use-prose id="prose"><p>Body</p></use-prose>`);
    const prose = document.getElementById("prose")!;

    expect(styleOf(prose, "display")).toBe("block");
    expect(styleOf(prose, "max-inline-size")).not.toBe("none");
    expect(styleOf(prose, "line-height")).toBe("24px");
  });

  it("gives every flow block the same body line box", async () => {
    render(html`
      <use-prose>
        <p id="p">Paragraph</p>
        <ul>
          <li id="item">Item</li>
        </ul>
        <blockquote id="quote"><p>Quote</p></blockquote>
        <table>
          <tbody>
            <tr>
              <td id="cell">Cell</td>
            </tr>
          </tbody>
        </table>
      </use-prose>
    `);

    for (const id of ["p", "item", "quote", "cell"]) {
      expect(styleOf(document.getElementById(id)!, "line-height"), id).toBe("24px");
    }
  });

  it("scales the heading ramp downwards", async () => {
    render(html`
      <use-prose>
        <h1 id="h1">One</h1>
        <h2 id="h2">Two</h2>
        <h3 id="h3">Three</h3>
        <p id="p">Body</p>
      </use-prose>
    `);
    const size = (id: string) => parseFloat(styleOf(document.getElementById(id)!, "font-size"));

    expect(size("h1")).toBeGreaterThan(size("h2"));
    expect(size("h2")).toBeGreaterThan(size("h3"));
    expect(size("h3")).toBeGreaterThan(size("p"));
  });

  it("spaces blocks apart without a leading margin on the first", async () => {
    render(html`
      <use-prose id="prose">
        <p id="first">First</p>
        <p id="second">Second</p>
      </use-prose>
    `);

    expect(styleOf(document.getElementById("first")!, "margin-top")).toBe("0px");
    expect(box("second").top - box("first").bottom).toBe(16);
  });

  it("gives a heading more room above it than a paragraph gets", async () => {
    render(html`
      <use-prose>
        <p id="para">Body</p>
        <h2 id="heading">Heading</h2>
        <p id="after">More</p>
      </use-prose>
    `);

    expect(box("heading").top - box("para").bottom).toBeGreaterThan(
      box("after").top - box("heading").bottom,
    );
  });

  it("reads through article, section and div wrappers at any depth", async () => {
    render(html`
      <use-prose>
        <article>
          <section>
            <div>
              <h2 id="nested">Buried heading</h2>
              <p id="nestedBody">Buried body</p>
            </div>
          </section>
        </article>
      </use-prose>
    `);

    expect(parseFloat(styleOf(document.getElementById("nested")!, "font-size"))).toBeGreaterThan(
      parseFloat(styleOf(document.getElementById("nestedBody")!, "font-size")),
    );
    expect(box("nestedBody").top - box("nested").bottom).toBe(16);
  });

  it("indents a list without inventing space between its items", async () => {
    render(html`
      <use-prose>
        <ul id="list">
          <li id="one">One</li>
          <li id="two">Two</li>
        </ul>
      </use-prose>
    `);

    expect(styleOf(document.getElementById("list")!, "padding-left")).toBe("24px");
    expect(box("two").top - box("one").bottom).toBe(0);
  });

  it("makes a code block a full-width slab and drops the inline pill inside it", async () => {
    render(html`
      <use-prose style="inline-size: 400px">
        <pre id="pre"><code id="blockCode">vp test</code></pre>
        <p>Inline <code id="inlineCode">code</code> here.</p>
      </use-prose>
    `);
    const pre = document.getElementById("pre")!;
    const blockCode = document.getElementById("blockCode")!;
    const inlineCode = document.getElementById("inlineCode")!;

    expect(styleOf(pre, "border-top-width")).toBe("1px");
    expect(styleOf(pre, "background-color")).not.toBe("rgba(0, 0, 0, 0)");

    // The block fills its slab, with none of the inline pill's chrome.
    expect(styleOf(blockCode, "display")).toBe("block");
    expect(styleOf(blockCode, "background-color")).toBe("rgba(0, 0, 0, 0)");
    expect(styleOf(blockCode, "padding-left")).toBe("0px");
    expect(blockCode.getBoundingClientRect().width).toBe(
      pre.getBoundingClientRect().width - 2 * parseFloat(styleOf(pre, "padding-left")) - 2,
    );

    // Inline code elsewhere keeps it.
    expect(styleOf(inlineCode, "display")).toBe("inline-block");
    expect(styleOf(inlineCode, "background-color")).not.toBe(
      styleOf(blockCode, "background-color"),
    );
  });

  it("rules a blockquote and mutes it", async () => {
    render(html`
      <use-prose>
        <p id="para">Body</p>
        <blockquote id="quote"><p>Quoted</p></blockquote>
      </use-prose>
    `);
    const quote = document.getElementById("quote")!;

    expect(styleOf(quote, "border-left-style")).toBe("solid");
    expect(styleOf(quote, "color")).not.toBe(styleOf(document.getElementById("para")!, "color"));
  });

  // Prose deliberately has no component boundary for now — flow content inside a nested
  // component does pick up prose's rhythm. See the note at the top of `prose.css`.
  it("reaches flow content inside a nested component, for now", async () => {
    render(html`
      <use-prose>
        <h2 id="proseHeading">Prose heading</h2>
        <use-layout class="card">
          <main><h2 id="nestedHeading">Nested heading</h2></main>
        </use-layout>
      </use-prose>
    `);

    expect(styleOf(document.getElementById("nestedHeading")!, "font-size")).toBe(
      styleOf(document.getElementById("proseHeading")!, "font-size"),
    );
  });

  it("reverts to unstyled markup inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <use-prose id="prose">
          <h1 id="heading">Heading</h1>
          <p id="para">Body</p>
        </use-prose>
      </use-theme-escape>
    `);

    expect(styleOf(document.getElementById("prose")!, "max-inline-size")).toBe("none");
    expect(styleOf(document.getElementById("para")!, "margin-top")).not.toBe("0px");
  });
});

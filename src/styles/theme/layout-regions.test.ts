import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";
import "../../elements/use-avatar/use-avatar";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

const imageSource =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3C/svg%3E";

const variants = ["page", "prose", "message", "card"];

describe("layout region treatment", () => {
  describe("shared across variants", () => {
    for (const variant of variants) {
      it(`${variant} clusters sections and splits a region holding two of them`, async () => {
        render(html`
          <use-layout class=${variant}>
            <footer id="footer">
              <section id="section"><button type="button">Delete</button></section>
              <section><button type="button">Send</button></section>
            </footer>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe(
          "space-between",
        );
        expect(styleOf(document.getElementById("section")!, "display")).toBe("flex");
      });

      it(`${variant} resets a figure and fits its image`, async () => {
        render(html`
          <use-layout class=${variant}>
            <figure id="figure"><img id="poster" alt="" src=${imageSource} /></figure>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("figure")!, "margin")).toBe("0px");
        expect(styleOf(document.getElementById("poster")!, "object-fit")).toBe("cover");
      });

      it(`${variant} sheds the outer block margins of its body content`, async () => {
        render(html`
          <use-layout class=${variant}>
            <main>
              <p id="first">first</p>
              <ul>
                <li>middle</li>
              </ul>
              <ol id="last">
                <li>last</li>
              </ol>
            </main>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("first")!, "margin-top")).toBe("0px");
        expect(styleOf(document.getElementById("first")!, "margin-bottom")).not.toBe("0px");
        expect(styleOf(document.getElementById("last")!, "margin-bottom")).toBe("0px");
        expect(styleOf(document.getElementById("last")!, "margin-top")).not.toBe("0px");
      });

      it(`${variant} lets the gap own the spacing in a header, margins and all`, async () => {
        render(html`
          <use-layout class=${variant}>
            <header>
              <hgroup id="hgroup">
                <h4 id="title">Title</h4>
                <p id="meta">Meta</p>
              </hgroup>
              <p id="loose">Loose</p>
            </header>
          </use-layout>
        `);

        for (const id of ["title", "meta", "loose"]) {
          expect(styleOf(document.getElementById(id)!, "margin-top")).toBe("0px");
          expect(styleOf(document.getElementById(id)!, "margin-bottom")).toBe("0px");
        }
        expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      });

      it(`${variant} lays out with only a header and a footer`, async () => {
        render(html`
          <use-layout class=${variant}>
            <header id="header">Title</header>
            <footer id="footer"><button type="button">OK</button></footer>
          </use-layout>
        `);

        expect(styleOf(document.getElementById("header")!, "display")).toBe("flex");
        expect(styleOf(document.getElementById("footer")!, "display")).toBe("flex");
      });
    }

    it("gives each variant its own density rather than one shared padding", async () => {
      render(html`
        <div>
          ${variants.map(
            (variant) => html`
              <use-layout class=${variant}>
                <header id="header-${variant}">Title</header>
              </use-layout>
            `,
          )}
        </div>
      `);

      const padding = Object.fromEntries(
        variants.map((variant) => [
          variant,
          styleOf(document.getElementById(`header-${variant}`)!, "padding-left"),
        ]),
      );

      expect(padding.prose).toBe("32px");
      expect(padding.page).toBe("20px");
      expect(padding.card).toBe("12px");
      expect(padding.message).toBe("0px");
    });

    it("keeps region rules overridable by a plain class, since the container adds no specificity", async () => {
      render(html`
        <div>
          <style>
            header.tabbed {
              padding: 3px;
            }
          </style>
          <use-layout class="card">
            <header id="header" class="tabbed">Title</header>
          </use-layout>
        </div>
      `);

      expect(styleOf(document.getElementById("header")!, "padding")).toBe("3px");
    });
  });

  describe("page", () => {
    it("rules the topbar and footer off from the body", async () => {
      render(html`
        <use-layout class="page">
          <header id="header">
            <hgroup><h4>Brand</h4></hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer">status</footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("header")!, "border-bottom-style")).toBe("solid");
      expect(styleOf(document.getElementById("footer")!, "border-top-style")).toBe("solid");
      expect(styleOf(document.getElementById("body")!, "padding-left")).toBe("20px");
      expect(styleOf(document.getElementById("body")!, "padding-top")).toBe("0px");
    });

    it("keeps the topbar shallower than it is wide", async () => {
      render(html`
        <use-layout class="page">
          <header id="header">
            <section>
              <hgroup id="hgroup"><h4 id="title">Brand</h4></hgroup>
            </section>
          </header>
          <footer id="footer">status</footer>
        </use-layout>
      `);

      for (const id of ["header", "footer"]) {
        expect(styleOf(document.getElementById(id)!, "padding-top")).toBe("12px");
        expect(styleOf(document.getElementById(id)!, "padding-left")).toBe("20px");
      }
      expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      expect(styleOf(document.getElementById("title")!, "margin-top")).toBe("0px");
      expect(styleOf(document.getElementById("title")!, "margin-bottom")).toBe("0px");
    });

    it("splits its footer so status sits opposite the actions", async () => {
      render(html`
        <use-layout class="page">
          <footer id="footer"><span>Saved</span></footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("space-between");
    });

    it("squares a figure avatar and grows the title group", async () => {
      render(html`
        <use-layout class="page">
          <header>
            <figure id="avatar"><img id="portrait" alt="" src=${imageSource} /></figure>
            <hgroup id="hgroup"><h4>Title</h4></hgroup>
          </header>
        </use-layout>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("32px");
      expect(styleOf(avatar, "height")).toBe("32px");
      expect(styleOf(avatar, "margin-left")).toBe("0px");
      expect(styleOf(document.getElementById("portrait")!, "object-fit")).toBe("cover");
      expect(styleOf(document.getElementById("hgroup")!, "flex-grow")).toBe("1");
    });

    it("sizes a use-avatar in a header to the variant's avatar size", async () => {
      render(html`
        <use-layout class="page">
          <header><use-avatar id="avatar" name="Riley Quinn"></use-avatar></header>
        </use-layout>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("32px");
      expect(styleOf(avatar, "height")).toBe("32px");
    });

    it("leaves a bare img in a header alone, with no avatar class convention", async () => {
      render(html`
        <use-layout class="page">
          <header>
            <img id="logo" alt="" src=${imageSource} />
          </header>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("logo")!, "border-radius")).toBe("0px");
    });
  });

  describe("prose", () => {
    it("stacks the header and shares the body's measure", async () => {
      render(html`
        <use-layout class="prose" style="inline-size: 2000px">
          <header id="header">
            <h1>Title</h1>
            <p>A byline</p>
          </header>
          <main id="body">body</main>
        </use-layout>
      `);
      const header = document.getElementById("header")!;
      const body = document.getElementById("body")!;

      expect(styleOf(header, "flex-direction")).toBe("column");
      expect(styleOf(header, "align-items")).toBe("start");
      expect(styleOf(header, "max-inline-size")).toBe(styleOf(body, "max-inline-size"));
      expect(styleOf(body, "max-inline-size")).not.toBe("none");
    });

    it("keeps a figure full-bleed while the header stays inside the measure", async () => {
      render(html`
        <use-layout class="prose" style="inline-size: 2000px">
          <figure id="figure"><img alt="" src=${imageSource} /></figure>
          <header id="header"><h1>Title</h1></header>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("figure")!, "max-inline-size")).toBe("none");
      expect(styleOf(document.getElementById("header")!, "max-inline-size")).not.toBe("none");
    });

    it("leaves an hgroup alone, since the header is a column", async () => {
      render(html`
        <use-layout class="prose">
          <header>
            <hgroup id="hgroup"><h1>Title</h1></hgroup>
          </header>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("hgroup")!, "flex-grow")).toBe("0");
    });
  });

  describe("message", () => {
    it("puts the figure in a rail with the regions stacked beside it", async () => {
      render(html`
        <use-layout class="message" id="message">
          <figure id="rail"><img alt="" src=${imageSource} /></figure>
          <header id="header">
            <hgroup>
              <h4>Name</h4>
              <p>10:24</p>
            </hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer"><button type="button">Reply</button></footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("message")!, "display")).toBe("grid");
      expect(styleOf(document.getElementById("rail")!, "width")).toBe("32px");

      const railRight = document.getElementById("rail")!.getBoundingClientRect().right;
      for (const id of ["header", "body", "footer"]) {
        expect(document.getElementById(id)!.getBoundingClientRect().left).toBeGreaterThanOrEqual(
          railRight,
        );
      }
    });

    it("puts a use-avatar in the rail, sized to it", async () => {
      render(html`
        <use-layout class="message">
          <use-avatar id="avatar" name="Riley Quinn"></use-avatar>
          <main id="body">body</main>
        </use-layout>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("32px");
      expect(styleOf(avatar, "height")).toBe("32px");
      expect(document.getElementById("body")!.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        avatar.getBoundingClientRect().right,
      );
    });

    it("centres a rail figure that isn't a photo", async () => {
      render(html`
        <use-layout class="message">
          <figure id="initials">TM</figure>
          <main>body</main>
        </use-layout>
      `);
      const rail = document.getElementById("initials")!;

      expect(styleOf(rail, "display")).toBe("flex");
      expect(styleOf(rail, "align-items")).toBe("center");
      expect(styleOf(rail, "justify-content")).toBe("center");
      expect(styleOf(rail, "width")).toBe("32px");
      expect(styleOf(rail, "height")).toBe("32px");
    });

    it("treats a figure in the body as an attachment, not the rail", async () => {
      render(html`
        <use-layout class="message" style="inline-size: 400px">
          <figure id="rail"><img alt="" src=${imageSource} /></figure>
          <main>
            <figure id="attachment"><img id="media" alt="" src=${imageSource} /></figure>
          </main>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("attachment")!, "margin-left")).toBe("0px");
      expect(document.getElementById("attachment")!.getBoundingClientRect().width).toBeGreaterThan(
        document.getElementById("rail")!.getBoundingClientRect().width,
      );
      expect(styleOf(document.getElementById("media")!, "display")).toBe("block");
    });

    it("holds the rail width when a grouped message omits its header", async () => {
      render(html`
        <div style="inline-size: 400px">
          <use-layout class="message">
            <figure><img alt="" src=${imageSource} /></figure>
            <header>Name</header>
            <main id="first">first</main>
          </use-layout>
          <use-layout class="message">
            <main id="grouped">grouped</main>
          </use-layout>
        </div>
      `);

      expect(document.getElementById("grouped")!.getBoundingClientRect().left).toBe(
        document.getElementById("first")!.getBoundingClientRect().left,
      );
    });

    it("keeps the name and timestamp on one line", async () => {
      render(html`
        <use-layout class="message">
          <header>
            <hgroup id="hgroup">
              <h4>Name</h4>
              <p>10:24</p>
            </hgroup>
          </header>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      expect(styleOf(document.getElementById("hgroup")!, "white-space")).toBe("nowrap");
    });

    it("draws no rules between its regions", async () => {
      render(html`
        <use-layout class="message">
          <header id="header">Name</header>
          <footer id="footer"><button type="button">Reply</button></footer>
        </use-layout>
      `);

      expect(styleOf(document.getElementById("header")!, "border-bottom-color")).toBe(
        "rgba(0, 0, 0, 0)",
      );
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-start");
    });
  });

  describe("card", () => {
    it("carries the panel regions plus its floating chrome", async () => {
      render(html`
        <use-layout class="card" id="card">
          <header id="header">
            <hgroup><h4>Title</h4></hgroup>
          </header>
          <use-layout fill id="body">body</use-layout>
          <footer id="footer"><button type="button">Save</button></footer>
        </use-layout>
      `);
      const card = document.getElementById("card")!;

      expect(styleOf(card, "display")).toBe("flex");
      expect(styleOf(card, "flex-direction")).toBe("column");
      expect(styleOf(card, "overflow")).toBe("hidden");
      expect(styleOf(document.getElementById("header")!, "justify-content")).toBe("flex-start");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
      expect(styleOf(document.getElementById("footer")!, "border-top-style")).toBe("solid");
      expect(styleOf(document.getElementById("body")!, "flex-grow")).toBe("1");
    });

    it("drops its own chrome inside an overlay that already paints one", async () => {
      render(html`
        <dialog open>
          <use-layout class="card" id="nested">
            <footer id="footer"><button type="button">Save</button></footer>
          </use-layout>
        </dialog>
      `);
      const nested = document.getElementById("nested")!;

      expect(styleOf(nested, "box-shadow")).toBe("none");
      expect(styleOf(nested, "border-top-style")).toBe("none");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
    });

    it("drops the shadow when outlined", async () => {
      render(html`<use-layout class="card outlined" id="card">body</use-layout>`);

      expect(styleOf(document.getElementById("card")!, "box-shadow")).toBe("none");
    });
  });

  it("gives a dialog no layout of its own", async () => {
    render(html`
      <dialog id="dialog" open>
        <header id="header">Title</header>
      </dialog>
    `);

    expect(styleOf(document.getElementById("dialog")!, "display")).toBe("block");
    expect(styleOf(document.getElementById("header")!, "display")).toBe("block");
  });

  it("reverts inside use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <use-layout class="card">
          <footer id="footer"><button type="button">Save</button></footer>
        </use-layout>
      </use-theme-escape>
    `);

    expect(styleOf(document.getElementById("footer")!, "padding")).toBe("0px");
    expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("normal");
  });
});

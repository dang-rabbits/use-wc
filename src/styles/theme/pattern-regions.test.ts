import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "../tokens.css";
import "../theme.css";
import "../../elements/use-avatar/use-avatar";

function styleOf(element: Element, property: string, pseudo?: string) {
  return getComputedStyle(element, pseudo).getPropertyValue(property);
}

const supportsRowRule = CSS.supports("row-rule-style", "solid");

const imageSource =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3C/svg%3E";

const variants = ["entry", "message", "card", "media"];

describe("pattern region treatment", () => {
  describe("shared across variants", () => {
    // `.media` always needs a rail as its first child — with no tag-based guard, whatever lands
    // there is treated as the rail, so a bare header/main/footer first is an unsupported shape
    // for it. These shared tests otherwise share one markup shape across every variant, so they
    // give `.media` a plain rail to stay a valid configuration.
    const rail = (variant: string) => (variant === "media" ? html`<figure></figure>` : "");

    for (const variant of variants) {
      it(`${variant} clusters sections and splits a region holding two of them`, async () => {
        render(html`
          <use-pattern class=${variant}>
            ${rail(variant)}
            <footer id="footer">
              <section id="section"><button type="button">Delete</button></section>
              <section><button type="button">Send</button></section>
            </footer>
          </use-pattern>
        `);

        expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe(
          "space-between",
        );
        expect(styleOf(document.getElementById("section")!, "display")).toBe("flex");
      });

      it(`${variant} resets a figure and fits its image`, async () => {
        render(html`
          <use-pattern class=${variant}>
            <figure id="figure"><img id="poster" alt="" src=${imageSource} /></figure>
          </use-pattern>
        `);

        // `.card` pads the host itself on every edge, so a figure sitting there pulls
        // itself back out with a negative margin on all four sides to keep bleeding edge to
        // edge — everywhere else a figure just gets a plain zero margin.
        const margin = styleOf(document.getElementById("figure")!, "margin");
        if (variant === "card") {
          expect(margin.split(" ").every((value) => value.startsWith("-"))).toBe(true);
        } else {
          expect(margin).toBe("0px");
        }
        expect(styleOf(document.getElementById("poster")!, "object-fit")).toBe("cover");
      });

      it(`${variant} sheds the outer block margins of its body content`, async () => {
        render(html`
          <use-pattern class=${variant}>
            ${rail(variant)}
            <main>
              <p id="first">first</p>
              <ul>
                <li>middle</li>
              </ul>
              <ol id="last">
                <li>last</li>
              </ol>
            </main>
          </use-pattern>
        `);

        // `.card` doesn't reset a plain child's own inner margins — only `.entry`/
        // `.message`/`.media` shed the block margin on `main`'s own first/last child.
        if (variant === "card") {
          expect(styleOf(document.getElementById("first")!, "margin-top")).not.toBe("0px");
          expect(styleOf(document.getElementById("last")!, "margin-bottom")).not.toBe("0px");
        } else {
          expect(styleOf(document.getElementById("first")!, "margin-top")).toBe("0px");
          expect(styleOf(document.getElementById("first")!, "margin-bottom")).not.toBe("0px");
          expect(styleOf(document.getElementById("last")!, "margin-bottom")).toBe("0px");
          expect(styleOf(document.getElementById("last")!, "margin-top")).not.toBe("0px");
        }
      });

      it(`${variant} lets the gap own the spacing in a header, margins and all`, async () => {
        render(html`
          <use-pattern class=${variant}>
            ${rail(variant)}
            <header>
              <hgroup id="hgroup">
                <h4 id="title">Title</h4>
                <p id="meta">Meta</p>
              </hgroup>
              <p id="loose">Loose</p>
            </header>
          </use-pattern>
        `);

        for (const id of ["title", "meta", "loose"]) {
          expect(styleOf(document.getElementById(id)!, "margin-top")).toBe("0px");
          expect(styleOf(document.getElementById(id)!, "margin-bottom")).toBe("0px");
        }
        expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      });

      it(`${variant} lays out with only a header and a footer`, async () => {
        render(html`
          <use-pattern class=${variant}>
            ${rail(variant)}
            <header id="header">Title</header>
            <footer id="footer"><button type="button">OK</button></footer>
          </use-pattern>
        `);

        expect(styleOf(document.getElementById("header")!, "display")).toBe("flex");
        expect(styleOf(document.getElementById("footer")!, "display")).toBe("flex");
      });
    }

    it("gives a title group explicit line boxes and steps the subtitle down", async () => {
      render(html`
        <use-pattern class="entry">
          <header>
            <hgroup>
              <h4 id="title">Riley Quinn</h4>
              <p id="subtitle">Opened 3 days ago</p>
            </hgroup>
          </header>
        </use-pattern>
      `);
      const title = document.getElementById("title")!;
      const subtitle = document.getElementById("subtitle")!;

      expect(styleOf(title, "line-height")).toBe("20px");
      expect(styleOf(subtitle, "line-height")).toBe("14px");
      expect(parseFloat(styleOf(subtitle, "font-size"))).toBeLessThan(
        parseFloat(styleOf(title, "font-size")),
      );
      expect(styleOf(subtitle, "color")).not.toBe(styleOf(title, "color"));
    });

    it("gives each variant its own density rather than one shared padding", async () => {
      render(html`
        <div>
          ${variants.map(
            (variant) => html`
              <use-pattern class=${variant} id=${`layout-${variant}`}>
                <header id=${`header-${variant}`}>Title</header>
              </use-pattern>
            `,
          )}
        </div>
      `);

      // Every variant pads the container itself — `.card` owns the inset on the host, and
      // `.entry`/`.message`/`.media` pad it the same way.
      const padding = Object.fromEntries(
        variants.map((variant) => [
          variant,
          styleOf(document.getElementById(`layout-${variant}`)!, "padding-left"),
        ]),
      );

      expect(padding.card).toBe("16px");
      expect(padding.entry).toBe("16px");
      expect(padding.message).toBe("12px");
      expect(padding.media).toBe("12px");
    });

    it("steps padding, gap, and avatar size down when an entry is compact", async () => {
      render(html`
        <div>
          <use-pattern class="entry" id="entry">
            <figure></figure>
            <header id="header">Title</header>
          </use-pattern>
          <use-pattern class="entry compact" id="compact">
            <figure id="avatar"></figure>
            <header id="compact-header">Title</header>
          </use-pattern>
        </div>
      `);

      expect(styleOf(document.getElementById("entry")!, "padding-left")).toBe("16px");
      expect(styleOf(document.getElementById("compact")!, "padding-left")).toBe("8px");
      expect(styleOf(document.getElementById("header")!, "gap")).toBe("12px");
      expect(styleOf(document.getElementById("compact-header")!, "gap")).toBe("8px");
      expect(styleOf(document.getElementById("avatar")!, "width")).toBe("24px");
    });

    it("resolves every density token each variant declares", async () => {
      render(html`
        <div>
          ${variants.map(
            (variant) => html`
              <use-pattern class=${variant} id=${`v-${variant}`}>
                <header>Title</header>
              </use-pattern>
            `,
          )}
        </div>
      `);

      for (const variant of variants) {
        const element = document.getElementById(`v-${variant}`)!;
        for (const property of [
          "--usewc-layout-region-padding",
          "--usewc-layout-region-gap",
          "--usewc-layout-region-avatar-size",
        ]) {
          expect(styleOf(element, property).trim(), `${variant} ${property}`).not.toBe("");
        }
      }
    });

    it("keeps region rules overridable by a plain class, since the container adds no specificity", async () => {
      render(html`
        <div>
          <style>
            header.tabbed {
              padding: 3px;
            }
          </style>
          <use-pattern class="card">
            <header id="header" class="tabbed">Title</header>
          </use-pattern>
        </div>
      `);

      expect(styleOf(document.getElementById("header")!, "padding")).toBe("3px");
    });
  });

  describe("message", () => {
    it("puts the figure in a rail with the regions stacked beside it", async () => {
      render(html`
        <use-pattern class="message" id="message">
          <figure id="rail"><img alt="" src=${imageSource} /></figure>
          <header id="header">
            <hgroup>
              <h4>Name</h4>
              <p>10:24</p>
            </hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer"><button type="button">Reply</button></footer>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("message")!, "display")).toBe("grid");
      expect(styleOf(document.getElementById("rail")!, "width")).toBe("36px");

      const railRight = document.getElementById("rail")!.getBoundingClientRect().right;
      for (const id of ["header", "body", "footer"]) {
        expect(document.getElementById(id)!.getBoundingClientRect().left).toBeGreaterThanOrEqual(
          railRight,
        );
      }
    });

    it("puts a use-avatar in the rail, sized to it", async () => {
      render(html`
        <use-pattern class="message">
          <use-avatar id="avatar" name="Riley Quinn"></use-avatar>
          <main id="body">body</main>
        </use-pattern>
      `);
      const avatar = document.getElementById("avatar")!;

      expect(styleOf(avatar, "width")).toBe("36px");
      expect(styleOf(avatar, "height")).toBe("36px");
      expect(document.getElementById("body")!.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        avatar.getBoundingClientRect().right,
      );
    });

    it("centres a rail figure that isn't a photo", async () => {
      render(html`
        <use-pattern class="message">
          <figure id="initials">TM</figure>
          <main>body</main>
        </use-pattern>
      `);
      const rail = document.getElementById("initials")!;

      expect(styleOf(rail, "display")).toBe("flex");
      expect(styleOf(rail, "align-items")).toBe("center");
      expect(styleOf(rail, "justify-content")).toBe("center");
      expect(styleOf(rail, "width")).toBe("36px");
      expect(styleOf(rail, "height")).toBe("36px");
    });

    it("treats a figure in the body as an attachment, not the rail", async () => {
      render(html`
        <use-pattern class="message" style="inline-size: 400px">
          <figure id="rail"><img alt="" src=${imageSource} /></figure>
          <main>
            <figure id="attachment"><img id="media" alt="" src=${imageSource} /></figure>
          </main>
        </use-pattern>
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
          <use-pattern class="message">
            <figure><img alt="" src=${imageSource} /></figure>
            <header>Name</header>
            <main id="first">first</main>
          </use-pattern>
          <use-pattern class="message">
            <main id="grouped">grouped</main>
          </use-pattern>
        </div>
      `);

      expect(document.getElementById("grouped")!.getBoundingClientRect().left).toBe(
        document.getElementById("first")!.getBoundingClientRect().left,
      );
    });

    it("keeps the name and timestamp on one line", async () => {
      render(html`
        <use-pattern class="message">
          <header>
            <hgroup id="hgroup">
              <h4>Name</h4>
              <p>10:24</p>
            </hgroup>
          </header>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("hgroup")!, "display")).toBe("flex");
      expect(styleOf(document.getElementById("hgroup")!, "white-space")).toBe("nowrap");
    });

    it("draws no rules between its regions", async () => {
      render(html`
        <use-pattern class="message">
          <header id="header">Name</header>
          <footer id="footer"><button type="button">Reply</button></footer>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("header")!, "border-bottom-width")).toBe("0px");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-start");
    });
  });

  describe("card", () => {
    it("carries the panel regions plus its floating chrome", async () => {
      render(html`
        <use-pattern class="card" id="card">
          <header id="header">
            <hgroup><h4>Title</h4></hgroup>
          </header>
          <use-layout fill id="body">body</use-layout>
          <footer id="footer"><button type="button">Save</button></footer>
        </use-pattern>
      `);
      const card = document.getElementById("card")!;

      expect(styleOf(card, "display")).toBe("flex");
      expect(styleOf(card, "flex-direction")).toBe("column");
      expect(styleOf(card, "overflow")).toBe("hidden");
      expect(styleOf(document.getElementById("header")!, "justify-content")).toBe("flex-start");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
      expect(styleOf(document.getElementById("footer")!, "border-top-width")).toBe("0px");
      expect(styleOf(document.getElementById("body")!, "flex-grow")).toBe("1");
    });

    it("rules the footer off from the body when divided, using row-rule or its border fallback", async () => {
      render(html`
        <use-pattern class="card divided" id="card">
          <main></main>
          <footer id="footer">Saved</footer>
        </use-pattern>
      `);

      if (supportsRowRule) {
        expect(styleOf(document.getElementById("card")!, "row-rule-style")).toBe("solid");
      } else {
        expect(styleOf(document.getElementById("footer")!, "border-top-style")).toBe("solid");
        expect(styleOf(document.getElementById("footer")!, "padding-top")).toBe("10px");
      }
    });

    it("drops its own chrome inside an overlay that already paints one", async () => {
      render(html`
        <dialog open>
          <use-pattern class="card" id="nested">
            <footer id="footer"><button type="button">Save</button></footer>
          </use-pattern>
        </dialog>
      `);
      const nested = document.getElementById("nested")!;

      expect(styleOf(nested, "box-shadow")).toBe("none");
      expect(styleOf(nested, "border-top-style")).toBe("none");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-end");
    });

    it("drops the shadow when outlined", async () => {
      render(html`<use-pattern class="card outlined" id="card">body</use-pattern>`);

      expect(styleOf(document.getElementById("card")!, "box-shadow")).toBe("none");
    });
  });

  describe("media", () => {
    it("sizes the rail to its content and puts the regions in one column beside it", async () => {
      render(html`
        <use-pattern class="media" id="media" style="inline-size: 400px">
          <figure id="rail"><img alt="" src=${imageSource} style="inline-size: 48px" /></figure>
          <header id="header">
            <hgroup><h4>Title</h4></hgroup>
          </header>
          <main id="body">body</main>
          <footer id="footer"><button type="button">Share</button></footer>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("media")!, "display")).toBe("table");
      expect(styleOf(document.getElementById("rail")!, "display")).toBe("table-cell");

      const media = document.getElementById("media")!.getBoundingClientRect();
      const rail = document.getElementById("rail")!.getBoundingClientRect();
      const header = document.getElementById("header")!.getBoundingClientRect();
      const body = document.getElementById("body")!.getBoundingClientRect();
      const footer = document.getElementById("footer")!.getBoundingClientRect();

      // rail cell = 48px content + the 12px inline-end gap
      expect(Math.round(rail.width)).toBe(60);
      for (const region of [header, body, footer]) {
        expect(Math.round(region.left)).toBe(Math.round(rail.right));
        expect(Math.round(region.left)).toBe(Math.round(header.left));
        expect(Math.round(region.right)).toBe(Math.round(media.right - 12));
      }
    });

    it("keeps the rail its content's own width rather than the avatar rail size", async () => {
      render(html`
        <use-pattern class="media">
          <figure id="rail">
            <img id="railImage" alt="" src=${imageSource} style="inline-size: 90px" />
          </figure>
          <main>body</main>
        </use-pattern>
      `);

      expect(Math.round(document.getElementById("railImage")!.getBoundingClientRect().width)).toBe(
        90,
      );
    });

    it("aligns the rail and the header to the top", async () => {
      render(html`
        <use-pattern class="media" id="media">
          <figure id="rail" style="block-size: 120px; inline-size: 48px"></figure>
          <header id="header">
            <hgroup><h4>Title</h4></hgroup>
          </header>
          <main>body</main>
        </use-pattern>
      `);
      const top = document.getElementById("media")!.getBoundingClientRect().top;

      expect(Math.round(document.getElementById("rail")!.getBoundingClientRect().top)).toBe(
        Math.round(top + 12),
      );
      expect(Math.round(document.getElementById("header")!.getBoundingClientRect().top)).toBe(
        Math.round(top + 12),
      );
    });

    it("keeps main directly under header regardless of the rail height", async () => {
      render(html`
        <use-pattern class="media" id="shortRail">
          <figure style="inline-size: 48px; block-size: 24px"></figure>
          <header id="shortHeader">Title</header>
          <main id="shortBody">body</main>
        </use-pattern>
        <use-pattern class="media" id="tallRail">
          <figure style="inline-size: 48px; block-size: 400px"></figure>
          <header id="tallHeader">Title</header>
          <main id="tallBody">body</main>
        </use-pattern>
      `);

      const gap = (headerId: string, bodyId: string) =>
        document.getElementById(bodyId)!.getBoundingClientRect().top -
        document.getElementById(headerId)!.getBoundingClientRect().bottom;

      expect(Math.round(gap("shortHeader", "shortBody"))).toBe(12);
      expect(Math.round(gap("tallHeader", "tallBody"))).toBe(12);

      // the body column is one box, so a short rail leaves the container the height of the body
      expect(document.getElementById("shortRail")!.getBoundingClientRect().height).toBeLessThan(
        120,
      );
    });

    it("works with a use-avatar rail, not just a figure", async () => {
      render(html`
        <use-pattern class="media">
          <use-avatar id="rail" name="Riley Quinn"></use-avatar>
          <header id="header">Title</header>
          <main id="body">body</main>
        </use-pattern>
      `);

      // the rail keeps its own layout untouched by the region reset...
      expect(styleOf(document.getElementById("rail")!, "display")).not.toBe("none");
      // ...and the header still gets its region padding zeroed
      expect(styleOf(document.getElementById("header")!, "padding")).toBe("0px");
      // ...without picking up a margin meant only for region-to-region gaps
      expect(styleOf(document.getElementById("header")!, "margin-top")).toBe("0px");
    });

    it("stacks the regions one region gap apart", async () => {
      render(html`
        <use-pattern class="media">
          <figure></figure>
          <header id="header">Title</header>
          <main id="body">body</main>
        </use-pattern>
      `);
      const gap =
        document.getElementById("body")!.getBoundingClientRect().top -
        document.getElementById("header")!.getBoundingClientRect().bottom;

      expect(Math.round(gap)).toBe(12);
    });

    it("draws no rules between its regions", async () => {
      render(html`
        <use-pattern class="media">
          <figure></figure>
          <header id="header">Title</header>
          <footer id="footer"><button type="button">Share</button></footer>
        </use-pattern>
      `);

      expect(styleOf(document.getElementById("header")!, "border-bottom-width")).toBe("0px");
      expect(styleOf(document.getElementById("footer")!, "justify-content")).toBe("flex-start");
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
});

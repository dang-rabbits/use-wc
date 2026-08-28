import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-badge";
import { UseBadge } from "./use-badge";
// Positioning and appearance ship built into use-badge's own styles, with sensible
// fallbacks, so these aren't required for the component to work — loaded here anyway to
// confirm the design system's tokens don't conflict with the component's own styles.
import "../../styles/tokens.css";
import "../../styles/theme.css";

function anchorNameOf(element: HTMLElement) {
  return element.style.getPropertyValue("anchor-name");
}

function positionAnchorOf(element: HTMLElement) {
  return element.style.getPropertyValue("position-anchor");
}

describe("use-badge", () => {
  describe("anchor wiring", () => {
    it("sets anchor-name on the target and position-anchor on itself", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorNameOf(anchorTarget)).not.toBe("");
      expect(positionAnchorOf(badge)).toBe(anchorNameOf(anchorTarget));
      expect(badge.anchorElement).toBe(anchorTarget);
    });

    it("appends to an existing anchor-name instead of replacing it", async () => {
      render(html`
        <button id="anchor-target" type="button" style="anchor-name: --existing">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorNameOf(anchorTarget)).toContain("--existing");
      expect(anchorNameOf(anchorTarget)).toContain(positionAnchorOf(badge));
    });

    it("removes only its own anchor-name on disconnect, preserving others", async () => {
      render(html`
        <button id="anchor-target" type="button" style="anchor-name: --existing">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.remove();

      expect(anchorNameOf(anchorTarget)).toBe("--existing");
    });

    it("re-points when the anchor attribute changes", async () => {
      render(html`
        <button id="first-target" type="button">First</button>
        <button id="second-target" type="button">Second</button>
        <use-badge anchortarget="first-target">3</use-badge>
      `);
      const firstTarget = document.getElementById("first-target") as HTMLButtonElement;
      const secondTarget = document.getElementById("second-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.anchortarget = "second-target";
      await badge.updateComplete;

      expect(anchorNameOf(firstTarget)).toBe("");
      expect(anchorNameOf(secondTarget)).not.toBe("");
      expect(badge.anchorElement).toBe(secondTarget);
    });

    it("supports setting anchorElement directly for targets without an id", async () => {
      render(html`
        <button type="button">Inbox</button>
        <use-badge>3</use-badge>
      `);
      const anchorTarget = document.querySelector("button") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.anchorElement = anchorTarget;

      expect(anchorNameOf(anchorTarget)).not.toBe("");
      expect(positionAnchorOf(badge)).toBe(anchorNameOf(anchorTarget));
    });
  });

  describe("published anchor name", () => {
    // Some components render their host as `display: contents`,
    // which anchor positioning can't reliably resolve against. Setting --usewc-anchor-name on
    // the anchor is the escape hatch: it lets a component point badges at a real, box-generating
    // part of itself instead, without the badge needing any component-specific knowledge.
    it("uses --usewc-anchor-name instead of generating its own when present", async () => {
      render(html`
        <button
          id="anchor-target"
          type="button"
          style="anchor-name: --published; --usewc-anchor-name: --published"
        >
          Inbox
        </button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(positionAnchorOf(badge)).toBe("--published");
      expect(anchorNameOf(anchorTarget)).toBe("--published");
    });

    it("does not write its own anchor-name onto a target with a published name", async () => {
      render(html`
        <button
          id="anchor-target"
          type="button"
          style="anchor-name: --published; --usewc-anchor-name: --published"
        >
          Inbox
        </button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.remove();

      expect(anchorNameOf(anchorTarget)).toBe("--published");
    });

    it("falls back to generating its own name when nothing is published", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(positionAnchorOf(badge)).not.toBe("--published");
      expect(anchorNameOf(anchorTarget)).toBe(positionAnchorOf(badge));
    });
  });

  describe("anchored state", () => {
    it("renders as a normal-flow chip with no anchor", async () => {
      render(html`<use-badge>3</use-badge>`);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(badge.matches(":state(anchored)")).toBe(false);
      expect(getComputedStyle(badge).position).not.toBe("absolute");
    });

    it("renders as a normal-flow chip when anchor points at a missing id", async () => {
      render(html`<use-badge anchortarget="does-not-exist">3</use-badge>`);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(badge.matches(":state(anchored)")).toBe(false);
      expect(getComputedStyle(badge).position).not.toBe("absolute");
    });

    it("gains the anchored state once a valid anchor resolves", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(badge.matches(":state(anchored)")).toBe(true);
      expect(getComputedStyle(badge).position).toBe("absolute");
    });

    it("loses the anchored state when the anchor is cleared", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.anchortarget = undefined;
      await badge.updateComplete;

      expect(badge.matches(":state(anchored)")).toBe(false);
      expect(getComputedStyle(badge).position).not.toBe("absolute");
    });
  });

  describe("aria-describedby wiring", () => {
    it("appends its own id to the anchor's aria-describedby", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorTarget.getAttribute("aria-describedby")).toBe(badge.id);
    });

    it("appends to an existing aria-describedby instead of replacing it", async () => {
      render(html`
        <span id="existing-description">Has attachments</span>
        <button id="anchor-target" type="button" aria-describedby="existing-description">
          Inbox
        </button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const describedByIds = anchorTarget.getAttribute("aria-describedby")?.split(/\s+/);
      expect(describedByIds).toContain("existing-description");
      expect(describedByIds).toContain(badge.id);
    });

    it("removes only its own id from aria-describedby on disconnect, preserving others", async () => {
      render(html`
        <span id="existing-description">Has attachments</span>
        <button id="anchor-target" type="button" aria-describedby="existing-description">
          Inbox
        </button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.remove();

      expect(anchorTarget.getAttribute("aria-describedby")).toBe("existing-description");
    });

    it("re-points aria-describedby when the anchor attribute changes", async () => {
      render(html`
        <button id="first-target" type="button">First</button>
        <button id="second-target" type="button">Second</button>
        <use-badge anchortarget="first-target">3</use-badge>
      `);
      const firstTarget = document.getElementById("first-target") as HTMLButtonElement;
      const secondTarget = document.getElementById("second-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      badge.anchortarget = "second-target";
      await badge.updateComplete;

      expect(firstTarget.hasAttribute("aria-describedby")).toBe(false);
      expect(secondTarget.getAttribute("aria-describedby")).toBe(badge.id);
    });

    it("does not set aria-describedby when options is noaria", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target" options="noaria">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorTarget.hasAttribute("aria-describedby")).toBe(false);
      expect(anchorNameOf(anchorTarget)).not.toBe("");
    });

    it("removes aria-describedby when options changes to noaria", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorTarget.getAttribute("aria-describedby")).toBe(badge.id);

      badge.options = "noaria";
      await badge.updateComplete;

      expect(anchorTarget.hasAttribute("aria-describedby")).toBe(false);
    });

    it("adds aria-describedby when options changes away from noaria", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target" options="noaria">3</use-badge>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(anchorTarget.hasAttribute("aria-describedby")).toBe(false);

      badge.options = "";
      await badge.updateComplete;

      expect(anchorTarget.getAttribute("aria-describedby")).toBe(badge.id);
    });
  });

  describe("content", () => {
    it("renders slotted content by default", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target">99+</use-badge>
      `);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(badge.textContent?.trim()).toBe("99+");
    });

    it("does not render slotted content when dot is set", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target" dot>99+</use-badge>
      `);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const slot = badge.shadowRoot?.querySelector("slot");
      expect(slot).toBeNull();
    });
  });

  describe("size", () => {
    // badge.css fixes a content badge's height to one line (min-block-size: 1lh) and gives it
    // aspect-ratio: 1, so a single-glyph count is a square and a longer one grows into a pill
    // of the same height. tabular-nums keeps every digit the same advance width. tokens.css and
    // theme.css are loaded globally in this file, so these exercise the themed sizing.
    it("renders a single-character count as a square and a longer one as a wider pill", async () => {
      render(html`
        <button id="short-anchor" type="button">Inbox</button>
        <use-badge anchortarget="short-anchor">3</use-badge>
        <button id="long-anchor" type="button">Inbox</button>
        <use-badge anchortarget="long-anchor">99+</use-badge>
      `);
      const [shortBadge, longBadge] = Array.from(
        document.querySelectorAll("use-badge"),
      ) as UseBadge[];
      await shortBadge.updateComplete;
      await longBadge.updateComplete;

      const shortRect = shortBadge.getBoundingClientRect();
      const longRect = longBadge.getBoundingClientRect();

      expect(shortRect.width).toBeCloseTo(shortRect.height, 0);
      expect(longRect.height).toBeCloseTo(shortRect.height, 0);
      expect(longRect.width).toBeGreaterThan(shortRect.width);
    });

    it("keeps the same width for two counts with the same digit count", async () => {
      render(html`
        <button id="eleven-anchor" type="button">Inbox</button>
        <use-badge anchortarget="eleven-anchor">11</use-badge>
        <button id="eighty-anchor" type="button">Inbox</button>
        <use-badge anchortarget="eighty-anchor">88</use-badge>
      `);
      const [elevenBadge, eightyBadge] = Array.from(
        document.querySelectorAll("use-badge"),
      ) as UseBadge[];
      await elevenBadge.updateComplete;
      await eightyBadge.updateComplete;

      expect(elevenBadge.getBoundingClientRect().width).toBeCloseTo(
        eightyBadge.getBoundingClientRect().width,
        1,
      );
    });
  });

  describe("alignment attributes", () => {
    it("reflects blockalign and inlinealign", async () => {
      render(html`
        <button id="anchor-target" type="button">Inbox</button>
        <use-badge anchortarget="anchor-target" blockalign="end" inlinealign="start">3</use-badge>
      `);
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      expect(badge.getAttribute("blockalign")).toBe("end");
      expect(badge.getAttribute("inlinealign")).toBe("start");
    });
  });

  describe("corner geometry", () => {
    // theme.css extends the badge's relevant near edge — inset-inline-end/-start and
    // inset-block-start/-end, matching whichever corner is selected — exactly half a line
    // height (0.5lh) outward past the anchor's corresponding edge. That offset is a fixed
    // amount, not proportional to the badge's own size, so it holds exactly regardless of how
    // wide the content makes the badge; wider content just grows the far edge further out
    // instead of moving this near edge. These tests load theme.css/tokens.css to exercise that
    // themed geometry, not the component's own unthemed defaults.
    function halfLineHeightOf(element: Element) {
      return parseFloat(getComputedStyle(element).lineHeight) / 2;
    }

    it("extends outward from the anchor's block-start/inline-end corner by default", async () => {
      render(html`
        <div style="position: relative; padding: 4rem">
          <button id="anchor-target" type="button">Inbox</button>
          <use-badge anchortarget="anchor-target">3</use-badge>
        </div>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const anchorRect = anchorTarget.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const halfLineHeight = halfLineHeightOf(badge);

      expect(badgeRect.top).toBeCloseTo(anchorRect.top - halfLineHeight, 0);
      expect(badgeRect.right).toBeCloseTo(anchorRect.right + halfLineHeight, 0);
    });

    it("extends outward from the anchor's block-end/inline-start corner when aligned", async () => {
      render(html`
        <div style="position: relative; padding: 4rem">
          <button id="anchor-target" type="button">Inbox</button>
          <use-badge anchortarget="anchor-target" blockalign="end" inlinealign="start">3</use-badge>
        </div>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const anchorRect = anchorTarget.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const halfLineHeight = halfLineHeightOf(badge);

      expect(badgeRect.bottom).toBeCloseTo(anchorRect.bottom + halfLineHeight, 0);
      expect(badgeRect.left).toBeCloseTo(anchorRect.left - halfLineHeight, 0);
    });

    it("keeps the same near-edge offset and height regardless of content length", async () => {
      render(html`
        <div style="position: relative; padding: 4rem">
          <div><button id="short-anchor" type="button">Inbox</button></div>
          <use-badge anchortarget="short-anchor">3</use-badge>
          <div><button id="long-anchor" type="button">Notifications</button></div>
          <use-badge anchortarget="long-anchor">99+</use-badge>
        </div>
      `);
      const shortAnchor = document.getElementById("short-anchor") as HTMLButtonElement;
      const longAnchor = document.getElementById("long-anchor") as HTMLButtonElement;
      const [shortBadge, longBadge] = Array.from(
        document.querySelectorAll("use-badge"),
      ) as UseBadge[];
      await shortBadge.updateComplete;
      await longBadge.updateComplete;

      const shortBadgeRect = shortBadge.getBoundingClientRect();
      const longBadgeRect = longBadge.getBoundingClientRect();
      const halfLineHeight = halfLineHeightOf(longBadge);

      expect(longBadgeRect.height).toBeCloseTo(shortBadgeRect.height, 0);
      expect(longBadgeRect.width).toBeGreaterThan(shortBadgeRect.width);
      expect(longBadgeRect.right).toBeCloseTo(
        longAnchor.getBoundingClientRect().right + halfLineHeight,
        0,
      );
      expect(shortBadgeRect.right).toBeCloseTo(
        shortAnchor.getBoundingClientRect().right + halfLineHeight,
        0,
      );
    });

    // translate doesn't auto-mirror for RTL the way the logical inset-*-start/-end properties
    // and anchor() arguments do, so the inline-axis sign needs an explicit :dir(rtl) override —
    // without it, a badge extends into its anchor instead of away from it under RTL.
    it("extends outward on the correct side under RTL", async () => {
      render(html`
        <div dir="rtl" style="position: relative; padding: 4rem">
          <button id="anchor-target" type="button">Inbox</button>
          <use-badge anchortarget="anchor-target">3</use-badge>
        </div>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const anchorRect = anchorTarget.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const halfLineHeight = halfLineHeightOf(badge);

      // Default alignment (inline-end) is the anchor's left edge under RTL, so the badge should
      // extend further left (outward), not overlap back into the button.
      expect(badgeRect.left).toBeCloseTo(anchorRect.left - halfLineHeight, 0);
      expect(badgeRect.top).toBeCloseTo(anchorRect.top - halfLineHeight, 0);
    });
  });

  describe("unthemed corner geometry", () => {
    // The component's own :host styles mirror theme.css's near-edge offset formula with literal
    // values instead of tokens: half a line height for content badges, a third of the dot's own
    // size for dot badges — so an unthemed badge extends outward the same way a themed one does,
    // just at unthemed sizing. <use-theme-escape> reverts badge.css's rules (theme.css/tokens.css
    // are loaded globally in this file, same as the themed tests above) back to those defaults.
    function halfLineHeightOf(element: Element) {
      return parseFloat(getComputedStyle(element).lineHeight) / 2;
    }

    it("extends outward from the anchor's corner by half a line height", async () => {
      render(html`
        <use-theme-escape>
          <div style="position: relative; padding: 4rem">
            <button id="anchor-target" type="button">Inbox</button>
            <use-badge anchortarget="anchor-target">3</use-badge>
          </div>
        </use-theme-escape>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const anchorRect = anchorTarget.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const halfLineHeight = halfLineHeightOf(badge);

      expect(badgeRect.top).toBeCloseTo(anchorRect.top - halfLineHeight, 0);
      expect(badgeRect.right).toBeCloseTo(anchorRect.right + halfLineHeight, 0);
    });

    it("extends outward from the anchor's corner by a third of the dot's own size", async () => {
      render(html`
        <use-theme-escape>
          <div style="position: relative; padding: 4rem">
            <button id="anchor-target" type="button">Alerts</button>
            <use-badge anchortarget="anchor-target" dot aria-label="Unread alerts"></use-badge>
          </div>
        </use-theme-escape>
      `);
      const anchorTarget = document.getElementById("anchor-target") as HTMLButtonElement;
      const badge = document.querySelector("use-badge") as UseBadge;
      await badge.updateComplete;

      const anchorRect = anchorTarget.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const dotOffset = badgeRect.width / 3;

      expect(badgeRect.top).toBeCloseTo(anchorRect.top - dotOffset, 0);
      expect(badgeRect.right).toBeCloseTo(anchorRect.right + dotOffset, 0);
    });
  });
});

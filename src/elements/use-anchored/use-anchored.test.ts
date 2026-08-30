import { expect, describe, it } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-anchored";
import { UseAnchored } from "./use-anchored";
import "../../styles/tokens.css";
import "../../styles/theme.css";

function waitForOpenState(element: HTMLElement, expected: boolean) {
  return new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + 1000;
    const check = () => {
      if (element.matches(":popover-open") === expected) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for :popover-open to be ${expected}`));
        return;
      }
      setTimeout(check, 10);
    };
    check();
  });
}

describe("use-anchored", () => {
  it("does nothing when target is unset", async () => {
    render(html`
      <use-anchored>
        <div id="thing" popover class="appearance-native">Content</div>
      </use-anchored>
    `);

    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    expect(anchored.matches(":state(anchored)")).toBe(false);
  });

  it("resolves target and writes anchor-name onto it", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <div id="thing" popover class="appearance-native">Content</div>
      </use-anchored>
    `);

    const anchorTarget = document.getElementById("anchor-target") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    const thing = document.getElementById("thing") as HTMLElement;
    await anchored.updateComplete;

    expect(anchorTarget.style.getPropertyValue("anchor-name")).not.toBe("");
    expect(thing.style.getPropertyValue("position-anchor")).not.toBe("");
    expect(anchored.matches(":state(anchored)")).toBe(true);
  });

  it("removes anchor-name from the target on disconnect", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <div id="thing" popover class="appearance-native">Content</div>
      </use-anchored>
    `);

    const anchorTarget = document.getElementById("anchor-target") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    anchored.remove();
    expect(anchorTarget.style.getPropertyValue("anchor-name")).toBe("");
  });

  it("re-resolves when target changes", async () => {
    render(html`
      <button id="first-anchor">First</button>
      <button id="second-anchor">Second</button>
      <use-anchored target="first-anchor">
        <div id="thing" popover class="appearance-native">Content</div>
      </use-anchored>
    `);

    const firstAnchor = document.getElementById("first-anchor") as HTMLElement;
    const secondAnchor = document.getElementById("second-anchor") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    expect(firstAnchor.style.getPropertyValue("anchor-name")).not.toBe("");

    anchored.target = "second-anchor";
    await anchored.updateComplete;

    expect(firstAnchor.style.getPropertyValue("anchor-name")).toBe("");
    expect(secondAnchor.style.getPropertyValue("anchor-name")).not.toBe("");
  });

  it("anchors a plain [popover] element opened via showPopover()", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <div id="thing" popover class="appearance-native">Content</div>
      </use-anchored>
    `);

    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    thing.showPopover();
    await waitForOpenState(thing, true);

    expect(getComputedStyle(thing).position).toBe("fixed");
  });

  it("anchors a <dialog> opened via show()", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <dialog id="thing" class="appearance-native">Content</dialog>
      </use-anchored>
    `);

    const thing = document.getElementById("thing") as HTMLDialogElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    thing.show();

    expect(getComputedStyle(thing).position).toBe("fixed");

    thing.close();
  });

  // A themed anchored surface keeps a small gap from its anchor (surface.css), the same
  // convention use-menu follows. The gap is theme-only: `.appearance-native` and
  // use-theme-escape both opt out, which the two cases below and the escape test that follows
  // cover together.
  it("holds a gap between a themed [popover] and its anchor", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <div id="thing" popover>Content</div>
      </use-anchored>
    `);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    thing.showPopover();
    await waitForOpenState(thing, true);

    const offset = Number.parseFloat(
      getComputedStyle(thing).getPropertyValue("margin-block-start"),
    );
    expect(offset).toBeGreaterThan(0);
    expect(thing.getBoundingClientRect().top).toBeCloseTo(
      trigger.getBoundingClientRect().bottom + offset,
      0,
    );
  });

  it("holds a gap between a themed <dialog> and its anchor", async () => {
    render(html`
      <button id="anchor-target">Anchor</button>
      <use-anchored target="anchor-target">
        <dialog id="thing">Content</dialog>
      </use-anchored>
    `);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLDialogElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    thing.show();

    const offset = Number.parseFloat(
      getComputedStyle(thing).getPropertyValue("margin-block-start"),
    );
    expect(offset).toBeGreaterThan(0);
    expect(thing.getBoundingClientRect().top).toBeCloseTo(
      trigger.getBoundingClientRect().bottom + offset,
      0,
    );

    thing.close();
  });

  // surface.css reworks an anchored themed surface's `max-block-size` cap to hold a 45dvh
  // floor. A side smaller than that overflows and triggers a `position-try` flip instead of
  // letting the surface shrink to fit — and, because the floor doesn't track the current
  // side, that flip also re-runs on scroll (flip and flip back), which the original
  // `min(80dvh, 100% - <pad>)` cap suppressed. The default `position-try-order` is kept, so
  // it stays below the anchor whenever the content fits there.
  const flipMarkup = html`
    <div style="block-size: 92vh;"></div>
    <button id="anchor-target">Anchor</button>
    <div style="block-size: 150vh;"></div>
    <use-anchored target="anchor-target">
      <div id="thing" popover>
        <div style="block-size: 150vh;">Tall content</div>
      </div>
    </use-anchored>
  `;

  it("flips a themed popover above the anchor when it can't fit below", async () => {
    render(flipMarkup);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    trigger.scrollIntoView({ block: "end" });
    thing.showPopover();
    await waitForOpenState(thing, true);

    const popover = thing.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    expect(popover.bottom).toBeLessThanOrEqual(anchor.top);
    expect(popover.top).toBeGreaterThanOrEqual(0);
    expect(thing.scrollHeight).toBeGreaterThan(thing.clientHeight);
  });

  it("keeps a themed popover below the anchor when the content fits there", async () => {
    render(html`
      <div id="spacer-before" style="block-size: 60vh;"></div>
      <button id="anchor-target">Anchor</button>
      <div style="block-size: 200vh;"></div>
      <use-anchored target="anchor-target">
        <div id="thing" popover><div style="block-size: 6rem;">Short content</div></div>
      </use-anchored>
    `);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    // Park the anchor a little below centre: more room above than below, but the short
    // content still fits below. Default order keeps it below; `most-block-size` would flip it
    // up to the roomier side.
    const trigger_top = trigger.offsetTop;
    window.scrollTo(0, trigger_top - window.innerHeight * 0.55);
    thing.showPopover();
    await waitForOpenState(thing, true);

    const anchor = trigger.getBoundingClientRect();
    expect(window.innerHeight - anchor.bottom).toBeLessThan(anchor.top);
    expect(thing.getBoundingClientRect().top).toBeGreaterThanOrEqual(anchor.bottom - 1);
  });

  it("re-flips a themed popover when scrolling changes which side has room", async () => {
    render(flipMarkup);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    trigger.scrollIntoView({ block: "start" });
    thing.showPopover();
    await waitForOpenState(thing, true);
    expect(thing.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().bottom - 1,
    );

    trigger.scrollIntoView({ block: "end" });
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(thing.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().top + 1,
    );
  });

  // theme.css wraps non-`allowTheme` story content in <use-theme-escape>, which sweeps `all:
  // revert` across its light-DOM descendants to render them unstyled. use-anchored's
  // ::slotted() positioning rules are functional, not decorative, so they need to survive that
  // sweep — regression coverage for a real bug where position-area/inset got reverted to their
  // initial values, stranding the wrapped element at the viewport's default position.
  it("keeps positioning when wrapped in use-theme-escape", async () => {
    render(html`
      <use-theme-escape>
        <button id="anchor-target">Anchor</button>
        <use-anchored target="anchor-target">
          <div id="thing" popover class="appearance-native">Content</div>
        </use-anchored>
      </use-theme-escape>
    `);

    const trigger = document.getElementById("anchor-target") as HTMLElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    thing.showPopover();
    await waitForOpenState(thing, true);

    expect(getComputedStyle(thing).getPropertyValue("position-area")).not.toBe("none");
    expect(thing.getBoundingClientRect().top).toBeCloseTo(
      trigger.getBoundingClientRect().bottom,
      0,
    );
  });

  // Not use-anchored's job — the Popover API restores focus to the previously-focused element
  // on its own when a popover.:popover-open element is dismissed. Coverage that composing with
  // use-anchored doesn't interfere with that native behavior.
  it("restores focus to the invoker when a soft-dismissed popover closes on Escape", async () => {
    render(html`
      <button id="trigger" popovertarget="thing">Open</button>
      <use-anchored target="trigger">
        <div id="thing" popover class="appearance-native">
          <input id="field" type="text" />
        </div>
      </use-anchored>
    `);

    const trigger = document.getElementById("trigger") as HTMLButtonElement;
    const field = document.getElementById("field") as HTMLInputElement;
    const thing = document.getElementById("thing") as HTMLElement;
    const anchored = document.querySelector("use-anchored") as UseAnchored;
    await anchored.updateComplete;

    await userEvent.click(trigger);
    await waitForOpenState(thing, true);

    field.focus();
    await userEvent.keyboard("{Escape}");
    await waitForOpenState(thing, false);

    expect(document.activeElement).toBe(trigger);
  });
});

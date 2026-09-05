import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-avatar";
import { UseAvatar } from "./use-avatar";
import "../../styles/tokens.css";
import "../../styles/theme.css";

const blankImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3C/svg%3E";

function styleOf(element: Element, property: string) {
  return getComputedStyle(element).getPropertyValue(property);
}

async function settle(avatar: UseAvatar) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (await avatar.updateComplete) {
      return;
    }
  }
}

// The initials are the slot's fallback content, so the span is always present in the shadow DOM
// and the platform decides whether it renders. Ask the slot, not the DOM: anything assigned means
// the fallback is suppressed, however the span looks from the outside.
function initialsOf(avatar: UseAvatar) {
  const slot = avatar.shadowRoot?.querySelector("slot");
  if (!slot || slot.assignedNodes().length > 0) {
    return null;
  }
  return slot.querySelector('[part="initials"]')?.textContent ?? null;
}

describe("use-avatar", () => {
  it("shows first + last initials from the name when the slot is empty", async () => {
    render(html`<use-avatar name="Riley Quinn"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBe("RQ");
  });

  it("uses a single initial for a one-word name", async () => {
    render(html`<use-avatar name="madonna"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBe("M");
  });

  it("takes no ARIA role or label of its own, leaving the slotted img's alt to speak", async () => {
    render(html`<use-avatar name="Riley Quinn"><img alt="Riley" src=${blankImage} /></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(avatar.hasAttribute("role")).toBe(false);
    expect(avatar.hasAttribute("aria-label")).toBe(false);
  });

  it("swaps the initials out for slotted content without a slotchange listener", async () => {
    render(html`<use-avatar name="Riley Quinn"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);
    expect(initialsOf(avatar)).toBe("RQ");

    const image = document.createElement("img");
    image.alt = "";
    image.src = blankImage;
    avatar.append(image);
    await settle(avatar);

    // No re-render is involved — assigning a node suppresses the slot's fallback on its own.
    expect(initialsOf(avatar)).toBeNull();

    image.remove();
    await settle(avatar);
    expect(initialsOf(avatar)).toBe("RQ");
  });

  it("leaves the initials fallback readable rather than hiding it", async () => {
    render(html`<use-avatar name="Riley Quinn"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    const initials = avatar.shadowRoot?.querySelector('[part="initials"]');
    expect(initials?.hasAttribute("aria-hidden")).toBe(false);
  });

  it("renders no initials fallback when an img is slotted", async () => {
    render(html`<use-avatar name="Riley Quinn"><img alt="" src=${blankImage} /></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBeNull();
  });

  it("fills the box with a slotted img and clips it to the shape", async () => {
    render(html`<use-avatar><img id="photo" alt="" src=${blankImage} /></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    const photo = document.getElementById("photo")!;
    expect(styleOf(photo, "object-fit")).toBe("cover");
    expect(Math.round(photo.getBoundingClientRect().width)).toBe(
      Math.round(avatar.getBoundingClientRect().width),
    );
  });

  it("renders no initials fallback when an svg is slotted", async () => {
    render(html`
      <use-avatar>
        <svg viewBox="0 0 8 8"><rect width="8" height="8"></rect></svg>
      </use-avatar>
    `);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBeNull();
  });

  it("shows slotted text verbatim rather than deriving initials", async () => {
    render(html`<use-avatar name="Riley Quinn">riley</use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBeNull();
    expect(avatar.textContent?.trim()).toBe("riley");
  });

  it("is sized by plain inline-size, with no custom property of its own", async () => {
    render(html`<use-avatar name="AB" style="inline-size: 3rem"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(styleOf(avatar, "width")).toBe("48px");
    expect(styleOf(avatar, "height")).toBe("48px");
  });

  it("takes its proportions from plain aspect-ratio", async () => {
    render(html`
      <use-avatar name="AB" class="square" style="inline-size: 32rem; aspect-ratio: 2"></use-avatar>
    `);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    const rect = avatar.getBoundingClientRect();
    expect(Math.round(rect.width / rect.height)).toBe(2);
  });

  it("keeps a sized glyph at its own size and caps an oversized one at the frame", async () => {
    render(html`
      <div>
        <use-avatar id="sized" name="Calendar" style="inline-size: 40px">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <rect x="3" y="4" width="18" height="17"></rect>
          </svg>
        </use-avatar>
        <use-avatar id="oversized" name="Calendar" style="inline-size: 40px">
          <svg viewBox="0 0 24 24" width="200" height="200">
            <rect x="3" y="4" width="18" height="17"></rect>
          </svg>
        </use-avatar>
      </div>
    `);
    const [sized, oversized] = [...document.querySelectorAll("use-avatar")] as UseAvatar[];
    await settle(sized);
    await settle(oversized);

    // The element caps rather than dictates: a glyph that asks for a size gets it, and one that
    // asks for too much is held to the frame instead of overflowing it.
    expect(sized.querySelector("svg")!.getBoundingClientRect().width).toBe(22);
    expect(oversized.querySelector("svg")!.getBoundingClientRect().width).toBe(40);
  });

  it("fills the frame with a slotted img, unlike a glyph", async () => {
    render(html`
      <use-avatar name="Riley Quinn" style="inline-size: 40px">
        <img alt="" src=${blankImage} />
      </use-avatar>
    `);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(avatar.querySelector("img")!.getBoundingClientRect().width).toBe(40);
  });

  it("carries no shape of its own, leaving every radius to the theme", async () => {
    render(html`
      <use-theme-escape>
        <use-avatar name="AB"></use-avatar>
        <use-avatar name="CD" class="square"></use-avatar>
      </use-theme-escape>
    `);
    const [plain, square] = [...document.querySelectorAll("use-avatar")] as UseAvatar[];
    await settle(plain);
    await settle(square);

    // Escaped, the theme is reverted and nothing rounds the box. A radius baked in here would
    // also turn a wide `aspect-ratio` into a pill, since the element can't know its own shape.
    expect(styleOf(plain, "border-top-left-radius")).toBe("0px");
    expect(styleOf(square, "border-top-left-radius")).toBe("0px");
  });

  it("rounds into a squircle with the squircle class", async () => {
    render(html`
      <use-avatar name="AB"></use-avatar>
      <use-avatar name="CD" class="squircle"></use-avatar>
    `);
    const [circle, squircle] = [...document.querySelectorAll("use-avatar")] as UseAvatar[];
    await settle(circle);
    await settle(squircle);

    expect(styleOf(squircle, "border-top-left-radius")).not.toBe(
      styleOf(circle, "border-top-left-radius"),
    );
  });

  it("squares off with the square class", async () => {
    render(html`
      <use-avatar name="AB"></use-avatar>
      <use-avatar name="CD" class="square"></use-avatar>
    `);
    const [circle, square] = [...document.querySelectorAll("use-avatar")] as UseAvatar[];
    await settle(circle);
    await settle(square);

    expect(styleOf(square, "border-top-left-radius")).toBe("6px");
    expect(styleOf(circle, "border-top-left-radius")).not.toBe("6px");
  });

  it("reverts its themed look inside use-theme-escape", async () => {
    render(html`
      <use-avatar id="themed" name="AB"></use-avatar>
      <use-theme-escape>
        <use-avatar id="escaped" name="AB"></use-avatar>
      </use-theme-escape>
    `);
    const themed = document.getElementById("themed") as UseAvatar;
    const escaped = document.getElementById("escaped") as UseAvatar;
    await settle(themed);
    await settle(escaped);

    expect(styleOf(escaped, "background-color")).not.toBe(styleOf(themed, "background-color"));
  });
});

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

function initialsOf(avatar: UseAvatar) {
  return avatar.shadowRoot?.querySelector('[part="initials"]')?.textContent ?? null;
}

describe("use-avatar", () => {
  it("shows first + last initials from the name when the slot is empty", async () => {
    render(html`<use-avatar name="Ada Lovelace"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBe("AL");
  });

  it("uses a single initial for a one-word name", async () => {
    render(html`<use-avatar name="madonna"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBe("M");
  });

  it("gives the host role=img and the name as its aria-label", async () => {
    render(html`<use-avatar name="Ada Lovelace"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(avatar.getAttribute("role")).toBe("img");
    expect(avatar.getAttribute("aria-label")).toBe("Ada Lovelace");
  });

  it("carries no role or label without a name", async () => {
    render(html`<use-avatar><img alt="Ada" src=${blankImage} /></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(avatar.hasAttribute("role")).toBe(false);
    expect(avatar.hasAttribute("aria-label")).toBe(false);
  });

  it("renders no initials fallback when an img is slotted", async () => {
    render(html`<use-avatar name="Ada Lovelace"><img alt="" src=${blankImage} /></use-avatar>`);
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
    render(html`<use-avatar name="Ada Lovelace">ada</use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(initialsOf(avatar)).toBeNull();
    expect(avatar.textContent?.trim()).toBe("ada");
  });

  it("is sized by the --usewc-avatar-size custom property", async () => {
    render(html`<use-avatar name="AB" style="--usewc-avatar-size: 3rem"></use-avatar>`);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    expect(styleOf(avatar, "width")).toBe("48px");
    expect(styleOf(avatar, "height")).toBe("48px");
  });

  it("takes its proportions from the --usewc-avatar-ratio custom property", async () => {
    render(html`
      <use-avatar
        name="AB"
        shape="square"
        style="--usewc-avatar-size: 32rem; --usewc-avatar-ratio: 2"
      ></use-avatar>
    `);
    const avatar = document.querySelector("use-avatar") as UseAvatar;
    await settle(avatar);

    const rect = avatar.getBoundingClientRect();
    expect(Math.round(rect.width / rect.height)).toBe(2);
  });

  it("squares off with shape=square", async () => {
    render(html`
      <use-avatar name="AB"></use-avatar>
      <use-avatar name="CD" shape="square"></use-avatar>
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

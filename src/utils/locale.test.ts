import { afterEach, describe, expect, it } from "vite-plus/test";
import { resolveLocale } from "./locale";

const originalLang = document.documentElement.getAttribute("lang");

afterEach(() => {
  document.body.replaceChildren();
  if (originalLang === null) {
    document.documentElement.removeAttribute("lang");
  } else {
    document.documentElement.setAttribute("lang", originalLang);
  }
});

describe("resolveLocale", () => {
  it("prefers the element's own lang", () => {
    document.documentElement.setAttribute("lang", "fr");
    const element = document.createElement("span");
    element.setAttribute("lang", "de");
    document.body.append(element);
    expect(resolveLocale(element)).toBe("de");
  });

  it("ignores lang on a container", () => {
    document.documentElement.setAttribute("lang", "fr");
    const container = document.createElement("section");
    container.setAttribute("lang", "de");
    const element = document.createElement("span");
    container.append(element);
    document.body.append(container);
    expect(resolveLocale(element)).toBe("fr");
  });

  it("follows the page's lang from inside a shadow root", () => {
    document.documentElement.setAttribute("lang", "fr");
    const host = document.createElement("div");
    const element = document.createElement("span");
    host.attachShadow({ mode: "open" }).append(element);
    document.body.append(host);
    expect(resolveLocale(element)).toBe("fr");
  });

  it("falls back to the browser's language without a page lang", () => {
    document.documentElement.removeAttribute("lang");
    const element = document.createElement("span");
    document.body.append(element);
    expect(resolveLocale(element)).toBe(navigator.language || "en-US");
  });
});

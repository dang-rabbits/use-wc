import { afterEach, describe, expect, it } from "vite-plus/test";
import { InlineDirectionElement } from "./inline-direction-element";

class TestInlineDirection extends InlineDirectionElement(HTMLElement) {
  lastKey = "";

  constructor() {
    super();
    this.addEventListener("keydown", (event) => {
      this.lastKey = this.inlineArrowKey(event.key);
    });
  }

  connectedCallback() {
    this.tabIndex = 0;
  }
}

customElements.define("test-inline-direction", TestInlineDirection);

function renderElement(container: HTMLElement = document.body) {
  const element = document.createElement("test-inline-direction") as TestInlineDirection;
  container.append(element);
  return element;
}

function press(element: TestInlineDirection, key: string) {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  return element.lastKey;
}

describe("InlineDirectionElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns arrow keys unchanged in left-to-right layouts", () => {
    const element = renderElement();
    element.focus();
    expect(press(element, "ArrowLeft")).toBe("ArrowLeft");
    expect(press(element, "ArrowRight")).toBe("ArrowRight");
  });

  it("swaps ArrowLeft and ArrowRight in right-to-left layouts", () => {
    const element = renderElement();
    element.dir = "rtl";
    element.focus();
    expect(press(element, "ArrowLeft")).toBe("ArrowRight");
    expect(press(element, "ArrowRight")).toBe("ArrowLeft");
  });

  it("follows the direction inherited from an ancestor", () => {
    const parent = document.createElement("div");
    parent.dir = "rtl";
    document.body.append(parent);
    const element = renderElement(parent);
    element.focus();
    expect(press(element, "ArrowRight")).toBe("ArrowLeft");
  });

  it("leaves other keys unchanged in right-to-left layouts", () => {
    const element = renderElement();
    element.dir = "rtl";
    element.focus();
    expect(press(element, "ArrowUp")).toBe("ArrowUp");
    expect(press(element, "Home")).toBe("Home");
  });

  it("reads the direction again each time focus enters", () => {
    const element = renderElement();
    element.focus();
    element.dir = "rtl";
    expect(press(element, "ArrowRight")).toBe("ArrowRight");

    element.blur();
    element.focus();
    expect(press(element, "ArrowRight")).toBe("ArrowLeft");
  });
});

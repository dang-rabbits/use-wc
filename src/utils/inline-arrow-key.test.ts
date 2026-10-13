import { afterEach, describe, expect, it } from "vite-plus/test";
import inlineArrowKey from "./inline-arrow-key";

describe("inlineArrowKey", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the key unchanged in a left-to-right element", () => {
    const element = document.createElement("div");
    document.body.append(element);
    expect(inlineArrowKey(element, "ArrowLeft")).toBe("ArrowLeft");
    expect(inlineArrowKey(element, "ArrowRight")).toBe("ArrowRight");
  });

  it("swaps ArrowLeft and ArrowRight in a right-to-left element", () => {
    const element = document.createElement("div");
    element.dir = "rtl";
    document.body.append(element);
    expect(inlineArrowKey(element, "ArrowLeft")).toBe("ArrowRight");
    expect(inlineArrowKey(element, "ArrowRight")).toBe("ArrowLeft");
  });

  it("follows the direction inherited from an ancestor", () => {
    const parent = document.createElement("div");
    parent.dir = "rtl";
    const element = document.createElement("div");
    parent.append(element);
    document.body.append(parent);
    expect(inlineArrowKey(element, "ArrowRight")).toBe("ArrowLeft");
  });

  it("leaves other keys unchanged in a right-to-left element", () => {
    const element = document.createElement("div");
    element.dir = "rtl";
    document.body.append(element);
    expect(inlineArrowKey(element, "ArrowUp")).toBe("ArrowUp");
    expect(inlineArrowKey(element, "Home")).toBe("Home");
  });
});

export default function inlineArrowKey(element: Element, key: string) {
  if (key !== "ArrowLeft" && key !== "ArrowRight") {
    return key;
  }

  if (!element.matches(":dir(rtl)")) {
    return key;
  }

  return key === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
}

export default function inlineArrowKey(element: Element, key: string) {
  if (!element.matches(":dir(rtl)")) {
    return key;
  }

  if (key === "ArrowLeft") {
    return "ArrowRight";
  }

  if (key === "ArrowRight") {
    return "ArrowLeft";
  }

  return key;
}

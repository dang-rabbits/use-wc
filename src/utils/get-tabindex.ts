import { FocusableElement, getTabIndex as getTabIndexFn } from "tabbable";

export const INITIAL_TABINDEX_VALUE = "initial";

export default function getTabIndex(element: HTMLElement | FocusableElement) {
  if (element.shadowRoot?.delegatesFocus && element.getAttribute("tabindex") === null) {
    return "0";
  }

  if (element.getAttribute("tabindex") === null) {
    return INITIAL_TABINDEX_VALUE;
  }

  return String(getTabIndexFn(element));
}

import { customElement, property } from "lit/decorators.js";
import { UseWidget } from "../use-widget/use-widget";
import { focusable } from "tabbable";

@customElement("use-gridcell")
export class UseGridCell extends UseWidget {
  /**
   * Determines how the cell behaves in terms of focus and interaction. The possible values are:
   *
   * - `'none'` - the cell itself is focusable and it does not contain any interactive elements.
   * - `'widget'` - the cell itself is focusable and it contains more than one interactive element. To access the interactive elements, the user must press `Enter` or `F2`, and to restore focus to the cell, the user must press `Esc` or `F2`.
   * - `'action'` - the cell itself is not focusable and it contains a single interactive element. The user can tab to the interactive elements directly.
   */
  @property({ type: String, reflect: true })
  mode: "widget" | "action" | "default" = "default";
  #action: HTMLElement | null = null;
  #actionsInitialized = false;

  connectedCallback() {
    if (this.mode === "widget") {
      super.connectedCallback();
    }

    if (!this.hasAttribute("role")) {
      this.setAttribute("role", this.closest("use-gridhead") ? "columnheader" : "gridcell");
    }

    this.tabIndex = -1;

    if (this.mode === "action") {
      this.addEventListener("focusin", this.#handleFocusIn);
      this.addEventListener("focusout", this.#handleFocusOut);
    }
  }

  #handleFocusIn = () => {
    if (!this.#actionsInitialized) {
      // `focusable` rather than `tabbable` so a control that has already been pulled out of the
      // tab sequence (`tabindex="-1"` — e.g. a selection checkbox the grid injects) still counts
      // as this cell's action target.
      focusable(this).forEach((el) => {
        el.tabIndex = -1;
        if (!this.#action) {
          this.#action = el as HTMLElement;
        }
      });
      this.#actionsInitialized = true;
    }

    if (this.#action) {
      this.#action.focus();
      this.tabIndex = -1;
    }
  };

  #handleFocusOut = (e: FocusEvent) => {
    if (!this.closest("use-grid")?.contains(e.relatedTarget as HTMLElement)) {
      this.tabIndex = 0;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "use-gridcell": UseGridCell;
  }
}

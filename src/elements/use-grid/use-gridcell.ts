import { customElement, property } from "lit/decorators.js";
import { UseWidget } from "../use-widget/use-widget";
import { tabbable } from "tabbable";

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

  connectedCallback() {
    if (this.mode === "widget") {
      super.connectedCallback();
    }

    // Role will be set by parent context (header/body)
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "gridcell");
    }

    setTimeout(() => {
      this.#initializeActions();
    }, 0);

    this.tabIndex = -1;
  }

  #initializeActions() {
    if (this.mode === "action") {
      tabbable(this).forEach((el) => {
        el.tabIndex = -1;
        if (!this.#action) {
          this.#action = el as HTMLElement;
        }
      });

      this.addEventListener("focusin", () => {
        if (this.#action) {
          this.#action.focus();
          this.tabIndex = -1;
        }
      });

      this.addEventListener("focusout", (e) => {
        if (!this.closest("use-grid")?.contains(e.relatedTarget as HTMLElement)) {
          this.tabIndex = 0;
        }
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-gridcell": UseGridCell;
  }
}

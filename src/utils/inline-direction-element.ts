type Constructor<Instance> = new (...args: any[]) => Instance;

export declare class InlineDirectionElementInterface {
  protected inlineArrowKey(key: string): string;
}

/**
 * Makes ArrowLeft and ArrowRight follow the element's text direction. The direction is read with
 * `:dir(rtl)` once each time focus enters the element from outside it, and reused for every key
 * press until focus leaves, so a `dir` change while focus is inside applies on the next visit.
 * Call `this.inlineArrowKey(event.key)` in a keydown handler to get the key as it would be in a
 * left-to-right layout.
 */
export function InlineDirectionElement<Base extends Constructor<HTMLElement>>(superClass: Base) {
  class InlineDirection extends superClass {
    #isRightToLeft = false;

    constructor(...args: any[]) {
      super(...args);
      this.addEventListener("focusin", this.#handleFocusIn);
    }

    #handleFocusIn = (event: FocusEvent) => {
      const previous = event.relatedTarget as Node | null;
      if (previous === this || this.contains(previous)) return;
      this.#isRightToLeft = this.matches(":dir(rtl)");
    };

    protected inlineArrowKey(key: string) {
      if (!this.#isRightToLeft) {
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
  }
  return InlineDirection as unknown as Constructor<InlineDirectionElementInterface> & Base;
}

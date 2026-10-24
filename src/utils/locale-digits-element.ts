import type { PropertyValues } from "lit";
import type { UseLocaleElement } from "../elements/use-locale-element/use-locale-element";
import { resolveLocaleDigits, toLatinDigits, toLocaleDigits } from "./locale-digits";

type Constructor<Instance> = new (...args: any[]) => Instance;

export declare class LocaleDigitsElementInterface {
  protected toLocaleDigits(value: string | number | undefined): string;
  protected toLatinDigits(text: string): string;
  protected segmentNumber(text: string | undefined): number | undefined;
  protected stepSegment(event: KeyboardEvent, minimum: number, maximum?: number): void;
}

/**
 * Writes and reads numbers in the element's numbering system, such as `١٤` for `ar-EG`. The
 * locale's digits are resolved once per locale change, before the element renders, so formatting
 * and parsing never look the locale up again. Locales that use Latin digits skip the conversion.
 */
export function LocaleDigitsElement<Base extends Constructor<UseLocaleElement>>(superClass: Base) {
  class LocaleDigits extends superClass {
    #digits: string[] | undefined;

    protected willUpdate(changedProperties: PropertyValues) {
      super.willUpdate(changedProperties);
      if (!this.hasUpdated || changedProperties.has("locale")) {
        this.#digits = resolveLocaleDigits(this.locale);
      }
    }

    protected toLocaleDigits(value: string | number | undefined) {
      return toLocaleDigits(this.#digits, value);
    }

    protected toLatinDigits(text: string) {
      return toLatinDigits(this.#digits, text);
    }

    protected segmentNumber(text: string | undefined) {
      const latin = toLatinDigits(this.#digits, text ?? "");
      return latin === "" ? undefined : parseInt(latin, 10);
    }

    /**
     * Steps a numeric segment input by one on ArrowUp or ArrowDown, within its range, and
     * dispatches an `input` event like a native number input does.
     */
    protected stepSegment(event: KeyboardEvent, minimum: number, maximum?: number) {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
        return;
      }
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      if (input.readOnly || input.disabled) {
        return;
      }
      const step = event.key === "ArrowUp" ? 1 : -1;
      const current = this.segmentNumber(input.value);
      const next =
        current === undefined
          ? step < 0 && maximum !== undefined
            ? maximum
            : minimum
          : current + step;
      const clamped = Math.max(minimum, maximum === undefined ? next : Math.min(maximum, next));
      input.value = this.toLocaleDigits(clamped);
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
  }
  return LocaleDigits as unknown as Constructor<LocaleDigitsElementInterface> & Base;
}

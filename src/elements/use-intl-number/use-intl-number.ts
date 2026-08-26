import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UseLocaleElement } from "../use-locale-element/use-locale-element";

type NumberStyle = "decimal" | "percent" | "currency" | "unit";
type CurrencyDisplay = "symbol" | "narrowSymbol" | "code" | "name";
type CurrencySign = "standard" | "accounting";
type SignDisplay = "auto" | "always" | "exceptZero" | "never";
type UnitDisplay = "short" | "narrow" | "long";

const NUMBER_STYLES: NumberStyle[] = ["decimal", "percent", "currency", "unit"];
const CURRENCY_DISPLAYS: CurrencyDisplay[] = ["symbol", "narrowSymbol", "code", "name"];
const CURRENCY_SIGNS: CurrencySign[] = ["standard", "accounting"];
const SIGN_DISPLAYS: SignDisplay[] = ["auto", "always", "exceptZero", "never"];
const UNIT_DISPLAYS: UnitDisplay[] = ["short", "narrow", "long"];

/**
 * Displays a localized, human-readable representation of a number using
 * [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).
 * Renders a semantic `<data>` element in its shadow root with a machine-readable
 * `value` attribute and formatted inner text.
 *
 * Set `numberstyle` to control what kind of number is formatted (see
 * [`style`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#style)):
 * - `decimal` (default) → plain number, e.g. `1,234.5`
 * - `percent` → percentage, e.g. `42%` (value is the fraction, so `0.42` renders `42%`)
 * - `currency` → currency amount, requires `currency`
 * - `unit` → measurement, requires `unit`
 *
 * Locale is resolved from the nearest ancestor `[lang]` attribute, or
 * `navigator.language` if none is found. Set `lang` directly on the element to override.
 *
 * @attr {string} value - Numeric amount to format
 * @attr {string} numberstyle - Format style: `decimal` | `percent` | `currency` | `unit`
 * @attr {string} currency - [ISO 4217 currency code](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#currency), e.g. `USD`, `EUR`, `JPY`. Required when numberstyle is `currency`
 * @attr {string} currencydisplay - [How the currency is denoted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#currencydisplay): `symbol` | `narrowSymbol` | `code` | `name`
 * @attr {string} currencysign - [Sign convention](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#currencysign): `standard` (minus sign) | `accounting` (parenthesized negatives)
 * @attr {string} unit - [Unit identifier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#unit), e.g. `kilometer-per-hour`, `liter`. Required when numberstyle is `unit`
 * @attr {string} unitdisplay - [How the unit is denoted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#unitdisplay): `short` | `narrow` | `long`
 * @attr {string} signdisplay - [When to show the sign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#signdisplay): `auto` | `always` | `exceptZero` | `never`
 * @attr {string} lang - BCP 47 locale tag. Inherits from nearest ancestor `[lang]` if not set.
 */
@customElement("use-intl-number")
export class UseIntlNumber extends UseLocaleElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String }) value?: string;
  @property({ type: String }) numberstyle?: string;
  @property({ type: String }) currency?: string;
  @property({ type: String }) currencydisplay?: string;
  @property({ type: String }) currencysign?: string;
  @property({ type: String }) unit?: string;
  @property({ type: String }) unitdisplay?: string;
  @property({ type: String }) signdisplay?: string;

  #resolveNumberStyle(): NumberStyle {
    return NUMBER_STYLES.includes(this.numberstyle as NumberStyle)
      ? (this.numberstyle as NumberStyle)
      : "decimal";
  }

  #resolveCurrencyDisplay(): CurrencyDisplay {
    return CURRENCY_DISPLAYS.includes(this.currencydisplay as CurrencyDisplay)
      ? (this.currencydisplay as CurrencyDisplay)
      : "symbol";
  }

  #resolveCurrencySign(): CurrencySign {
    return CURRENCY_SIGNS.includes(this.currencysign as CurrencySign)
      ? (this.currencysign as CurrencySign)
      : "standard";
  }

  #resolveUnitDisplay(): UnitDisplay {
    return UNIT_DISPLAYS.includes(this.unitdisplay as UnitDisplay)
      ? (this.unitdisplay as UnitDisplay)
      : "short";
  }

  #resolveSignDisplay(): SignDisplay {
    return SIGN_DISPLAYS.includes(this.signdisplay as SignDisplay)
      ? (this.signdisplay as SignDisplay)
      : "auto";
  }

  #resolveOptions(style: NumberStyle): Intl.NumberFormatOptions | null {
    if (style === "currency") {
      if (!this.currency) return null;
      return {
        style,
        currency: this.currency,
        currencyDisplay: this.#resolveCurrencyDisplay(),
        currencySign: this.#resolveCurrencySign(),
        signDisplay: this.#resolveSignDisplay(),
      };
    }

    if (style === "unit") {
      if (!this.unit) return null;
      return {
        style,
        unit: this.unit,
        unitDisplay: this.#resolveUnitDisplay(),
        signDisplay: this.#resolveSignDisplay(),
      };
    }

    return {
      style,
      signDisplay: this.#resolveSignDisplay(),
    };
  }

  #computeFormatted(): { valueAttr: string; text: string } | null {
    const value = this.value ?? "";
    const locale = this.lang;

    if (!value || value.trim() === "") return null;

    const amount = Number(value);
    if (isNaN(amount)) return null;

    const options = this.#resolveOptions(this.#resolveNumberStyle());
    if (!options) return null;

    try {
      return {
        valueAttr: String(amount),
        text: new Intl.NumberFormat(locale, options).format(amount),
      };
    } catch {
      return null;
    }
  }

  render() {
    const result = this.#computeFormatted();
    if (!result) return html`<data></data>`;
    return html`<data value=${result.valueAttr}>${result.text}</data>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-intl-number": UseIntlNumber;
  }
}

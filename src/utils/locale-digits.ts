import { numberFormat } from "./intl-formatters";

const LATIN_DIGITS = "0123456789";

const digitsByLocale = new Map<string, string[] | undefined>();

/** The locale's digits for 0 through 9, or `undefined` when it already writes Latin digits. */
export function resolveLocaleDigits(locale: string) {
  if (!digitsByLocale.has(locale)) {
    const formatter = numberFormat(locale, { useGrouping: false });
    digitsByLocale.set(
      locale,
      formatter.resolvedOptions().numberingSystem === "latn"
        ? undefined
        : Array.from(LATIN_DIGITS, (digit) => formatter.format(Number(digit))),
    );
  }
  return digitsByLocale.get(locale);
}

/** Writes the Latin digits of a value with the given digits, or as is when there are none. */
export function toLocaleDigits(digits: string[] | undefined, value: string | number | undefined) {
  if (value === undefined) {
    return "";
  }
  if (!digits) {
    return String(value);
  }
  return Array.from(String(value))
    .filter((character) => LATIN_DIGITS.includes(character))
    .map((character) => digits[Number(character)])
    .join("");
}

const FULLWIDTH_ZERO = 0xff10;

function latinDigit(digits: string[] | undefined, character: string) {
  if (LATIN_DIGITS.includes(character)) {
    return character;
  }
  const fullwidthOffset = character.charCodeAt(0) - FULLWIDTH_ZERO;
  if (character.length === 1 && fullwidthOffset >= 0 && fullwidthOffset <= 9) {
    return String(fullwidthOffset);
  }
  const index = digits ? digits.indexOf(character) : -1;
  return index === -1 ? undefined : String(index);
}

/**
 * Reads the given digits, full-width digits, or Latin digits as Latin digits, dropping any other
 * characters.
 */
export function toLatinDigits(digits: string[] | undefined, text: string) {
  return Array.from(text)
    .map((character) => latinDigit(digits, character) ?? "")
    .join("");
}


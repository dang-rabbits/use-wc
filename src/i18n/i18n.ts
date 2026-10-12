import type { UseWcStrings } from "./catalog";
import { notifyStringsChange, setStringResolver, type StringTemplate } from "../utils/strings";

export type { UseWcStrings } from "./catalog";
export type { PluralTemplate, StringTemplate } from "../utils/strings";

export interface LocalizationOptions {
  /** CSS selector for elements whose text is JSON keyed by locale, such as a `<script type="application/json">`. Every match is read and merged. */
  selector?: string;
  /** Translations keyed by locale tag. */
  locales?: Record<string, UseWcStrings>;
}

type LocaleTables = Map<string, Record<string, Record<string, StringTemplate>>>;

const LOCALE_TABLES = Symbol.for("use-wc.locale-tables");
const tables: LocaleTables = ((globalThis as { [LOCALE_TABLES]?: LocaleTables })[LOCALE_TABLES] ??=
  new Map());
const fallbackChains = new Map<string, string[]>();

function canonicalLocale(locale: string) {
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? locale;
  } catch {
    return locale;
  }
}

function fallbackChain(locale: string) {
  let chain = fallbackChains.get(locale);
  if (!chain) {
    const subtags = canonicalLocale(locale).split("-");
    chain = subtags.map((_, index) => subtags.slice(0, subtags.length - index).join("-"));
    fallbackChains.set(locale, chain);
  }
  return chain;
}

function addLocale(locale: string, strings: UseWcStrings) {
  const canonical = canonicalLocale(locale);
  const table = tables.get(canonical) ?? {};
  for (const [component, values] of Object.entries(strings)) {
    table[component] = { ...table[component], ...values };
  }
  tables.set(canonical, table);
}

function readBlocks(selector: string) {
  for (const element of document.querySelectorAll(selector)) {
    try {
      const locales: Record<string, UseWcStrings> = JSON.parse(element.textContent ?? "{}");
      for (const [locale, strings] of Object.entries(locales ?? {})) {
        addLocale(locale, strings);
      }
    } catch (error) {
      console.warn(`use-wc: skipped locale strings in "${selector}" that aren't valid JSON.`, {
        element,
        error,
      });
    }
  }
}

function lookupString(locale: string, component: string, key: string) {
  for (const candidate of fallbackChain(locale)) {
    const template = tables.get(candidate)?.[component]?.[key];
    if (template !== undefined) {
      return template;
    }
  }
  return undefined;
}

/**
 * Registers translated strings for `use-wc` elements and re-renders any already on the page. Reads
 * the JSON blocks matched by `selector`, then `locales`; registering a locale again merges over its
 * earlier strings. Each element uses the strings for its own `lang`, and a locale falls back one
 * subtag at a time key by key, so `zh-Hant-TW` tries `zh-Hant` and then `zh`.
 */
export function registerLocales({ selector, locales = {} }: LocalizationOptions = {}) {
  if (selector) {
    readBlocks(selector);
  }
  for (const [locale, strings] of Object.entries(locales)) {
    addLocale(locale, strings);
  }
  setStringResolver(lookupString);
  notifyStringsChange();
}

/** Removes every registered locale, so elements fall back to `Intl` labels and English defaults. */
export function clearLocales() {
  tables.clear();
  setStringResolver(undefined);
  notifyStringsChange();
}

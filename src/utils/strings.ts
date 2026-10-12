import { numberFormat, pluralRules } from "./intl-formatters";
export type PluralTemplate = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export type StringTemplate = string | PluralTemplate;
export type StringDefaults = Record<string, StringTemplate>;
export type StringOverrides = Partial<Record<string, StringTemplate>>;
export type StringParameterValue = string | number;

export type StringResolver = (
  locale: string,
  component: string,
  key: string,
) => StringTemplate | undefined;

export interface StringsHost {
  readonly locale: string;
  strings?: StringOverrides;
}

export interface StringSource {
  readonly component: string;
  readonly defaults: StringDefaults;
  intl?(locale: string): Partial<Record<string, string>>;
}

export const STRING_RESOLVER = Symbol.for("use-wc.string-resolver");
export const STRINGS_CHANGE_EVENT = "use-wc-strings-change";

const templatesByComponentLocale = new Map<string, Map<string, StringTemplate>>();
function withEnglishFallback<Formatter>(locale: string, create: (locale: string) => Formatter) {
  try {
    return create(locale);
  } catch {
    return create("en");
  }
}

export function formatString(
  template: StringTemplate,
  parameters: Record<string, StringParameterValue> = {},
  locale = "en",
): string {
  const text =
    typeof template === "string"
      ? template
      : (template[withEnglishFallback(locale, pluralRules).select(Number(parameters.count))] ??
        template.other);

  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    if (!(name in parameters)) {
      return placeholder;
    }
    const value = parameters[name];
    return typeof value === "number"
      ? withEnglishFallback(locale, numberFormat).format(value)
      : value;
  });
}

export function getStringResolver(): StringResolver | undefined {
  return (globalThis as { [STRING_RESOLVER]?: StringResolver })[STRING_RESOLVER];
}

export function setStringResolver(resolver: StringResolver | undefined) {
  (globalThis as { [STRING_RESOLVER]?: StringResolver })[STRING_RESOLVER] = resolver;
  clearStringCache();
}

export function clearStringCache() {
  templatesByComponentLocale.clear();
}

function cachedTemplate(source: StringSource, locale: string, key: string) {
  const cacheKey = `${source.component} ${locale}`;
  let templates = templatesByComponentLocale.get(cacheKey);
  if (!templates) {
    templates = new Map();
    templatesByComponentLocale.set(cacheKey, templates);
  }
  let template = templates.get(key);
  if (template === undefined) {
    template =
      getStringResolver()?.(locale, source.component, key) ??
      source.intl?.(locale)[key] ??
      source.defaults[key];
    templates.set(key, template);
  }
  return template;
}

/**
 * Resolves one string for an element: its `strings` overrides, then the registered resolver for
 * its `locale`, then the `Intl`-derived label, then the English default. Everything after the
 * element's own overrides is cached per component and locale and shared by every instance.
 */
export function resolveString(
  element: StringsHost,
  source: StringSource,
  key: string,
  parameters?: Record<string, StringParameterValue>,
): string {
  const locale = element.locale;
  const template = element.strings?.[key] ?? cachedTemplate(source, locale, key);
  return formatString(template, parameters, locale);
}

export function notifyStringsChange() {
  clearStringCache();
  if (typeof document !== "undefined") {
    document.dispatchEvent(new Event(STRINGS_CHANGE_EVENT));
  }
}

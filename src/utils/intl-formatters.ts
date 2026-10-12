type FormatterConstructor<Options, Formatter> = new (locale: string, options: Options) => Formatter;

export type DurationUnit =
  | "years"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

export interface DurationFormatOptions {
  style?: "long" | "short" | "narrow" | "digital";
}

export interface DurationFormatPart {
  type: string;
  value: string;
  unit?: string;
}

export interface DurationFormat {
  format(duration: Partial<Record<DurationUnit, number>>): string;
  formatToParts(duration: Partial<Record<DurationUnit, number>>): DurationFormatPart[];
}

const DurationFormatConstructor = (
  Intl as unknown as {
    DurationFormat: FormatterConstructor<DurationFormatOptions | undefined, DurationFormat>;
  }
).DurationFormat;

const formattersByConstructor = new Map<unknown, Map<string, unknown>>();

function cachedFormatter<Options, Formatter>(
  Constructor: FormatterConstructor<Options, Formatter>,
  locale: string,
  options: Options,
): Formatter {
  let formatters = formattersByConstructor.get(Constructor) as Map<string, Formatter> | undefined;
  if (!formatters) {
    formatters = new Map();
    formattersByConstructor.set(Constructor, formatters);
  }
  const cacheKey = `${locale} ${JSON.stringify(options ?? {})}`;
  let formatter = formatters.get(cacheKey);
  if (!formatter) {
    formatter = new Constructor(locale, options);
    formatters.set(cacheKey, formatter);
  }
  return formatter;
}

/** A shared `Intl.DateTimeFormat` for this locale and options, created once. */
export function dateTimeFormat(locale: string, options?: Intl.DateTimeFormatOptions) {
  return cachedFormatter(Intl.DateTimeFormat, locale, options);
}

/** A shared `Intl.NumberFormat` for this locale and options, created once. */
export function numberFormat(locale: string, options?: Intl.NumberFormatOptions) {
  return cachedFormatter(Intl.NumberFormat, locale, options);
}

/** A shared `Intl.PluralRules` for this locale and options, created once. */
export function pluralRules(locale: string, options?: Intl.PluralRulesOptions) {
  return cachedFormatter(Intl.PluralRules, locale, options);
}

/** A shared `Intl.RelativeTimeFormat` for this locale and options, created once. */
export function relativeTimeFormat(locale: string, options?: Intl.RelativeTimeFormatOptions) {
  return cachedFormatter(Intl.RelativeTimeFormat, locale, options);
}

/** A shared `Intl.DisplayNames` for this locale and options, created once. */
export function displayNames(locale: string, options: Intl.DisplayNamesOptions) {
  return cachedFormatter(Intl.DisplayNames, locale, options);
}

/** A shared `Intl.DurationFormat` for this locale and options, created once. */
export function durationFormat(locale: string, options?: DurationFormatOptions) {
  return cachedFormatter(DurationFormatConstructor, locale, options);
}

/** A shared `Intl.Locale` for this tag, created once. */
export function localeInfo(locale: string) {
  return cachedFormatter(Intl.Locale, locale, undefined);
}

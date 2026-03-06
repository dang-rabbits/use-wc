type DurationPart = { type: string; value: string; unit?: string };

export const DEFAULT_ARIA_LABELS = {
  am: 'AM' as string,
  pm: 'PM' as string,
  year: 'year' as string,
  month: 'month' as string,
  day: 'day' as string,
  hour: 'hour' as string,
  minute: 'minute' as string,
  second: 'second' as string,
  millisecond: 'millisecond' as string,
  dayPeriod: 'dayPeriod' as string,
} as const;

export type DateTimeAriaLabelKeys = keyof typeof DEFAULT_ARIA_LABELS;
export type DateTimeAriaLabels = Record<DateTimeAriaLabelKeys, string>;

const INTL_ARIA_LABELS = new Map<string, DateTimeAriaLabels>();

export default function getDateTimeAriaLabels(locale: string, { plural = true }: { plural?: boolean } = {}) {
  const cacheKey = `${locale}-${plural ? 'plural' : 'singular'}`;

  if (!INTL_ARIA_LABELS.has(cacheKey)) {
    const displayNameFormatter = new Intl.DisplayNames(locale, { type: 'dateTimeField' });
    const dayPeriod = displayNameFormatter.of('dayPeriod') ?? 'AM/PM';
    const [am = 'AM', pm = 'PM'] = dayPeriod?.split('/') ?? [];

    // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/60608
    const parts = new Intl.DurationFormat(locale, { style: 'long' })
      .formatToParts({
        years: plural ? 2 : 1,
        months: plural ? 2 : 1,
        weeks: plural ? 2 : 1,
        days: plural ? 2 : 1,
        hours: plural ? 2 : 1,
        minutes: plural ? 2 : 1,
        seconds: plural ? 2 : 1,
        milliseconds: plural ? 2 : 1,
      })
      .filter((part: DurationPart) => part.type === 'unit' && part.unit);

    const year = parts.find((part: DurationPart) => part.unit === 'year')?.value ?? 'year';
    const month = parts.find((part: DurationPart) => part.unit === 'month')?.value ?? 'month';
    const day = parts.find((part: DurationPart) => part.unit === 'day')?.value ?? 'day';
    const hour = parts.find((part: DurationPart) => part.unit === 'hour')?.value ?? 'hour';
    const minute = parts.find((part: DurationPart) => part.unit === 'minute')?.value ?? 'minute';
    const second = parts.find((part: DurationPart) => part.unit === 'second')?.value ?? 'second';
    const millisecond = parts.find((part: DurationPart) => part.unit === 'millisecond')?.value ?? 'millisecond';

    INTL_ARIA_LABELS.set(cacheKey, { am, pm, hour, minute, second, millisecond, dayPeriod, year, month, day });
  }

  return INTL_ARIA_LABELS.get(cacheKey)!;
}

export function getLocaleFirstDay(locale = 'en'): number {
  const localeInfo = new Intl.Locale(locale);
  // @ts-expect-error - getWeekInfo is not typed
  return localeInfo.getWeekInfo().firstDay % 7; // 0=Sun, 1=Mon … 6=Sat
}

const DAY_NAMES = new Map<string, string[]>();
export function getDayNames(locale = 'en', format: 'long' | 'short' | 'narrow' = 'long') {
  const cacheKey = `${locale}-${format}`;

  if (!DAY_NAMES.has(cacheKey)) {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
    const days = [7, 8, 9, 10, 11, 12, 13].map((day) => formatter.format(new Date(2024, 0, day)));
    const firstDayOfWeek = getLocaleFirstDay(locale);
    DAY_NAMES.set(cacheKey, days.slice(firstDayOfWeek).concat(days.slice(0, firstDayOfWeek)));
  }

  return DAY_NAMES.get(cacheKey)!;
}

const MONTH_NAMES = new Map<string, string[]>();
export function getMonthNames(locale = 'en', format: 'long' | 'short' | 'narrow' = 'long') {
  const cacheKey = `${locale}-${format}`;
  if (!MONTH_NAMES.has(cacheKey)) {
    const formatter = new Intl.DateTimeFormat(locale, { month: format });
    MONTH_NAMES.set(
      cacheKey,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => formatter.format(new Date(2024, month - 1, 1)))
    );
  }
  return MONTH_NAMES.get(cacheKey)!;
}

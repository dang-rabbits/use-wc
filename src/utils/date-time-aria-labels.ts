import { dateTimeFormat, displayNames, durationFormat, localeInfo } from "./intl-formatters";

export type DateTimeAriaLabelKeys =
  | "am"
  | "pm"
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "dayPeriod";
export type DateTimeAriaLabels = Record<DateTimeAriaLabelKeys, string>;

const INTL_ARIA_LABELS = new Map<string, Partial<DateTimeAriaLabels>>();

function getDayPeriodNames(locale: string) {
  const formatter = dateTimeFormat(locale, {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  });
  const dayPeriodAt = (hour: number) =>
    formatter
      .formatToParts(new Date(Date.UTC(2024, 0, 1, hour)))
      .find((part) => part.type === "dayPeriod")?.value;
  return { am: dayPeriodAt(9), pm: dayPeriodAt(21) };
}

export default function getDateTimeAriaLabels(
  locale: string,
  { plural = true }: { plural?: boolean } = {},
): Partial<DateTimeAriaLabels> {
  const cacheKey = `${locale}-${plural ? "plural" : "singular"}`;

  if (!INTL_ARIA_LABELS.has(cacheKey)) {
    const displayNameFormatter = displayNames(locale, { type: "dateTimeField" });
    const unitCount = plural ? 2 : 1;

    const parts = durationFormat(locale, { style: "long" })
      .formatToParts({
        years: unitCount,
        months: unitCount,
        weeks: unitCount,
        days: unitCount,
        hours: unitCount,
        minutes: unitCount,
        seconds: unitCount,
        milliseconds: unitCount,
      })
      .filter((part) => part.type === "unit" && part.unit);

    const unitLabel = (unit: string) => parts.find((part) => part.unit === unit)?.value;

    INTL_ARIA_LABELS.set(
      cacheKey,
      Object.fromEntries(
        Object.entries({
          ...getDayPeriodNames(locale),
          dayPeriod: displayNameFormatter.of("dayPeriod"),
          year: unitLabel("year"),
          month: unitLabel("month"),
          day: unitLabel("day"),
          hour: unitLabel("hour"),
          minute: unitLabel("minute"),
          second: unitLabel("second"),
          millisecond: unitLabel("millisecond"),
        }).filter(([, value]) => value),
      ),
    );
  }

  return INTL_ARIA_LABELS.get(cacheKey)!;
}

export function getLocaleFirstDay(locale = "en"): number {
  // @ts-expect-error - getWeekInfo is not typed
  return localeInfo(locale).getWeekInfo().firstDay % 7; // 0=Sun, 1=Mon … 6=Sat
}

const DAY_NAMES = new Map<string, string[]>();
export function getDayNames(locale = "en", format: "long" | "short" | "narrow" = "long") {
  const cacheKey = `${locale}-${format}`;

  if (!DAY_NAMES.has(cacheKey)) {
    const formatter = dateTimeFormat(locale, { weekday: format });
    const days = [7, 8, 9, 10, 11, 12, 13].map((day) => formatter.format(new Date(2024, 0, day)));
    const firstDayOfWeek = getLocaleFirstDay(locale);
    DAY_NAMES.set(cacheKey, days.slice(firstDayOfWeek).concat(days.slice(0, firstDayOfWeek)));
  }

  return DAY_NAMES.get(cacheKey)!;
}

const MONTH_NAMES = new Map<string, string[]>();
export function getMonthNames(locale = "en", format: "long" | "short" | "narrow" = "long") {
  const cacheKey = `${locale}-${format}`;
  if (!MONTH_NAMES.has(cacheKey)) {
    const formatter = dateTimeFormat(locale, { month: format });
    MONTH_NAMES.set(
      cacheKey,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) =>
        formatter.format(new Date(2024, month - 1, 1)),
      ),
    );
  }
  return MONTH_NAMES.get(cacheKey)!;
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

export function formatISOWeek(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeekNumber(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function parseISOWeek(week: string): Date {
  const [yearStr, weekStr] = week.split("-W");
  const year = Number(yearStr);
  const weekNum = Number(weekStr);
  const jan4 = new Date(year, 0, 4);
  const jan4DayOfWeek = jan4.getDay() || 7;
  const week1Monday = new Date(year, 0, 4 - (jan4DayOfWeek - 1));
  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (weekNum - 1) * 7);
  return monday;
}

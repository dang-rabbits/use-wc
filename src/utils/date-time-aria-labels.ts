type DurationPart = { type: string; value: string; unit?: string };

export const DEFAULT_ARIA_LABELS = {
  am: 'AM' as string,
  pm: 'PM' as string,
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

    const hour = parts.find((part: DurationPart) => part.unit === 'hour')?.value ?? 'hour';
    const minute = parts.find((part: DurationPart) => part.unit === 'minute')?.value ?? 'minute';
    const second = parts.find((part: DurationPart) => part.unit === 'second')?.value ?? 'second';
    const millisecond = parts.find((part: DurationPart) => part.unit === 'millisecond')?.value ?? 'millisecond';

    INTL_ARIA_LABELS.set(cacheKey, { am, pm, hour, minute, second, millisecond, dayPeriod });
  }

  return INTL_ARIA_LABELS.get(cacheKey)!;
}

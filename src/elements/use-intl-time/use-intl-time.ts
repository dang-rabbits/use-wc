import * as duration from "duration-fns";

const TYPE_ATTRS = ["date", "time", "datetime", "duration", "relative"] as const;
type TypeAttr = (typeof TYPE_ATTRS)[number];

type DateTimeStyle = "short" | "medium" | "long" | "full";
type DurationStyle = "short" | "long" | "narrow" | "digital";
type RelativeStyle = "short" | "long" | "narrow";

const DATE_TIME_STYLES: DateTimeStyle[] = ["short", "medium", "long", "full"];
const DURATION_STYLES: DurationStyle[] = ["short", "long", "narrow", "digital"];
const RELATIVE_STYLES: RelativeStyle[] = ["short", "long", "narrow"];

const TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;

const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
const MILLISECONDS_PER_MONTH = 30 * MILLISECONDS_PER_DAY;
const MILLISECONDS_PER_YEAR = 365 * MILLISECONDS_PER_DAY;

/**
 * Displays a localized, human-readable representation of a date, time, datetime,
 * duration, or relative time. Renders a semantic `<time>` element in its shadow root
 * with a machine-readable `datetime` attribute and formatted inner text.
 *
 * Use one of `date`, `time`, `datetime`, `duration`, or `relative` as the type
 * attribute. Its value is the format shorthand passed to the corresponding `Intl` API.
 *
 * @attr {string} value - ISO date/time string, Unix timestamp (ms), or ISO 8601 duration string
 * @attr {string} date - Format as a date. Shorthand: `short` | `medium` | `long` | `full`
 * @attr {string} time - Format as a time. Shorthand: `short` | `medium` | `long` | `full`
 * @attr {string} datetime - Format as a date and time. Shorthand: `short` | `medium` | `long` | `full`
 * @attr {string} duration - Format as a duration. Shorthand: `short` | `long` | `narrow` | `digital`
 * @attr {string} relative - Format as relative time. Shorthand: `short` | `long` | `narrow`
 * @attr {string} locale - BCP 47 locale tag. Defaults to `navigator.language`.
 */
export class UseIntlTime extends HTMLElement {
  static observedAttributes = [
    "value",
    "date",
    "time",
    "datetime",
    "duration",
    "relative",
    "locale",
  ];

  #timeElement: HTMLTimeElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    const styleElement = document.createElement("style");
    styleElement.textContent = ":host { display: contents; }";
    this.#timeElement = document.createElement("time");
    shadowRoot.append(styleElement, this.#timeElement);
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  #getActiveType(): TypeAttr | null {
    for (const typeAttr of TYPE_ATTRS) {
      if (this.hasAttribute(typeAttr)) return typeAttr;
    }
    return null;
  }

  #parseDate(value: string): Date | null {
    if (!value) return null;
    const asNumber = Number(value);
    if (!isNaN(asNumber) && value.trim() !== "") return new Date(asNumber);
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  #getBestRelativeUnit(differenceMs: number): { unit: Intl.RelativeTimeFormatUnit; value: number } {
    const absoluteMs = Math.abs(differenceMs);
    if (absoluteMs >= MILLISECONDS_PER_YEAR)
      return { unit: "year", value: Math.round(differenceMs / MILLISECONDS_PER_YEAR) };
    if (absoluteMs >= MILLISECONDS_PER_MONTH)
      return { unit: "month", value: Math.round(differenceMs / MILLISECONDS_PER_MONTH) };
    if (absoluteMs >= MILLISECONDS_PER_WEEK)
      return { unit: "week", value: Math.round(differenceMs / MILLISECONDS_PER_WEEK) };
    if (absoluteMs >= MILLISECONDS_PER_DAY)
      return { unit: "day", value: Math.round(differenceMs / MILLISECONDS_PER_DAY) };
    if (absoluteMs >= MILLISECONDS_PER_HOUR)
      return { unit: "hour", value: Math.round(differenceMs / MILLISECONDS_PER_HOUR) };
    if (absoluteMs >= MILLISECONDS_PER_MINUTE)
      return { unit: "minute", value: Math.round(differenceMs / MILLISECONDS_PER_MINUTE) };
    return { unit: "second", value: Math.round(differenceMs / MILLISECONDS_PER_SECOND) };
  }

  #render() {
    const value = this.getAttribute("value") ?? "";
    const locale = this.getAttribute("locale") ?? navigator.language;
    const activeType = this.#getActiveType();

    if (!value || !activeType) {
      this.#timeElement.removeAttribute("datetime");
      this.#timeElement.textContent = "";
      return;
    }

    const formatAttribute = this.getAttribute(activeType) ?? "";

    try {
      switch (activeType) {
        case "date": {
          const parsedDate = this.#parseDate(value);
          if (!parsedDate) return;
          const style = DATE_TIME_STYLES.includes(formatAttribute as DateTimeStyle)
            ? (formatAttribute as DateTimeStyle)
            : "medium";
          this.#timeElement.setAttribute("datetime", parsedDate.toISOString().split("T")[0]);
          this.#timeElement.textContent = new Intl.DateTimeFormat(locale, {
            dateStyle: style,
          }).format(parsedDate);
          break;
        }
        case "time": {
          const timeMatch = TIME_PATTERN.exec(value);
          let parsedDate: Date;
          let datetimeValue: string;

          if (timeMatch) {
            const hours = timeMatch[1];
            const minutes = timeMatch[2];
            const seconds = timeMatch[3] ?? "00";
            parsedDate = new Date();
            parsedDate.setHours(
              parseInt(hours, 10),
              parseInt(minutes, 10),
              parseInt(seconds, 10),
              0,
            );
            datetimeValue = `${hours}:${minutes}:${seconds}`;
          } else {
            const fromTimestamp = this.#parseDate(value);
            if (!fromTimestamp) return;
            parsedDate = fromTimestamp;
            const hours = String(parsedDate.getHours()).padStart(2, "0");
            const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
            const seconds = String(parsedDate.getSeconds()).padStart(2, "0");
            datetimeValue = `${hours}:${minutes}:${seconds}`;
          }

          const style = DATE_TIME_STYLES.includes(formatAttribute as DateTimeStyle)
            ? (formatAttribute as DateTimeStyle)
            : "medium";
          this.#timeElement.setAttribute("datetime", datetimeValue);
          this.#timeElement.textContent = new Intl.DateTimeFormat(locale, {
            timeStyle: style,
          }).format(parsedDate);
          break;
        }
        case "datetime": {
          const parsedDate = this.#parseDate(value);
          if (!parsedDate) return;
          const style = DATE_TIME_STYLES.includes(formatAttribute as DateTimeStyle)
            ? (formatAttribute as DateTimeStyle)
            : "medium";
          this.#timeElement.setAttribute("datetime", parsedDate.toISOString());
          this.#timeElement.textContent = new Intl.DateTimeFormat(locale, {
            dateStyle: style,
            timeStyle: style,
          }).format(parsedDate);
          break;
        }
        case "duration": {
          const parsedDuration = duration.parse(value);
          const style = DURATION_STYLES.includes(formatAttribute as DurationStyle)
            ? (formatAttribute as DurationStyle)
            : "short";
          // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/60608
          this.#timeElement.textContent = new Intl.DurationFormat(locale, { style }).format(
            parsedDuration,
          );
          this.#timeElement.setAttribute("datetime", value);
          break;
        }
        case "relative": {
          const parsedDate = this.#parseDate(value);
          if (!parsedDate) return;
          const style = RELATIVE_STYLES.includes(formatAttribute as RelativeStyle)
            ? (formatAttribute as RelativeStyle)
            : "long";
          const differenceMs = parsedDate.getTime() - Date.now();
          const { unit, value: relativeValue } = this.#getBestRelativeUnit(differenceMs);
          this.#timeElement.setAttribute("datetime", parsedDate.toISOString());
          this.#timeElement.textContent = new Intl.RelativeTimeFormat(locale, { style }).format(
            relativeValue,
            unit,
          );
          break;
        }
      }
    } catch {
      this.#timeElement.removeAttribute("datetime");
      this.#timeElement.textContent = "";
    }
  }
}

customElements.define("use-intl-time", UseIntlTime);

declare global {
  interface HTMLElementTagNameMap {
    "use-intl-time": UseIntlTime;
  }
}

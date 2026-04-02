import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UseLocaleElement } from "../use-locale-element/use-locale-element";

type DateTimeStyle = "short" | "medium" | "long" | "full";

const DATE_TIME_STYLES: DateTimeStyle[] = ["short", "medium", "long", "full"];

const TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;

/**
 * Displays a localized, human-readable representation of a date, time, or datetime.
 * Renders a semantic `<time>` element in its shadow root with a machine-readable
 * `datetime` attribute and formatted inner text.
 *
 * Set `datestyle`, `timestyle`, or both to control what is formatted and how.
 * The presence of each attribute determines the format mode:
 * - `datestyle` only → date formatting
 * - `timestyle` only → time formatting
 * - both → date and time formatting
 *
 * Locale is resolved from the nearest ancestor `[lang]` attribute, or
 * `navigator.language` if none is found. Set `lang` directly on the element to override.
 *
 * @attr {string} value - ISO date/time string or Unix timestamp (ms)
 * @attr {string} datestyle - Date format style: `short` | `medium` | `long` | `full`
 * @attr {string} timestyle - Time format style: `short` | `medium` | `long` | `full`
 * @attr {string} lang - BCP 47 locale tag. Inherits from nearest ancestor `[lang]` if not set.
 */
@customElement("use-intl-datetime")
export class UseIntlDatetime extends UseLocaleElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ type: String }) value?: string;
  @property({ type: String }) datestyle?: string;
  @property({ type: String }) timestyle?: string;

  #parseDate(value: string): Date | null {
    if (!value) return null;
    const asNumber = Number(value);
    if (!isNaN(asNumber) && value.trim() !== "") return new Date(asNumber);
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  #resolveDateStyle(): DateTimeStyle {
    return DATE_TIME_STYLES.includes(this.datestyle as DateTimeStyle)
      ? (this.datestyle as DateTimeStyle)
      : "medium";
  }

  #resolveTimeStyle(): DateTimeStyle {
    return DATE_TIME_STYLES.includes(this.timestyle as DateTimeStyle)
      ? (this.timestyle as DateTimeStyle)
      : "medium";
  }

  #computeFormatted(): { datetimeAttr: string; text: string } | null {
    const value = this.value ?? "";
    const locale = this.lang;
    const hasDateStyle = this.datestyle !== undefined;
    const hasTimeStyle = this.timestyle !== undefined;

    if (!value || (!hasDateStyle && !hasTimeStyle)) return null;

    try {
      if (hasDateStyle && !hasTimeStyle) {
        const parsedDate = this.#parseDate(value);
        if (!parsedDate) return null;
        return {
          datetimeAttr: parsedDate.toISOString().split("T")[0],
          text: new Intl.DateTimeFormat(locale, {
            dateStyle: this.#resolveDateStyle(),
          }).format(parsedDate),
        };
      }

      if (hasTimeStyle && !hasDateStyle) {
        const timeMatch = TIME_PATTERN.exec(value);
        let parsedDate: Date;
        let datetimeAttr: string;

        if (timeMatch) {
          const hours = timeMatch[1];
          const minutes = timeMatch[2];
          const seconds = timeMatch[3] ?? "00";
          parsedDate = new Date();
          parsedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10), 0);
          datetimeAttr = `${hours}:${minutes}:${seconds}`;
        } else {
          const fromTimestamp = this.#parseDate(value);
          if (!fromTimestamp) return null;
          parsedDate = fromTimestamp;
          const hours = String(parsedDate.getHours()).padStart(2, "0");
          const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
          const seconds = String(parsedDate.getSeconds()).padStart(2, "0");
          datetimeAttr = `${hours}:${minutes}:${seconds}`;
        }

        return {
          datetimeAttr,
          text: new Intl.DateTimeFormat(locale, {
            timeStyle: this.#resolveTimeStyle(),
          }).format(parsedDate),
        };
      }

      const parsedDate = this.#parseDate(value);
      if (!parsedDate) return null;
      return {
        datetimeAttr: parsedDate.toISOString(),
        text: new Intl.DateTimeFormat(locale, {
          dateStyle: this.#resolveDateStyle(),
          timeStyle: this.#resolveTimeStyle(),
        }).format(parsedDate),
      };
    } catch {
      return null;
    }
  }

  render() {
    const result = this.#computeFormatted();
    if (!result) return html`<time></time>`;
    return html`<time datetime=${result.datetimeAttr}>${result.text}</time>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-intl-datetime": UseIntlDatetime;
  }
}

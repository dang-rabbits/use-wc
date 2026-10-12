import { describe, expect, it } from "vite-plus/test";
import { dateTimeFormat, numberFormat, pluralRules, relativeTimeFormat } from "./intl-formatters";

describe("intl formatters", () => {
  it("returns the same formatter for the same locale and options", () => {
    expect(dateTimeFormat("fr", { month: "long" })).toBe(dateTimeFormat("fr", { month: "long" }));
    expect(numberFormat("de")).toBe(numberFormat("de"));
    expect(pluralRules("en")).toBe(pluralRules("en"));
    expect(relativeTimeFormat("ja", { numeric: "auto" })).toBe(
      relativeTimeFormat("ja", { numeric: "auto" }),
    );
  });

  it("returns a different formatter for a different locale or options", () => {
    expect(dateTimeFormat("fr", { month: "long" })).not.toBe(
      dateTimeFormat("de", { month: "long" }),
    );
    expect(dateTimeFormat("fr", { month: "long" })).not.toBe(
      dateTimeFormat("fr", { month: "short" }),
    );
  });

  it("formats with the requested locale and options", () => {
    expect(
      dateTimeFormat("fr", { month: "long", timeZone: "UTC" }).format(Date.UTC(2024, 0, 1)),
    ).toBe("janvier");
    expect(relativeTimeFormat("en", { numeric: "auto" }).format(0, "day")).toBe("today");
  });
});

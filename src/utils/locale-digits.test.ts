import { describe, expect, it } from "vite-plus/test";
import { resolveLocaleDigits, toLatinDigits, toLocaleDigits } from "./locale-digits";

describe("locale digits", () => {
  const arabicDigits = resolveLocaleDigits("ar-EG");

  it("resolves the digits of locales that don't use Latin digits", () => {
    expect(arabicDigits).toEqual(["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]);
    expect(resolveLocaleDigits("fa-IR")?.[5]).toBe("۵");
    expect(resolveLocaleDigits("en-US")).toBeUndefined();
    expect(resolveLocaleDigits("ar")).toBeUndefined();
  });

  it("returns the same digits for the same locale", () => {
    expect(resolveLocaleDigits("ar-EG")).toBe(arabicDigits);
  });

  it("writes values with the given digits", () => {
    expect(toLocaleDigits(arabicDigits, "2026")).toBe("٢٠٢٦");
    expect(toLocaleDigits(arabicDigits, 14)).toBe("١٤");
    expect(toLocaleDigits(undefined, "05")).toBe("05");
  });

  it("writes nothing for an undefined value", () => {
    expect(toLocaleDigits(undefined, undefined)).toBe("");
    expect(toLocaleDigits(arabicDigits, undefined)).toBe("");
  });

  it("reads the given digits and Latin digits as Latin digits", () => {
    expect(toLatinDigits(arabicDigits, "١٤")).toBe("14");
    expect(toLatinDigits(arabicDigits, "14")).toBe("14");
    expect(toLatinDigits(arabicDigits, "١4")).toBe("14");
  });

  it("drops characters that are not digits", () => {
    expect(toLatinDigits(undefined, "1e-4")).toBe("14");
    expect(toLatinDigits(arabicDigits, "a١b")).toBe("1");
  });
});

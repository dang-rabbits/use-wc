import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  STRING_RESOLVER,
  STRINGS_CHANGE_EVENT,
  formatString,
  getStringResolver,
  notifyStringsChange,
  resolveString,
  setStringResolver,
  type StringSource,
  type StringResolver,
} from "./strings";

describe("formatString", () => {
  it("substitutes placeholders", () => {
    expect(formatString("Select {label}", { label: "Alice" })).toBe("Select Alice");
  });

  it("substitutes every occurrence of a placeholder", () => {
    expect(formatString("{name} and {name}", { name: "Bob" })).toBe("Bob and Bob");
  });

  it("leaves placeholders without a parameter untouched", () => {
    expect(formatString("Select {label}")).toBe("Select {label}");
  });

  it("formats numeric parameters for the locale", () => {
    expect(formatString("Row {index}", { index: 1234 }, "en")).toBe("Row 1,234");
    expect(formatString("Ligne {index}", { index: 1234 }, "de")).toBe("Ligne 1.234");
  });

  it("selects the plural category for the count", () => {
    const template = { one: "{count} row selected", other: "{count} rows selected" };
    expect(formatString(template, { count: 1 }, "en")).toBe("1 row selected");
    expect(formatString(template, { count: 3 }, "en")).toBe("3 rows selected");
  });

  it("uses the locale's plural rules", () => {
    const template = { one: "{count} ligne", other: "{count} lignes" };
    expect(formatString(template, { count: 0 }, "fr")).toBe("0 ligne");
    expect(formatString(template, { count: 0 }, "en")).toBe("0 lignes");
  });

  it("falls back to the other category when a category is missing", () => {
    expect(formatString({ other: "{count} items" }, { count: 1 }, "en")).toBe("1 items");
  });

  it("falls back to English rules for an invalid locale", () => {
    expect(formatString({ one: "one", other: "many" }, { count: 1 }, "not a locale!")).toBe("one");
  });
});

describe("resolveString", () => {
  afterEach(() => {
    setStringResolver(undefined);
  });

  let intlCalls = 0;
  const testStrings: StringSource = {
    component: "use-test",
    defaults: {
      title: "Title",
      unit: "unit",
      greeting: "Hello {name}",
      selected: { one: "{count} selected item", other: "{count} selected items" },
    },
    intl: (locale) => {
      intlCalls += 1;
      return locale === "fr" ? { unit: "unité" } : {};
    },
  };

  it("resolves English defaults with parameters", () => {
    expect(resolveString({ locale: "en" }, testStrings, "greeting", { name: "Ana" })).toBe(
      "Hello Ana",
    );
    expect(resolveString({ locale: "en" }, testStrings, "selected", { count: 2 })).toBe(
      "2 selected items",
    );
  });

  it("prefers Intl-derived labels over English defaults", () => {
    expect(resolveString({ locale: "fr" }, testStrings, "unit")).toBe("unité");
    expect(resolveString({ locale: "en" }, testStrings, "unit")).toBe("unit");
  });

  it("follows instance, resolver, Intl, then default order", () => {
    setStringResolver((locale, component, key) =>
      locale === "fr" && component === "use-test" && key === "unit" ? "Unité" : undefined,
    );
    expect(resolveString({ locale: "fr", strings: { unit: "U" } }, testStrings, "unit")).toBe("U");
    expect(resolveString({ locale: "fr" }, testStrings, "unit")).toBe("Unité");
    expect(resolveString({ locale: "fr" }, testStrings, "title")).toBe("Title");
  });

  it("shares resolved templates across elements with the same locale", () => {
    let resolverCalls = 0;
    setStringResolver(() => {
      resolverCalls += 1;
      return undefined;
    });
    intlCalls = 0;
    resolveString({ locale: "de" }, testStrings, "unit");
    resolveString({ locale: "de" }, testStrings, "unit");
    resolveString({ locale: "de", strings: { title: "Titel" } }, testStrings, "unit");
    expect(resolverCalls).toBe(1);
    expect(intlCalls).toBe(1);
  });

  it("clears cached templates when strings change", () => {
    expect(resolveString({ locale: "es" }, testStrings, "title")).toBe("Title");
    setStringResolver(() => "Título");
    expect(resolveString({ locale: "es" }, testStrings, "title")).toBe("Título");
    const resolver = getStringResolver();
    (globalThis as Record<symbol, unknown>)[STRING_RESOLVER] = () => "Encabezado";
    expect(resolveString({ locale: "es" }, testStrings, "title")).toBe("Título");
    notifyStringsChange();
    expect(resolveString({ locale: "es" }, testStrings, "title")).toBe("Encabezado");
    setStringResolver(resolver);
  });

  it("never caches instance overrides", () => {
    expect(
      resolveString({ locale: "it", strings: { title: "Titolo" } }, testStrings, "title"),
    ).toBe("Titolo");
    expect(resolveString({ locale: "it" }, testStrings, "title")).toBe("Title");
  });

  it("stores the resolver under a global symbol shared across module copies", () => {
    const resolver: StringResolver = () => undefined;
    setStringResolver(resolver);
    expect((globalThis as Record<symbol, unknown>)[Symbol.for("use-wc.string-resolver")]).toBe(
      resolver,
    );
    expect(STRING_RESOLVER).toBe(Symbol.for("use-wc.string-resolver"));
    expect(getStringResolver()).toBe(resolver);
  });
});

describe("notifyStringsChange", () => {
  it("dispatches the strings change event on document", () => {
    let events = 0;
    const listener = () => {
      events += 1;
    };
    document.addEventListener(STRINGS_CHANGE_EVENT, listener);
    notifyStringsChange();
    document.removeEventListener(STRINGS_CHANGE_EVENT, listener);
    expect(events).toBe(1);
  });
});

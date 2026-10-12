import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { html, render as renderTemplate } from "lit";
import { registerLocales, clearLocales, type UseWcStrings } from "./i18n";
import gridRowDefaults from "../elements/use-grid/use-grid.strings.json";
import dateInputDefaults from "../elements/use-date-input/use-date-input.strings.json";
import getDateTimeAriaLabels from "../utils/date-time-aria-labels";
import { resolveString, STRINGS_CHANGE_EVENT, type StringSource } from "../utils/strings";

const gridRowStrings: StringSource = { component: "use-grid", defaults: gridRowDefaults };
const dateInputStrings: StringSource = {
  component: "use-date-input",
  defaults: dateInputDefaults,
  intl: (locale) => getDateTimeAriaLabels(locale, { plural: false }),
};

const french: UseWcStrings = {
  "use-grid": {
    selectAllRows: "Tout sélectionner",
    selectRow: "Sélectionner {label}",
  },
};

function selectAll(locale: string) {
  return resolveString({ locale }, gridRowStrings, "selectAllRows");
}

function addServerBlock(tablesByLocale: Record<string, UseWcStrings>) {
  const script = document.createElement("script");
  script.type = "application/json";
  script.className = "test-locales";
  script.textContent = JSON.stringify(tablesByLocale);
  document.body.append(script);
  return script;
}

function nextStringsChange() {
  return new Promise<void>((resolve) =>
    document.addEventListener(STRINGS_CHANGE_EVENT, () => resolve(), { once: true }),
  );
}

const originalLang = document.documentElement.getAttribute("lang");

afterEach(() => {
  clearLocales();
  document.querySelectorAll("script.test-locales").forEach((script) => script.remove());
  if (originalLang === null) {
    document.documentElement.removeAttribute("lang");
  } else {
    document.documentElement.setAttribute("lang", originalLang);
  }
});

describe("registerLocales", () => {
  it("resolves registered locales synchronously", () => {
    registerLocales({ locales: { fr: french } });
    expect(selectAll("fr")).toBe("Tout sélectionner");
    expect(resolveString({ locale: "fr" }, gridRowStrings, "selectRow", { label: "Alice" })).toBe(
      "Sélectionner Alice",
    );
    expect(selectAll("en")).toBe("Select all rows");
  });

  it("falls back from a regional locale to its base language", () => {
    registerLocales({
      locales: {
        fr: french,
        "fr-CA": { "use-grid": { selectRow: "Choisir {label}" } },
      },
    });
    expect(resolveString({ locale: "fr-CA" }, gridRowStrings, "selectRow", { label: "A" })).toBe(
      "Choisir A",
    );
    expect(selectAll("fr-CA")).toBe("Tout sélectionner");
  });

  it("falls back one subtag at a time", () => {
    registerLocales({
      locales: {
        zh: { "use-grid": { selectAllRows: "全选", selectRow: "选择{label}" } },
        "zh-Hant": { "use-grid": { selectAllRows: "全選" } },
      },
    });
    expect(selectAll("zh-Hant-TW")).toBe("全選");
    expect(
      resolveString({ locale: "zh-Hant-TW" }, gridRowStrings, "selectRow", { label: "A" }),
    ).toBe("选择A");
  });

  it("matches locale tags case-insensitively", () => {
    registerLocales({
      locales: { "pt-br": { "use-grid": { selectAllRows: "Selecionar tudo" } } },
    });
    expect(selectAll("pt-BR")).toBe("Selecionar tudo");
  });

  it("merges later registrations over earlier ones", () => {
    registerLocales({ locales: { fr: french } });
    registerLocales({ locales: { fr: { "use-grid": { selectAllRows: "Tout cocher" } } } });
    expect(selectAll("fr")).toBe("Tout cocher");
    expect(resolveString({ locale: "fr" }, gridRowStrings, "selectRow", { label: "A" })).toBe(
      "Sélectionner A",
    );
  });

  it("notifies elements when strings change", async () => {
    const changed = nextStringsChange();
    registerLocales({ locales: { fr: french } });
    await expect(changed).resolves.toBeUndefined();
  });

  it("falls through to Intl labels and English defaults for missing keys", () => {
    registerLocales({ locales: { fr: french } });
    expect(resolveString({ locale: "fr" }, gridRowStrings, "selectRowNumber", { index: 2 })).toBe(
      "Select row 2",
    );
    expect(resolveString({ locale: "fr" }, dateInputStrings, "month")).toBe("mois");
  });
});

describe("multiple copies of the library", () => {
  it("shares registered locales between copies", async () => {
    const secondCopyPath = "./i18n.ts?second-copy";
    const secondCopy: typeof import("./i18n") = await import(/* @vite-ignore */ secondCopyPath);
    expect(secondCopy.registerLocales).not.toBe(registerLocales);

    registerLocales({ locales: { fr: french } });
    secondCopy.registerLocales({
      locales: { de: { "use-grid": { selectAllRows: "Alle auswählen" } } },
    });

    expect(selectAll("fr")).toBe("Tout sélectionner");
    expect(selectAll("de")).toBe("Alle auswählen");
  });
});

describe("server-provided strings", () => {
  it("reads every locale from a single JSON block", () => {
    addServerBlock({
      de: { "use-grid": { selectAllRows: "Alle auswählen" } },
      fr: french,
    });
    registerLocales({ selector: "script.test-locales" });
    expect(selectAll("de")).toBe("Alle auswählen");
    expect(selectAll("fr")).toBe("Tout sélectionner");
  });

  it("merges locales across blocks", () => {
    addServerBlock({ fr: { "use-grid": { selectAllRows: "Tout sélectionner" } } });
    addServerBlock({ fr: { "use-grid": { selectRow: "Choisir {label}" } } });
    registerLocales({ selector: "script.test-locales" });
    expect(selectAll("fr")).toBe("Tout sélectionner");
    expect(resolveString({ locale: "fr" }, gridRowStrings, "selectRow", { label: "A" })).toBe(
      "Choisir A",
    );
  });

  it("merges locales passed alongside blocks over the blocks", () => {
    addServerBlock({ fr: { "use-grid": { selectAllRows: "Depuis le serveur" } } });
    registerLocales({ selector: "script.test-locales", locales: { fr: french } });
    expect(selectAll("fr")).toBe("Tout sélectionner");
  });

  it("warns and skips a block that isn't valid JSON", () => {
    const invalid = addServerBlock({});
    invalid.textContent = "{ fr: ";
    addServerBlock({ fr: french });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerLocales({ selector: "script.test-locales" });
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("script.test-locales");
    expect(selectAll("fr")).toBe("Tout sélectionner");
    warn.mockRestore();
  });

  it("ignores blocks when no selector is given", () => {
    addServerBlock({ de: { "use-grid": { selectAllRows: "Alle auswählen" } } });
    registerLocales();
    expect(selectAll("de")).toBe("Select all rows");
  });

  it("ignores malformed blocks", () => {
    const script = addServerBlock({});
    script.textContent = "{ not json";
    registerLocales({ selector: "script.test-locales" });
    expect(selectAll("de")).toBe("Select all rows");
  });
});

describe("loading before the library", () => {
  it("never renders English labels when the library import waits on registerLocales", async () => {
    const { default: strings } = await Promise.resolve({ default: french });
    registerLocales({ locales: { fr: strings } });
    const container = document.createElement("div");
    document.body.append(container);
    const labels: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const target = record.target as Element;
        if (record.attributeName === "aria-label" && target.getAttribute("aria-label")) {
          labels.push(target.getAttribute("aria-label")!);
        }
      }
    });
    observer.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });

    await import("../elements/use-grid");
    renderTemplate(
      html`<use-grid lang="fr" selectmode="multiple" selectwith="control">
        <use-gridhead
          ><use-gridrow><use-gridcell>Nom</use-gridcell></use-gridrow></use-gridhead
        >
        <use-gridbody
          ><use-gridrow><use-gridcell>Alice</use-gridcell></use-gridrow></use-gridbody
        >
      </use-grid>`,
      container,
    );
    const rows = Array.from(container.querySelectorAll("use-grid"));
    await Promise.all(
      rows.map((row) => (row as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete),
    );
    await new Promise((resolve) => setTimeout(resolve));
    observer.takeRecords();
    observer.disconnect();
    container.remove();

    expect(labels).toContain("Tout sélectionner");
    expect(labels).toContain("Sélectionner Alice");
    expect(labels.filter((label) => label.startsWith("Select "))).toEqual([]);
  });
});

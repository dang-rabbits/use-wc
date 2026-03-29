const localeChangeSubscribers = new Set<() => void>();

let observer: MutationObserver | undefined;

function getOrCreateObserver(): MutationObserver {
  if (!observer) {
    observer = new MutationObserver(() => {
      for (const subscriber of localeChangeSubscribers) {
        subscriber();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  }
  return observer;
}

export function subscribeToLocaleChanges(callback: () => void): () => void {
  getOrCreateObserver();
  localeChangeSubscribers.add(callback);
  return () => {
    localeChangeSubscribers.delete(callback);
  };
}

export function resolveLocale(element: Element): string {
  const ancestor = element.closest("[lang]");
  if (ancestor instanceof HTMLElement) {
    return ancestor.lang;
  }
  return navigator.language || "en-US";
}

import { LitElement } from "lit";
import { resolveLocale, subscribeToLocaleChanges } from "../../utils/locale";
import {
  resolveString,
  STRINGS_CHANGE_EVENT,
  type StringDefaults,
  type StringOverrides,
  type StringParameterValue,
  type StringTemplate,
} from "../../utils/strings";

const ALWAYS_CHANGED = { hasChanged: () => true };

export class UseLocaleElement extends LitElement {
  static get observedAttributes() {
    return [...super.observedAttributes, "lang"];
  }

  private _unsubscribeLocale: (() => void) | undefined;

  private _handleStringsChange = () => {
    this.requestUpdate("strings", undefined, ALWAYS_CHANGED);
  };

  /**
   * The locale this element renders in: its own `lang`, then its locale root's, then `<html lang>`, then
   * the browser's language.
   */
  get locale(): string {
    return this.lang || resolveLocale(this.localeOwner);
  }

  /** The element whose `lang` this one follows when it has none of its own, such as a row's grid. */
  protected get localeOwner(): HTMLElement {
    return this;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "lang") {
      this.requestUpdate("locale", undefined, ALWAYS_CHANGED);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribeLocale = subscribeToLocaleChanges(() => {
      if (!this.lang) {
        this.requestUpdate("locale", undefined, ALWAYS_CHANGED);
      }
    });
    document.addEventListener(STRINGS_CHANGE_EVENT, this._handleStringsChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = undefined;
    document.removeEventListener(STRINGS_CHANGE_EVENT, this._handleStringsChange);
  }
}

type Constructor<Instance> = new (...args: any[]) => Instance;

export declare class LocalizedElementInterface<Defaults extends StringDefaults> {
  strings: Partial<Record<keyof Defaults, StringTemplate>> | undefined;
  protected string(
    key: keyof Defaults & string,
    parameters?: Record<string, StringParameterValue>,
  ): string;
  protected intlStrings(): Partial<Record<keyof Defaults, string>>;
}

/**
 * Adds string resolution to a `UseLocaleElement` subclass. `defaults` holds the English strings.
 * Translations registered by the localization add-on are keyed by the element's tag, or by
 * `localeRoot` when the element is part of another component, such as `use-grid` for its rows; an
 * element without its own `lang` then follows the closest root's. Instances resolve a string with
 * `this.string(key, parameters)`; override `intlStrings()` to supply labels derived from `Intl`
 * for the element's `locale`.
 */
export function LocalizedElement<
  Base extends Constructor<UseLocaleElement> & Pick<typeof UseLocaleElement, "createProperty">,
  Defaults extends StringDefaults,
>(superClass: Base, defaults: Defaults) {
  class Localized extends superClass {
    static {
      this.createProperty("strings", { attribute: false });
    }

    /**
     * Per-element overrides for this element's user-facing strings, keyed by string name. Values
     * support `{placeholder}` substitution and plural objects keyed by `Intl.PluralRules` category.
     */
    declare strings: StringOverrides | undefined;

    /** The tag of the component this element is part of, such as `use-grid` for its rows. */
    declare protected readonly localeRoot?: string;

    get #component() {
      return this.localeRoot ?? this.localName;
    }

    protected get localeOwner(): HTMLElement {
      return this.closest<HTMLElement>(this.#component) ?? this;
    }

    protected intlStrings(): Partial<Record<string, string>> {
      return {};
    }

    protected string(key: string, parameters?: Record<string, StringParameterValue>): string {
      return resolveString(
        this,
        { component: this.#component, defaults, intl: () => this.intlStrings() },
        key,
        parameters,
      );
    }
  }
  return Localized as unknown as Constructor<LocalizedElementInterface<Defaults>> & Base;
}

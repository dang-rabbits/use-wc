import { LitElement } from "lit";
import { resolveLocale, subscribeToLocaleChanges } from "../../utils/locale";

export class UseLocaleElement extends LitElement {
  static properties = {
    ...LitElement.properties,
    locale: { type: String, attribute: true },
  };

  private _explicitLocale: string | undefined;
  private _unsubscribeLocale: (() => void) | undefined;

  get locale(): string {
    return this._explicitLocale ?? resolveLocale(this);
  }

  set locale(value: string) {
    const previous = this.locale;
    this._explicitLocale = value;
    this.requestUpdate("locale", previous);
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribeLocale = subscribeToLocaleChanges(() => {
      if (this._explicitLocale === undefined) {
        this.requestUpdate("locale");
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeLocale?.();
    this._unsubscribeLocale = undefined;
  }
}

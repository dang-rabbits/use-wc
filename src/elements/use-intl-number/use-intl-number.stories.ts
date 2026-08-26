import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseIntlNumber } from "./use-intl-number";

const meta: Meta<UseIntlNumber> = {
  component: "use-intl-number",
  title: "Web Components/use-intl-number",
  tags: ["autodocs", "!dev", "utility"],
};

export default meta;
type Story = StoryObj<UseIntlNumber>;

export const Decimal: Story = {
  render: () => html` <p><use-intl-number value="1234.5" lang="en-US"></use-intl-number></p> `,
};

export const Theme: Story = {
  ...Decimal,
  parameters: { ...Decimal.parameters, allowTheme: true },
};

export const Percent: Story = {
  render: () => html`
    <p><use-intl-number numberstyle="percent" value="0.42" lang="en-US"></use-intl-number></p>
  `,
};

export const Currency: Story = {
  render: () => html`
    <p>
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const Unit: Story = {
  render: () => html`
    <p>
      <use-intl-number
        numberstyle="unit"
        unit="kilometer-per-hour"
        value="80"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const CurrencyDisplay: Story = {
  render: () => html`
    <p>
      symbol:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencydisplay="symbol"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      narrowSymbol:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencydisplay="narrowSymbol"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      code:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencydisplay="code"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      name:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencydisplay="name"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const CurrencySign: Story = {
  render: () => html`
    <p>
      standard:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencysign="standard"
        value="-1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      accounting:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        currencysign="accounting"
        value="-1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const SignDisplay: Story = {
  render: () => html`
    <p>
      auto:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        signdisplay="auto"
        value="-1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      always:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        signdisplay="always"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      exceptZero:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        signdisplay="exceptZero"
        value="0"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      never:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        signdisplay="never"
        value="-1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const Currencies: Story = {
  render: () => html`
    <p>
      USD:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      EUR:
      <use-intl-number
        numberstyle="currency"
        currency="EUR"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      JPY:
      <use-intl-number
        numberstyle="currency"
        currency="JPY"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      GBP:
      <use-intl-number
        numberstyle="currency"
        currency="GBP"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      BHD:
      <use-intl-number
        numberstyle="currency"
        currency="BHD"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
  `,
};

export const Locale: Story = {
  render: () => html`
    <p>
      en-US:
      <use-intl-number
        numberstyle="currency"
        currency="USD"
        value="1234.5"
        lang="en-US"
      ></use-intl-number>
    </p>
    <p>
      fr-FR:
      <use-intl-number
        numberstyle="currency"
        currency="EUR"
        value="1234.5"
        lang="fr-FR"
      ></use-intl-number>
    </p>
    <p>
      de-DE:
      <use-intl-number
        numberstyle="currency"
        currency="EUR"
        value="1234.5"
        lang="de-DE"
      ></use-intl-number>
    </p>
    <p>
      ja-JP:
      <use-intl-number
        numberstyle="currency"
        currency="JPY"
        value="1234.5"
        lang="ja-JP"
      ></use-intl-number>
    </p>
    <p>
      ar-EG:
      <use-intl-number
        numberstyle="currency"
        currency="EGP"
        value="1234.5"
        lang="ar-EG"
      ></use-intl-number>
    </p>
  `,
};

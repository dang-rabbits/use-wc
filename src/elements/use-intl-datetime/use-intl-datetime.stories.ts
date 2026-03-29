import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseIntlDatetime } from "./use-intl-datetime";

const meta: Meta<UseIntlDatetime> = {
  component: "use-intl-datetime",
  title: "Web Components/use-intl-datetime",
  tags: ["autodocs", "!dev", "utility"],
};

export default meta;
type Story = StoryObj<UseIntlDatetime>;

export const Date: Story = {
  render: () => html`
    <p><use-intl-datetime datestyle="short" value="2024-07-04" lang="en-US"></use-intl-datetime></p>
    <p>
      <use-intl-datetime datestyle="medium" value="2024-07-04" lang="en-US"></use-intl-datetime>
    </p>
    <p><use-intl-datetime datestyle="long" value="2024-07-04" lang="en-US"></use-intl-datetime></p>
    <p><use-intl-datetime datestyle="full" value="2024-07-04" lang="en-US"></use-intl-datetime></p>
  `,
};

export const Time: Story = {
  render: () => html`
    <p><use-intl-datetime timestyle="short" value="14:30:00" lang="en-US"></use-intl-datetime></p>
    <p><use-intl-datetime timestyle="medium" value="14:30:00" lang="en-US"></use-intl-datetime></p>
    <p><use-intl-datetime timestyle="long" value="14:30:00" lang="en-US"></use-intl-datetime></p>
    <p><use-intl-datetime timestyle="full" value="14:30:00" lang="en-US"></use-intl-datetime></p>
  `,
};

export const Datetime: Story = {
  render: () => html`
    <p>
      <use-intl-datetime
        datestyle="short"
        timestyle="short"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
    <p>
      <use-intl-datetime
        datestyle="medium"
        timestyle="medium"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
    <p>
      <use-intl-datetime
        datestyle="long"
        timestyle="long"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
    <p>
      <use-intl-datetime
        datestyle="full"
        timestyle="full"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
  `,
};

export const MixedStyles: Story = {
  render: () => html`
    <p>
      <use-intl-datetime
        datestyle="full"
        timestyle="short"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
    <p>
      <use-intl-datetime
        datestyle="short"
        timestyle="long"
        value="2024-07-04T14:30:00Z"
        lang="en-US"
      ></use-intl-datetime>
    </p>
  `,
};

export const Locale: Story = {
  render: () => html`
    <p>
      en-US:
      <use-intl-datetime datestyle="long" value="2024-07-04" lang="en-US"></use-intl-datetime>
    </p>
    <p>
      fr-FR:
      <use-intl-datetime datestyle="long" value="2024-07-04" lang="fr-FR"></use-intl-datetime>
    </p>
    <p>
      de-DE:
      <use-intl-datetime datestyle="long" value="2024-07-04" lang="de-DE"></use-intl-datetime>
    </p>
    <p>
      ja-JP:
      <use-intl-datetime datestyle="long" value="2024-07-04" lang="ja-JP"></use-intl-datetime>
    </p>
    <p>
      ar-EG:
      <use-intl-datetime datestyle="long" value="2024-07-04" lang="ar-EG"></use-intl-datetime>
    </p>
  `,
};

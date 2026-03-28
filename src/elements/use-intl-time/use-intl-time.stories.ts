import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseIntlTime } from "./use-intl-time";

const meta: Meta<UseIntlTime> = {
  component: "use-intl-time",
  title: "Web Components/use-intl-time",
  tags: ["autodocs", "!dev", "utility"],
};

export default meta;
type Story = StoryObj<UseIntlTime>;

export const Date: Story = {
  render: () => html`
    <p><use-intl-time date="short" value="2024-07-04" locale="en-US"></use-intl-time></p>
    <p><use-intl-time date="medium" value="2024-07-04" locale="en-US"></use-intl-time></p>
    <p><use-intl-time date="long" value="2024-07-04" locale="en-US"></use-intl-time></p>
    <p><use-intl-time date="full" value="2024-07-04" locale="en-US"></use-intl-time></p>
  `,
};

export const Time: Story = {
  render: () => html`
    <p><use-intl-time time="short" value="14:30:00" locale="en-US"></use-intl-time></p>
    <p><use-intl-time time="medium" value="14:30:00" locale="en-US"></use-intl-time></p>
    <p><use-intl-time time="long" value="14:30:00" locale="en-US"></use-intl-time></p>
    <p><use-intl-time time="full" value="14:30:00" locale="en-US"></use-intl-time></p>
  `,
};

export const Datetime: Story = {
  render: () => html`
    <p>
      <use-intl-time datetime="short" value="2024-07-04T14:30:00Z" locale="en-US"></use-intl-time>
    </p>
    <p>
      <use-intl-time datetime="medium" value="2024-07-04T14:30:00Z" locale="en-US"></use-intl-time>
    </p>
    <p>
      <use-intl-time datetime="long" value="2024-07-04T14:30:00Z" locale="en-US"></use-intl-time>
    </p>
    <p>
      <use-intl-time datetime="full" value="2024-07-04T14:30:00Z" locale="en-US"></use-intl-time>
    </p>
  `,
};

export const Duration: Story = {
  render: () => html`
    <p><use-intl-time duration="short" value="PT2H30M" locale="en-US"></use-intl-time></p>
    <p><use-intl-time duration="long" value="PT2H30M" locale="en-US"></use-intl-time></p>
    <p><use-intl-time duration="narrow" value="PT2H30M" locale="en-US"></use-intl-time></p>
    <p><use-intl-time duration="digital" value="PT2H30M" locale="en-US"></use-intl-time></p>
  `,
};

export const Relative: Story = {
  render: () => html`
    <p>
      3 days ago:
      <use-intl-time
        relative="long"
        value=${new window.Date(window.Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}
        locale="en-US"
      ></use-intl-time>
    </p>
    <p>
      2 hours ago:
      <use-intl-time
        relative="long"
        value=${new window.Date(window.Date.now() - 2 * 60 * 60 * 1000).toISOString()}
        locale="en-US"
      ></use-intl-time>
    </p>
    <p>
      In 5 days:
      <use-intl-time
        relative="long"
        value=${new window.Date(window.Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()}
        locale="en-US"
      ></use-intl-time>
    </p>
    <p>
      In 1 year:
      <use-intl-time
        relative="long"
        value=${new window.Date(window.Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
        locale="en-US"
      ></use-intl-time>
    </p>
  `,
};

export const Locale: Story = {
  render: () => html`
    <p>en-US: <use-intl-time date="long" value="2024-07-04" locale="en-US"></use-intl-time></p>
    <p>fr-FR: <use-intl-time date="long" value="2024-07-04" locale="fr-FR"></use-intl-time></p>
    <p>de-DE: <use-intl-time date="long" value="2024-07-04" locale="de-DE"></use-intl-time></p>
    <p>ja-JP: <use-intl-time date="long" value="2024-07-04" locale="ja-JP"></use-intl-time></p>
    <p>ar-EG: <use-intl-time date="long" value="2024-07-04" locale="ar-EG"></use-intl-time></p>
  `,
};

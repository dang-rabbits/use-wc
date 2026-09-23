import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseBox } from "./use-box";
import "./use-box";

const spacingScaleOptions = ["", "none", "xsmall", "small", "medium", "large", "xlarge", "super"];
const gapScaleOptions = ["", "xsmall", "small", "medium", "large", "xlarge", "super"];

const meta: Meta<UseBox> = {
  component: "use-box",
  title: "Design System/use-box",
  tags: ["autodocs", "!dev", "utility"],
  parameters: { allowTheme: true },
  args: {
    direction: "column",
    align: "",
    justify: "",
    spacing: "",
    gutter: "",
    padding: "",
    paddingBlock: "",
    paddingInline: "",
    gap: "",
    divided: "",
  },
  argTypes: {
    direction: {
      control: "inline-radio",
      options: ["column", "row"],
    },
    align: {
      control: "inline-radio",
      options: ["", "start", "center", "end", "stretch"],
    },
    justify: {
      control: "inline-radio",
      options: ["", "start", "center", "end", "space-between", "space-around"],
    },
    spacing: {
      control: "inline-radio",
      options: spacingScaleOptions,
    },
    gutter: {
      control: "inline-radio",
      options: spacingScaleOptions,
    },
    padding: {
      control: "inline-radio",
      options: spacingScaleOptions,
    },
    paddingBlock: {
      control: "inline-radio",
      options: spacingScaleOptions,
    },
    paddingInline: {
      control: "inline-radio",
      options: spacingScaleOptions,
    },
    gap: {
      control: "inline-radio",
      options: gapScaleOptions,
    },
    divided: {
      control: "inline-radio",
      options: ["", "true", "full"],
    },
  },
};
export default meta;

type Story = StoryObj<UseBox>;

const items = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => html`<div style="background: #dbeafe; outline: 1px dashed #60a5fa;">
      Item ${index + 1}
    </div>`,
  );

export const Default: Story = {
  render: (args) => html`
    <use-box
      style="outline: 1px dashed #e11d48;"
      .direction=${args.direction}
      .align=${args.align}
      .justify=${args.justify}
      .spacing=${args.spacing}
      .gutter=${args.gutter}
      .padding=${args.padding}
      .paddingBlock=${args.paddingBlock}
      .paddingInline=${args.paddingInline}
      .gap=${args.gap}
      .divided=${args.divided}
    >
      ${items(5)}
    </use-box>
  `,
};

export const NoSpacing: Story = {
  render: () => html`<use-box style="outline: 2px dashed #e11d48;">${items(3)}</use-box>`,
};

export const SpacingMedium: Story = {
  render: () =>
    html`<use-box spacing="medium" style="outline: 2px dashed #e11d48;">${items(4)}</use-box>`,
};

export const SpacingScaleComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      ${(["xsmall", "small", "medium", "large", "xlarge", "super"] as const).map(
        (scale) => html`
          <div>
            <p style="margin: 0 0 4px; font: 12px monospace;">spacing="${scale}"</p>
            <use-box spacing=${scale} style="outline: 2px dashed #e11d48;">${items(3)}</use-box>
          </div>
        `,
      )}
    </div>
  `,
};

export const SingleChild: Story = {
  render: () =>
    html`<use-box spacing="medium" style="outline: 2px dashed #e11d48;">${items(1)}</use-box>`,
};

export const GutterMedium: Story = {
  render: () =>
    html`<use-box gutter="medium" style="outline: 2px dashed #e11d48;">${items(3)}</use-box>`,
};

/**
 * With `gap` and `padding` both set, `divided="full"` bleeds the native `row-rule` through the
 * box's own padding so it reaches the outer edge, instead of stopping at the padding like plain
 * `divided` does.
 */
export const DividedFull: Story = {
  render: () => html`
    <use-box
      divided="full"
      gap="medium"
      padding="large"
      style="outline: 2px dashed #e11d48; width: 320px;"
    >
      ${items(3)}
    </use-box>
  `,
};

/**
 * A `use-box` nested inside another one starts from its own defaults rather than inheriting its
 * ancestor's. The outer box's `padding="large"` stays on the outer box: the inner box (green) has
 * no padding of its own, so its items sit flush against its edge, and its `divided="full"` rules
 * stay within its own width instead of bleeding by the outer box's padding.
 */
export const Nested: Story = {
  render: () => html`
    <use-box
      padding="large"
      gap="medium"
      divided="full"
      style="outline: 2px dashed #e11d48; width: 320px;"
    >
      ${items(1)}
      <use-box divided="full" gap="small" style="outline: 2px dashed #16a34a;">
        ${items(3)}
      </use-box>
      ${items(1)}
    </use-box>
  `,
};

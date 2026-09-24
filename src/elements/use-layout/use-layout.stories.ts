import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseLayout } from "./use-layout";
import "./use-layout";

const spacingScaleOptions = ["", "none", "xsmall", "small", "medium", "large", "xlarge", "super"];
const gapScaleOptions = ["", "xsmall", "small", "medium", "large", "xlarge", "super"];

const meta: Meta<UseLayout> = {
  component: "use-layout",
  title: "Design System/use-layout",
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
    wrap: false,
    inline: false,
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
    wrap: {
      control: "boolean",
    },
    inline: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<UseLayout>;

const items = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => html`<div style="background: #dbeafe; outline: 1px dashed #60a5fa;">
      Item ${index + 1}
    </div>`,
  );

const plainItems = (count: number) =>
  Array.from({ length: count }, (_, index) => html`<div>Item ${index + 1}</div>`);

export const Default: Story = {
  render: (args) => html`
    <use-layout
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
      .wrap=${args.wrap}
      .inline=${args.inline}
    >
      ${items(5)}
    </use-layout>
  `,
};

export const GutterMedium: Story = {
  render: () =>
    html`<use-layout gutter="medium" style="outline: 2px dashed #e11d48;">${items(3)}</use-layout>`,
};

const ringedChildren = (count: number) =>
  Array.from(
    { length: count },
    (_, index) => html`
      <div
        style="display: block; inline-size: 100%; outline: 2px dashed #2563eb; outline-offset: 2px; padding-block: .25rem;"
      >
        Row ${index + 1}
      </div>
    `,
  );

/**
 * `gap` and `padding` on the layout itself work well when its children don't scroll. When a child
 * is a scroll container holding controls — a `use-layout[fill]` body, say — use `spacing` and
 * `gutter` instead. They look the same as `gap` and `paddinginline`, but they leave room for
 * focus rings and box shadows that `gap` and `padding` can't.
 *
 * The difference is where the space lives. `gap` is empty space between the children, and the
 * layout's own `padding` sits around them; neither belongs to any child. `spacing` and `gutter`
 * add padding to every child instead: `spacing` puts half its value on each side along the main
 * axis, so two neighbours add up to one full step, and `gutter` puts its full value on both sides
 * along the cross axis. A scroll container only clips at the edge of its own padding, so a ring or
 * shadow on the content inside it spreads into that padding instead of being cut off.
 *
 * Two things to keep in mind. `spacing` keeps the first child's leading edge and the last child's
 * trailing edge at zero, so the layout has no outer inset there; add `paddingblock` if it needs
 * one. And a nested `use-layout` child that sets its own padding keeps it on that axis.
 *
 * Both examples use `paddingblock="medium"` and `divided="full"`.
 */
export const FocusRingClipping: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-inline-size: 36rem;">
      <div>
        <use-layout
          gap="xlarge"
          paddinginline="xlarge"
          paddingblock="medium"
          divided="full"
          style="outline: 1px dashed red; height: 300px"
        >
          <header>
            <span style="font-size: 12px; font-family: monospace"
              >gap="xlarge" paddinginline="xlarge"
            </span>
          </header>
          <use-layout fill gap="medium" style="overflow: auto"> ${ringedChildren(20)} </use-layout>
          <footer>footer</footer>
        </use-layout>
      </div>
      <div>
        <use-layout
          spacing="xlarge"
          gutter="xlarge"
          paddingblock="medium"
          divided="full"
          style="outline: 1px dashed red; height: 300px"
        >
          <header>
            <span style="font-size: 12px; font-family: monospace">
              spacing="xlarge" gutter="xlarge"</span
            >
          </header>
          <use-layout fill gap="medium" style="overflow: auto">${ringedChildren(20)}</use-layout>
          <footer>footer</footer>
        </use-layout>
      </div>
    </div>
  `,
};

/**
 * `divided` rules every child off from the one before it. With a `gap`, the rule is drawn into the
 * middle of the gap itself (`row-rule` on browsers with CSS Gap Decorations), so it never touches
 * the children's content.
 */
export const Divided: Story = {
  render: () => html`
    <use-layout divided gap="medium" style="outline: 2px dashed #e11d48; width: 320px;">
      ${plainItems(3)}
    </use-layout>
  `,
};

/**
 * In a row, the rule turns vertical and sits in the gap between side-by-side children
 * (`column-rule`).
 */
export const DividedRow: Story = {
  render: () => html`
    <use-layout
      direction="row"
      divided
      gap="medium"
      style="outline: 2px dashed #e11d48; width: 320px;"
    >
      ${plainItems(3)}
    </use-layout>
  `,
};

/**
 * With no `gap` there's no gap to draw into, so the rule is a plain border on each child's leading
 * edge instead, touching its content. Add a `gap` whenever the rule needs room around it.
 */
export const DividedWithoutGap: Story = {
  render: () => html`
    <use-layout divided style="outline: 2px dashed #e11d48; width: 320px;">
      ${plainItems(3)}
    </use-layout>
  `,
};

/**
 * With `gap` and `padding` both set, `divided="full"` bleeds the native `row-rule` through the
 * layout's own padding so it reaches the outer edge, instead of stopping at the padding like plain
 * `divided` does.
 */
export const DividedFull: Story = {
  render: () => html`
    <use-layout
      divided="full"
      gap="medium"
      padding="large"
      style="outline: 2px dashed #e11d48; width: 320px;"
    >
      ${items(3)}
    </use-layout>
  `,
};

/**
 * A `use-layout` nested inside another one starts from its own defaults rather than inheriting its
 * ancestor's. The outer layout's `padding="large"` stays on the outer layout: the inner one
 * (green) has no padding of its own, so its items sit flush against its edge, and its
 * `divided="full"` rules stay within its own width instead of bleeding by the outer padding.
 */
export const Nested: Story = {
  render: () => html`
    <use-layout
      padding="large"
      gap="medium"
      divided="full"
      style="outline: 2px dashed #e11d48; width: 320px;"
    >
      ${items(1)}
      <use-layout divided="full" gap="small" style="outline: 2px dashed #16a34a;">
        ${items(3)}
      </use-layout>
      ${items(1)}
    </use-layout>
  `,
};

/**
 * `direction` is the only attribute that changes the axis. Column is the default.
 */
export const ColumnAndRow: Story = {
  render: () => html`
    <use-layout gap="small">
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </use-layout>
    <use-layout direction="row" gap="small">
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </use-layout>
  `,
};

/**
 * `align` maps to `align-items` and `justify` to `justify-content`, each with a short named set of values.
 */
export const AlignAndJustify: Story = {
  render: () => html`
    <use-layout
      direction="row"
      align="center"
      justify="space-between"
      gap="small"
      style="block-size: 6rem"
    >
      <span>Leading</span>
      <button type="button">Trailing action</button>
    </use-layout>
  `,
};

/**
 * The `fill` child grows and scrolls its own overflow; its siblings are pinned so they can't shrink under it.
 */
export const Fill: Story = {
  render: () => html`
    <use-layout style="block-size: 12rem; outline: 1px dashed #d1d5db">
      <div style="outline: 1px dashed #94a3b8">Header</div>
      <use-layout fill style="outline: 1px dashed #94a3b8">
        ${Array.from({ length: 8 }, (_, index) => html`<p>Row ${index + 1}</p>`)}
      </use-layout>
      <div style="outline: 1px dashed #94a3b8">Footer</div>
    </use-layout>
  `,
};

/**
 * `use-layout` takes `fill` itself, so a growing region can hold another one without a separate tag.
 */
export const NestedFill: Story = {
  render: () => html`
    <use-layout direction="row" style="block-size: 12rem; outline: 1px dashed #d1d5db">
      <div style="outline: 1px dashed #94a3b8">Sidebar</div>
      <use-layout fill style="outline: 1px dashed #94a3b8">
        <div style="outline: 1px dashed #94a3b8">Toolbar</div>
        <use-layout fill style="outline: 1px dashed #94a3b8">
          ${Array.from({ length: 10 }, (_, index) => html`<p>Item ${index + 1}</p>`)}
        </use-layout>
      </use-layout>
    </use-layout>
  `,
};

/**
 * `wrap` is a boolean attribute mapping to `flex-wrap: wrap`.
 */
export const Wrap: Story = {
  render: () => html`
    <use-layout direction="row" wrap gap="small" style="max-inline-size: 14rem">
      ${Array.from(
        { length: 6 },
        (_, index) => html`<button type="button">Chip ${index + 1}</button>`,
      )}
    </use-layout>
  `,
};

/**
 * An app frame, at a roomy density. The header is a topbar and the footer a status bar, separated from the body by the page's own `spacing` — there's no rule between them by default. `main` grows into the height the page is given and scrolls on its own, with no `fill` needed.
 *
 * A `.page` spends its inset as `spacing` between regions, `gutter` beside them, and `paddingblock` at its own top and bottom, rather than `gap` and `padding`. That puts the room inside each region's own box, so a focus ring near the edge of the scrolling `main` renders instead of being clipped. Set any of the three to override its default.
 *
 * The footer splits by default, so status text sits opposite its actions. Wrap groups of items in `<section>`s to control the ends of any region: two or more `<section>` children switch it to `space-between`.
 */
export const Page: Story = {
  render: () => html`
    <use-layout class="page" style="block-size: 14rem; max-inline-size: 28rem;">
      <header>
        <section>
          <hgroup><h4>Fieldbook</h4></hgroup>
        </section>
        <section>
          <button type="button">Search</button>
          <button type="button" aria-label="Account">&#9679;</button>
        </section>
      </header>
      <main>${Array.from({ length: 8 }, (_, index) => html`<p>Row ${index + 1}</p>`)}</main>
      <footer>
        <span>12 entries</span>
        <button type="button">New entry</button>
      </footer>
    </use-layout>
  `,
};

/**
 * Add `divided` to rule a header/footer off from the body — opt-in rather than a page default.
 * Since a page's regions are spaced with `spacing`, each region after the first gets a border on
 * its top edge, centred between the two halves of the spacing. The border spans the region's whole
 * box, `gutter` included, so it runs edge to edge.
 */
export const DividedPage: Story = {
  render: () => html`
    <use-layout class="page" divided style="block-size: 14rem; max-inline-size: 28rem;">
      <header>
        <section>
          <hgroup><h4>Fieldbook</h4></hgroup>
        </section>
        <section>
          <button type="button">Search</button>
          <button type="button" aria-label="Account">&#9679;</button>
        </section>
      </header>
      <main>${Array.from({ length: 8 }, (_, index) => html`<p>Row ${index + 1}</p>`)}</main>
      <footer>
        <span>12 entries</span>
        <button type="button">New entry</button>
      </footer>
    </use-layout>
  `,
};

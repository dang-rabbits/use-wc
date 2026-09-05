import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseAvatar } from "./use-avatar";
import "./use-avatar";

const meta: Meta<UseAvatar> = {
  component: "use-avatar",
  title: "Web Components/use-avatar",
  tags: ["autodocs", "!dev", "utility"],
};
export default meta;

type Story = StoryObj<UseAvatar>;

const photo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%236366f1'/%3E%3Ccircle cx='48' cy='38' r='16' fill='%23c7d2fe'/%3E%3Crect x='20' y='60' width='56' height='36' rx='18' fill='%23c7d2fe'/%3E%3C/svg%3E";

export const Initials: Story = {
  render: () => html`<use-avatar name="Riley Quinn"></use-avatar>`,
};

export const WithImage: Story = {
  render: () => html`<use-avatar name="Riley Quinn"><img alt="" src=${photo} /></use-avatar>`,
};

export const WithSvg: Story = {
  render: () => html`
    <use-avatar name="Calendar">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="4" width="18" height="17" rx="2"></rect>
        <path d="M3 9h18M8 3v4M16 3v4"></path>
      </svg>
    </use-avatar>
  `,
};

export const Ratio: Story = {
  render: () => html`
    <use-avatar name="Trailhead Lodge" style="inline-size: 20rem; aspect-ratio: 16 / 9">
      <img alt="" src=${photo} />
    </use-avatar>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem">
      <use-avatar name="Riley Quinn" style="inline-size: 1.5rem"></use-avatar>
      <use-avatar name="Riley Quinn" style="inline-size: 2.5rem"></use-avatar>
      <use-avatar name="Riley Quinn" style="inline-size: 4rem"></use-avatar>
    </div>
  `,
};

export const Theme: Story = {
  parameters: { allowTheme: true },
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem; margin-block-end: 1.5rem">
      <use-avatar name="Riley Quinn" class="circle"></use-avatar>
      <use-avatar name="Riley Quinn" class="square"></use-avatar>
      <use-avatar name="Riley Quinn" class="squircle"></use-avatar>
      <use-avatar class="square" style="inline-size: 8rem; aspect-ratio: 16 / 9">
        <img alt="" src=${photo} />
      </use-avatar>
    </div>
    <use-layout class="card" style="max-inline-size: 22rem">
      <header>
        <use-avatar name="Riley Quinn"></use-avatar>
        <hgroup>
          <h4>Riley Quinn</h4>
          <p>Product design</p>
        </hgroup>
      </header>
      <main>
        <p>
          In a use-layout header the avatar takes that variant's avatar size, so it stays in step
          with the rest of the region.
        </p>
      </main>
    </use-layout>
  `,
};

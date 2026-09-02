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
  render: () => html`<use-avatar name="Ada Lovelace"></use-avatar>`,
};

export const WithImage: Story = {
  render: () => html`<use-avatar name="Ada Lovelace"><img alt="" src=${photo} /></use-avatar>`,
};

export const WithSvg: Story = {
  render: () => html`
    <use-avatar name="Calendar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="17" rx="2"></rect>
        <path d="M3 9h18M8 3v4M16 3v4"></path>
      </svg>
    </use-avatar>
  `,
};

export const Square: Story = {
  render: () => html`<use-avatar name="Trailhead Lodge" shape="square"></use-avatar>`,
};

export const Poster: Story = {
  render: () => html`
    <use-avatar
      name="Trailhead Lodge"
      shape="square"
      style="--usewc-avatar-size: 20rem; --usewc-avatar-ratio: 16 / 9"
    >
      <img alt="" src=${photo} />
    </use-avatar>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem">
      <use-avatar name="Ada Lovelace" style="--usewc-avatar-size: 1.5rem"></use-avatar>
      <use-avatar name="Ada Lovelace" style="--usewc-avatar-size: 2.5rem"></use-avatar>
      <use-avatar name="Ada Lovelace" style="--usewc-avatar-size: 4rem"></use-avatar>
    </div>
  `,
};

export const Theme: Story = {
  parameters: { allowTheme: true },
  render: () => html`
    <use-card style="max-inline-size: 22rem">
      <header>
        <use-avatar name="Ada Lovelace"></use-avatar>
        <hgroup>
          <h4>Ada Lovelace</h4>
          <p>Analytical Engine</p>
        </hgroup>
      </header>
      <use-shell-fill>
        <p>
          The avatar picks up the surface's avatar size inside a card, dialog, or popover header.
        </p>
      </use-shell-fill>
    </use-card>
  `,
};

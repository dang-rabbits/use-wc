import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseBadge } from "./use-badge";
import "./use-badge";
import createId from "../../utils/create-id";

const meta: Meta<UseBadge> = {
  component: "use-badge",
  title: "Web Components/use-badge",
  tags: ["autodocs", "!dev", "utility"],
};
export default meta;

type Story = StoryObj<UseBadge>;

// Storybook's docs page renders every story inline in one shared document — and re-renders
// whichever story is first (Default) a second time, on its own, as the page's auto-generated
// primary example above the full story list. A fixed id would collide between those two live
// copies: both use-badge instances would resolve the same anchortarget id, and getElementById
// would hand both of them the first copy's button, not their own — the second copy's badge
// would silently anchor to the first copy's button instead. Generating the id fresh inside
// render(), instead of hardcoding one, keeps every rendered copy's anchor resolution
// independent of how many other copies of this story exist on the page.
export const Default: Story = {
  render: () => {
    const anchorId = createId();
    return html`
      <button id=${anchorId} type="button">Inbox</button>
      <use-badge anchortarget=${anchorId}>3</use-badge>
    `;
  },
};

export const Theme: Story = {
  // Same reasoning as Default's render above — a distinct, freshly generated id per render
  // keeps this story's anchor resolution independent of where else on the page it renders,
  // and of Default's own id, since docs pages render every story in one shared document.
  parameters: { allowTheme: true },
  render: () => {
    const anchorId = createId();
    return html`
      <button id=${anchorId} type="button">Inbox</button>
      <use-badge anchortarget=${anchorId}>3</use-badge>
    `;
  },
};

export const Overflow: Story = {
  render: () => html`
    <button id="use-badge-overflow-anchor" type="button">Notifications</button>
    <use-badge anchortarget="use-badge-overflow-anchor">99+</use-badge>
  `,
};

export const Dot: Story = {
  render: () => html`
    <button id="use-badge-dot-anchor" type="button">Alerts</button>
    <use-badge anchortarget="use-badge-dot-anchor" dot aria-label="Unread alerts"></use-badge>
  `,
};

export const Corners: Story = {
  render: () => html`
    <div style="display: flex; gap: 3rem; padding: 1rem">
      ${["start", "end"].flatMap((blockalign) =>
        ["start", "end"].map((inlinealign) => {
          const id = `use-badge-corner-${blockalign}-${inlinealign}`;
          return html`
            <div style="display: inline-block">
              <button id=${id} type="button">${blockalign}/${inlinealign}</button>
              <use-badge anchortarget=${id} blockalign=${blockalign} inlinealign=${inlinealign}
                >3</use-badge
              >
            </div>
          `;
        }),
      )}
    </div>
  `,
};

/**
 * A component whose host renders as `display: contents` has no box of its own for anchor
 * positioning to resolve against. It can publish `--usewc-anchor-name`, pointing at a real,
 * box-generating part of itself, so a badge anchored to the host still targets something anchor
 * positioning can actually resolve. This story stands in for such a component by hand: the outer
 * `span` is what `anchortarget` points at, and it publishes the anchor name of the button inside
 * it instead of trying to anchor to itself.
 *
 * Known Firefox limitation: this cross-shadow-root anchoring is mispositioned in Firefox (verified
 * directly — anchor()'s start/end keywords resolve backwards there specifically for anchors
 * reached across a shadow boundary). Chromium and Safari position this correctly; badges on plain
 * elements are unaffected in every engine, including Firefox.
 */
export const WithPublishedAnchorName: Story = {
  render: () => html`
    <div style="display: inline-block; padding: 1rem">
      <span
        id="use-badge-published-anchor"
        style="display: contents; --usewc-anchor-name: --use-badge-published-target"
      >
        <button type="button" style="anchor-name: --use-badge-published-target">Actions</button>
      </span>
      <use-badge
        anchortarget="use-badge-published-anchor"
        dot
        aria-label="New actions available"
      ></use-badge>
    </div>
  `,
};

export const WithExistingAnchorName: Story = {
  render: () => html`
    <select id="use-badge-select-anchor">
      <option>One</option>
      <option>Two</option>
    </select>
    <use-badge anchortarget="use-badge-select-anchor" dot aria-label="Update available"></use-badge>
  `,
};

/**
 * By default, a badge appends its own id to its anchor's `aria-describedby` on
 * connect. Inspect the button below in devtools: it starts with no
 * `aria-describedby` and, once the badge connects, gains one pointing at the
 * badge's id — so a screen reader announces something like "Inbox, button, 3"
 * when the button receives focus.
 */
export const AriaWiring: Story = {
  name: "Aria wiring (standard behavior)",
  render: () => html`
    <button id="use-badge-aria-standard-anchor" type="button">Inbox</button>
    <use-badge anchortarget="use-badge-aria-standard-anchor">3</use-badge>
  `,
};

/**
 * The button below already has an `aria-describedby` pointing at the "Shared
 * with the marketing team" text. The badge appends its own id to that list
 * rather than replacing it, so both descriptions are announced — inspect
 * `aria-describedby` on the button to see both ids.
 */
export const AriaWiringAppendsToExisting: Story = {
  name: "Aria wiring (appends to an existing aria-describedby)",
  render: () => html`
    <button
      id="use-badge-aria-existing-anchor"
      type="button"
      aria-describedby="use-badge-aria-existing-description"
    >
      Inbox
    </button>
    <span id="use-badge-aria-existing-description">Shared with the marketing team</span>
    <use-badge anchortarget="use-badge-aria-existing-anchor">3</use-badge>
  `,
};

/**
 * With `options="noaria"`, the badge never touches the button's
 * `aria-describedby` — it stays exactly as authored.
 */
export const WithoutAriaWiring: Story = {
  name: 'Aria wiring opted out (options="noaria")',
  render: () => html`
    <button
      id="use-badge-noaria-anchor"
      type="button"
      aria-describedby="use-badge-noaria-description"
    >
      Inbox
    </button>
    <span id="use-badge-noaria-description">Already documents its own unread count elsewhere</span>
    <use-badge anchortarget="use-badge-noaria-anchor" options="noaria">3</use-badge>
  `,
};

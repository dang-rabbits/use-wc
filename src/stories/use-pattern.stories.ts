import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../elements/use-avatar/use-avatar";
import "../elements/use-anchored/use-anchored";
import "../elements/use-layout/use-layout";
import "../elements/use-pattern/use-pattern";

const poster =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='160'%3E%3Crect width='480' height='160' fill='%2394a3b8'/%3E%3C/svg%3E";
const portrait =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2364748b'/%3E%3C/svg%3E";
const screenshot =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='200'%3E%3Crect width='480' height='200' fill='%23cbd5e1'/%3E%3C/svg%3E";

const meta: Meta = {
  title: "Design System/use-pattern",
  tags: ["autodocs", "!dev", "utility"],
  // Unlike a component page, this one documents the theme itself — escaped, a `use-pattern` is an
  // unstyled inline element and every example renders as nothing. See `.storybook/preview.ts`.
  parameters: {
    allowTheme: true,
    docs: {
      description: {
        component: [
          "`use-pattern` arranges a region-based unit of content, styled entirely by the design-system stylesheet rather than any shadow DOM. It's a registered custom element with no properties of its own — its variant class says what it is.",
          "",
          "Four variant classes arrange its semantic `<figure>` / `<header>` / `<main>` / `<footer>` regions: `entry` for a row in a list, `message` for a chat or comment, `card` for a panel, and `media` for a media object — a rail that fits its content beside a wider body column. Each selector is compound (`use-pattern.card`, never a bare `.card`) so these common words can't collide with your own classes.",
          "",
          "Add `.divided` to a `card` to rule a region off from the one before it — opt-in, not a default. `entry`/`message`/`media` don't take it, since they arrange their regions structurally rather than stacking them in one column.",
          "",
          "For generic flex arrangement, or an app frame with a scrolling body, reach for `use-layout` — it nests inside any pattern's regions, and a `use-layout[fill]` child grows and scrolls inside a card the same way it does anywhere else. For a block of authored text, reach for `use-prose`.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * A row in a list — a comment, a notification, a search result, a person. The one variant that isn't a column: a leading avatar rail on the inline-start edge with every other region stacked beside it.
 *
 * The rail shares a centre with the title block, so a stacked title and a single line each sit level with the avatar. A `<use-avatar>`'s size and a stacked title group's height are the same token, so the two always agree — and both land on a base button's 36px height.
 */
export const Entry: Story = {
  render: () => html`
    <use-pattern class="entry" style="max-inline-size: 24rem;">
      <use-avatar name="Riley Quinn"></use-avatar>
      <header>
        <hgroup>
          <h4>Riley Quinn</h4>
          <p>Opened this issue 3 days ago</p>
        </hgroup>
        <button type="button" aria-label="More options">&#8942;</button>
      </header>
      <main><p>The drawer's body region doesn't scroll when the footer is present.</p></main>
      <footer>
        <button type="button">Assign</button>
        <button type="button">Close</button>
      </footer>
    </use-pattern>
  `,
};

/**
 * The rail's column is reserved whether or not an avatar is present, so an entry that omits it still lines its body up with the ones that have it — and stays no taller than its content.
 */
export const GroupedEntry: Story = {
  render: () => html`
    <use-pattern class="entry" style="max-inline-size: 24rem;">
      <use-avatar name="Riley Quinn"></use-avatar>
      <header>
        <hgroup>
          <h4>Riley Quinn</h4>
          <p>Opened this issue 3 days ago</p>
        </hgroup>
      </header>
      <main><p>The first entry in a run carries the avatar.</p></main>
    </use-pattern>
    <use-pattern class="entry" style="max-inline-size: 24rem;">
      <main><p>A grouped entry with no avatar — still aligned.</p></main>
    </use-pattern>
  `,
};

/**
 * The rail isn't only for faces. A `<figure>` holds anything that isn't a likeness — an icon, a status glyph, a file-type mark — centred in the same square, so a mixed list still lines up. An inline SVG needs no wrapper of its own.
 */
export const EntryWithGlyph: Story = {
  render: () => html`
    <use-pattern class="entry" style="max-inline-size: 24rem;">
      <figure>
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="17" rx="2"></rect>
          <path d="M3 9h18M8 3v4M16 3v4"></path>
        </svg>
      </figure>
      <header>
        <hgroup>
          <h4>Sprint planning</h4>
          <p>Tomorrow &middot; 30 minutes</p>
        </hgroup>
      </header>
      <main><p>Estimates are due before the session starts.</p></main>
    </use-pattern>
  `,
};

/**
 * A date badge works the same way — the rail only cares about the square, so a two-line stack sits in it as happily as a face does.
 */
export const EntryWithBadge: Story = {
  render: () => html`
    <use-pattern class="entry" style="max-inline-size: 24rem;">
      <figure
        style="
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          overflow: hidden;
          line-height: 1.1;
        "
      >
        <span
          style="background: #dc2626; color: #fff; font-size: 0.5rem; inline-size: 100%; text-align: center"
          >MAR</span
        >
        <span style="font-size: 0.875rem; font-weight: 600; color: #1e293b">3</span>
      </figure>
      <header>
        <hgroup>
          <h4>Quarterly review</h4>
          <p>All day &middot; Room 2</p>
        </hgroup>
      </header>
      <main><p>Bring the roadmap draft and last quarter's numbers.</p></main>
    </use-pattern>
  `,
};

/**
 * `entry`'s layout at chat density — tighter, because a message repeats far more often down a feed. The name and timestamp share one line rather than stacking, the footer aligns with the body rather than the far edge, and no rules divide the regions: it reads as one block, not a panel.
 */
export const Message: Story = {
  render: () => html`
    <use-pattern class="message" style="max-inline-size: 24rem;">
      <use-avatar name="Teammate"><img src=${portrait} alt="" /></use-avatar>
      <header>
        <hgroup>
          <h4>Teammate</h4>
          <p>10:24 AM</p>
        </hgroup>
        <button type="button" aria-label="More options">&#8942;</button>
      </header>
      <main><p>Pushed the rebase &mdash; the drawer scrolls properly now.</p></main>
      <footer>
        <button type="button">Reply</button>
        <button type="button">React</button>
      </footer>
    </use-pattern>
    <use-pattern class="message" style="max-inline-size: 24rem;">
      <main><p>Grouped message &mdash; no header, no avatar, still aligned.</p></main>
    </use-pattern>
  `,
};

/**
 * A media attachment goes inside `<main>`, not in the rail. It keeps the flow of the body and loses its default margins, so the region's own spacing is the only spacing.
 */
export const MessageAttachment: Story = {
  render: () => html`
    <use-pattern class="message" style="max-inline-size: 24rem;">
      <use-avatar name="Teammate"><img src=${portrait} alt="" /></use-avatar>
      <header>
        <hgroup>
          <h4>Teammate</h4>
          <p>10:42 AM</p>
        </hgroup>
      </header>
      <main>
        <p>Here's the screenshot:</p>
        <figure>
          <img src=${screenshot} alt="" style="border-radius: 6px" />
          <figcaption style="font-size: 0.75rem; color: #64748b">drawer-scroll.png</figcaption>
        </figure>
      </main>
      <footer>
        <button type="button">Reply</button>
        <button type="button">React</button>
      </footer>
    </use-pattern>
  `,
};

/**
 * A unit in a grid or feed, at a compact density, and the only variant that paints chrome of its own (background, border, shadow); `.outlined` keeps the border and drops the shadow. A header's leading likeness is a `<use-avatar>`, or a `<figure>` when it isn't a likeness. Add `role`/ARIA to the `<use-pattern>` directly for real semantics — the tag carries none on purpose.
 */
export const Card: Story = {
  render: () => html`
    <use-pattern class="card" style="max-inline-size: 24rem">
      <figure><img src=${poster} alt="" /></figure>
      <header>
        <use-avatar name="Trailhead Lodge"><img src=${portrait} alt="" /></use-avatar>
        <hgroup>
          <h4>Trailhead Lodge</h4>
          <p>Yosemite Valley, CA</p>
        </hgroup>
        <button type="button" aria-label="More options">&#8942;</button>
      </header>
      <main>
        <p>A cabin at the edge of the valley, five minutes from the trailhead. Sleeps four.</p>
      </main>
      <footer>
        <section><button type="button">Share</button></section>
        <section><button type="button">Book now</button></section>
      </footer>
    </use-pattern>
  `,
};

/**
 * Two `<section>`s in a region push apart; each groups its own items. A region with one section, or none, keeps its variant's default edge alignment.
 */
export const HeaderAndFooterSections: Story = {
  render: () => html`
    <use-pattern class="card" style="max-inline-size: 24rem">
      <header>
        <section>
          <button type="button" aria-label="Back">&#8592;</button>
          <hgroup><h4>Invoice #1042</h4></hgroup>
        </section>
        <section>
          <button type="button" aria-label="Print">&#128424;</button>
          <button type="button" aria-label="More options">&#8942;</button>
        </section>
      </header>
      <main><p>Issued March 3. Due in 30 days.</p></main>
      <footer>
        <section><button type="button">Delete</button></section>
        <section>
          <button type="button">Save draft</button>
          <button type="button">Send</button>
        </section>
      </footer>
    </use-pattern>
  `,
};

/**
 * A media object, like Bootstrap's `.media` — a rail on the inline-start edge that fits the width of whatever it holds, with the header, body and footer in one column beside it. Unlike `entry`, the rail isn't squared or cropped: a thumbnail keeps its own aspect. The body is one column, so the rail's height doesn't push it around — `main` always sits directly under `header`, one region gap apart.
 *
 * The rail is always the first child — `use-avatar`, `figure`, a bare `img` or `svg` all work. Unlike `entry`/`message`, `.media` has no grouped form: the first child is always treated as the rail, so it isn't optional here.
 */
export const Media: Story = {
  render: () => html`
    <use-pattern class="media" style="max-inline-size: 28rem">
      <figure><img src=${portrait} alt="" style="inline-size: 4rem; border-radius: 6px" /></figure>
      <header>
        <hgroup>
          <h4>Trailhead Lodge</h4>
          <p>Updated yesterday</p>
        </hgroup>
        <button type="button" aria-label="More options">&#8942;</button>
      </header>
      <main>
        <p>A cabin at the edge of the valley, five minutes from the trailhead. Sleeps four.</p>
      </main>
      <footer>
        <button type="button">Share</button>
        <button type="button">Book now</button>
      </footer>
    </use-pattern>
  `,
};

/**
 * A `<dialog>` and a `[popover]` are chrome only — background, border, shadow, backdrop, sizing. They carry no layout of their own, so nest a `use-pattern` variant inside to arrange them. That keeps the overlay element's UA-controlled `display` alone and lets one dialog host any variant.
 *
 * `.card` is usually the one you want, and a card nested directly in an overlay drops its own background, border and shadow rather than stacking a second surface inside one.
 */
export const InsideADialog: Story = {
  render: () => html`
    <button type="button" command="show-modal" commandfor="use-pattern-dialog-demo">
      Open modal
    </button>
    <dialog id="use-pattern-dialog-demo">
      <use-pattern class="card">
        <header>
          <hgroup>
            <h4>Delete project?</h4>
            <p>This can't be undone.</p>
          </hgroup>
        </header>
        <use-layout fill>
          <p>All boards, cards, and history for this project will be permanently removed.</p>
        </use-layout>
        <footer>
          <section>
            <button type="button" command="close" commandfor="use-pattern-dialog-demo">
              Cancel
            </button>
          </section>
          <section>
            <form method="dialog">
              <button value="delete" class="danger">Delete</button>
            </form>
          </section>
        </footer>
      </use-pattern>
    </dialog>
  `,
};

/**
 * `dialog.drawer` pins to a full-height edge panel. The nested layout is what makes it work: its `use-layout[fill]` body scrolls while header and footer stay put.
 */
export const Drawer: Story = {
  render: () => html`
    <button type="button" command="show-modal" commandfor="use-pattern-drawer-demo">
      Open drawer
    </button>
    <dialog class="drawer" id="use-pattern-drawer-demo">
      <use-pattern class="card" style="block-size: 100%">
        <header>
          <section>
            <hgroup><h4>Filters</h4></hgroup>
          </section>
          <section>
            <button
              type="button"
              aria-label="Close"
              command="close"
              commandfor="use-pattern-drawer-demo"
            >
              &#10005;
            </button>
          </section>
        </header>
        <use-layout fill>
          ${Array.from({ length: 12 }, (_, index) => html`<p>Filter option ${index + 1}</p>`)}
        </use-layout>
        <footer>
          <section>
            <button type="button" command="close" commandfor="use-pattern-drawer-demo">
              Reset
            </button>
          </section>
          <section>
            <form method="dialog">
              <button value="apply">Apply</button>
            </form>
          </section>
        </footer>
      </use-pattern>
    </dialog>
  `,
};

/**
 * An open `[popover]` takes a nested layout the same way a dialog does. Wrap it in `use-anchored` to pin it to its trigger.
 */
export const Popover: Story = {
  render: () => html`
    <button type="button" id="use-pattern-popover-trigger" popovertarget="use-pattern-popover-demo">
      Open popover
    </button>
    <use-anchored target="use-pattern-popover-trigger">
      <div popover id="use-pattern-popover-demo" style="max-inline-size: 20rem">
        <use-pattern class="card">
          <header>
            <hgroup><h4>Notifications</h4></hgroup>
          </header>
          <main><p>You're all caught up.</p></main>
        </use-pattern>
      </div>
    </use-anchored>
  `,
};

import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseAnchored } from "./use-anchored";

const meta: Meta<UseAnchored> = {
  component: "use-anchored",
  title: "Web Components/use-anchored",
  tags: ["autodocs", "!dev", "utility"],
  render: () => html`
    <div style="min-block-size: 20rem;">
      <button id="use-anchored-demo-trigger" popovertarget="use-anchored-demo">Open</button>
      <use-anchored target="use-anchored-demo-trigger">
        <div id="use-anchored-demo" popover style="padding: 1rem; margin: 0;">
          Positioned relative to the button, no matter what opens or closes it.
        </div>
      </use-anchored>
    </div>
  `,
};

export default meta;
type Story = StoryObj<UseAnchored>;

export const Default: Story = {
  parameters: {
    showPanel: false,
    allowTheme: true,
  },
};

/**
 * `use-anchored` doesn't care how the wrapped element opens — a plain `<dialog>` shown via
 * `show()` works the same as a `[popover]` shown via `showPopover()`.
 */
export const Dialog: Story = {
  render: () => html`
    <div style="min-block-size: 20rem;">
      <button
        id="use-anchored-dialog-trigger"
        @click=${(event: Event) => {
          (event.target as HTMLElement).nextElementSibling?.querySelector("dialog")?.show();
        }}
      >
        Open
      </button>
      <use-anchored target="use-anchored-dialog-trigger">
        <dialog style="padding: 1rem; margin: 0;">
          <p>A plain &lt;dialog&gt;, positioned like any other anchored element.</p>
          <button
            type="button"
            @click=${(event: Event) => (event.target as HTMLElement).closest("dialog")?.close()}
          >
            Close
          </button>
        </dialog>
      </use-anchored>
    </div>
  `,
};

/**
 * A native `<dialog>` opened via `showModal()` is focus-trapped and backdrop-inert for free —
 * no hand-rolled focus trap required. Wrapping it in `use-anchored` positions it the same as any
 * other anchored content.
 */
export const FocusTrappedDialog: Story = {
  render: () => html`
    <div style="min-block-size: 20rem;">
      <button
        id="use-anchored-modal-trigger"
        @click=${(event: Event) => {
          (event.target as HTMLElement).nextElementSibling?.querySelector("dialog")?.showModal();
        }}
      >
        Open
      </button>
      <use-anchored target="use-anchored-modal-trigger">
        <dialog style="padding: 1rem; margin: 0;">
          <p>
            Tab is trapped inside this dialog, and the page behind it is inert — both native to
            <code>showModal()</code>, no hand-rolled focus trap required.
          </p>
          <button
            type="button"
            @click=${(event: Event) => (event.target as HTMLElement).closest("dialog")?.close()}
          >
            Close
          </button>
        </dialog>
      </use-anchored>
    </div>
  `,
};

/**
 * A `[popover]` left at its default `popover="auto"` light-dismisses — Escape or an outside
 * click closes it — and the Popover API restores focus to whatever had it beforehand on its
 * own, natively, the same way `<dialog>` does. Tab into the field below, then press Escape:
 * focus lands back on "Open" without any focus-management code here or in `use-anchored`.
 */
export const SoftDismiss: Story = {
  render: () => html`
    <div style="min-block-size: 20rem;">
      <button id="use-anchored-soft-dismiss-trigger" popovertarget="use-anchored-soft-dismiss">
        Open
      </button>
      <use-anchored target="use-anchored-soft-dismiss-trigger">
        <div id="use-anchored-soft-dismiss" popover style="padding: 1rem; margin: 0;">
          <p style="margin-block-start: 0;">Escape or click outside to dismiss.</p>
          <input type="text" placeholder="Tab here, then press Escape" />
        </div>
      </use-anchored>
    </div>
  `,
};

/**
 * `anchoralign` is authored `"<block> <inline>"`, identical semantics to `use-menu`'s own
 * `anchoralign`. The default, `end start`, opens below the anchor with inline-start edges
 * aligned.
 */
export const AnchorAlignments: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 2rem; flex-wrap: wrap; padding-block: 8rem; min-block-size: 28rem;"
    >
      ${(["end start", "end end", "start start", "start end"] as const).map(
        (anchoralign) => html`
          <div>
            <button
              id="align-trigger-${anchoralign.replace(" ", "-")}"
              popovertarget="align-${anchoralign.replace(" ", "-")}"
            >
              ${anchoralign}
            </button>
            <use-anchored
              target="align-trigger-${anchoralign.replace(" ", "-")}"
              anchoralign=${anchoralign}
            >
              <div
                id="align-${anchoralign.replace(" ", "-")}"
                popover
                style="padding: 1rem; margin: 0;"
              >
                ${anchoralign}
              </div>
            </use-anchored>
          </div>
        `,
      )}
    </div>
  `,
};

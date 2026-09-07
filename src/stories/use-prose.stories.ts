import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const plate =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='200'%3E%3Crect width='640' height='200' fill='%23cbd5e1'/%3E%3C/svg%3E";

const meta: Meta = {
  title: "Design System/use-prose",
  tags: ["autodocs", "!dev", "utility"],
  // Like `use-layout`, this page documents the theme itself — escaped, a `use-prose` is an
  // unstyled inline element and every example renders as nothing. See `.storybook/preview.ts`.
  parameters: {
    allowTheme: true,
    docs: {
      description: {
        component: [
          "`use-prose` gives a block of authored text a typographic scale — a heading ramp, the rhythm between blocks, list indentation, quotes, code blocks, rules and tables. Like `use-layout` and `use-field` it is styled by tag name but is **not** a registered custom element, so it needs the design-system stylesheet loaded.",
          "",
          "This is the only place the system sets any of that. Outside a `use-prose`, `<h1>`–`<h6>`, `<p>` and `<ul>` keep the browser's own defaults, so adopting the design system never silently restyles an app's existing copy — you opt a region of text in.",
          "",
          "Everything is matched by descent, so `<article>`, `<section>`, `<div>` and `<li>` are transparent at any depth — rendered markdown nests freely and still reads as prose. Use `<article>` for the document semantics; `use-prose` only supplies the typography.",
          "",
          "Spacing is stated as the gap *between* blocks rather than a margin on each, so a heading's room above it is written once instead of emerging from two margins colliding. The first block in any container therefore has no leading margin, and prose drops into a layout region without fighting its padding.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * One `use-prose` wraps the whole document. Everything inside — headings, paragraphs, lists, a quote, a code block, a rule, a table and a figure — is reached by descent through the `<article>`.
 */
export const Document: Story = {
  render: () => html`
    <use-prose>
      <article>
        <h1>On keeping a field notebook</h1>
        <p>
          The point of a field notebook is not to be complete. It is to be honest about what you
          saw, in the order you saw it, before the shape of the thing you expected has a chance to
          rearrange your memory of it.
        </p>

        <h2>What to write down</h2>
        <p>Write down the weather. You will never think it matters, and it always does.</p>
        <ul>
          <li>The date, the place, and the time you started.</li>
          <li>
            What you were looking for, before you found anything.
            <ul>
              <li>Nested lists inherit the indent and nothing else.</li>
            </ul>
          </li>
          <li>What you found instead.</li>
        </ul>

        <h3>On being wrong in ink</h3>
        <blockquote>
          <p>
            Do not erase. A crossed-out guess is evidence; a clean page is a story you told yourself
            afterwards.
          </p>
        </blockquote>
        <ol>
          <li>Record first.</li>
          <li>Interpret second.</li>
        </ol>
        <pre><code>vp check --fix
vp test</code></pre>

        <hr />

        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Spacing above</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paragraph, list, quote</td>
              <td>One flow gap</td>
            </tr>
            <tr>
              <td>Heading</td>
              <td>A larger gap, to open a section</td>
            </tr>
          </tbody>
        </table>

        <figure>
          <img src=${plate} alt="" />
          <figcaption>A figure's caption steps down in size and colour.</figcaption>
        </figure>
      </article>
    </use-prose>
  `,
};

/**
 * `h1` through `h6` each get a size and an explicit line box, so a document's structure reads at a glance and stacked headings keep a predictable height.
 */
export const HeadingRamp: Story = {
  render: () => html`
    <use-prose>
      <h1>Heading level one</h1>
      <h2>Heading level two</h2>
      <h3>Heading level three</h3>
      <h4>Heading level four</h4>
      <h5>Heading level five</h5>
      <h6>Heading level six</h6>
      <p>Body copy, for comparison.</p>
    </use-prose>
  `,
};

/**
 * Prose reaches every descendant, so flow content inside a nested component picks up prose's rhythm too. That's a known rough edge rather than a design: drawing the boundary properly means listing every `use-` element to stop at, which is more upkeep than the problem currently justifies. Wrap the exception in `<use-theme-escape>` if it gets in the way.
 */
export const NestedComponent: Story = {
  render: () => html`
    <use-prose>
      <h2>A heading in prose</h2>
      <p>This paragraph is on the prose rhythm.</p>
      <use-layout class="card" style="max-inline-size: 22rem">
        <header>
          <hgroup>
            <h4>A heading in a card</h4>
            <p>The card owns its own spacing</p>
          </hgroup>
        </header>
        <main>
          <p>Body copy inside the card.</p>
        </main>
      </use-layout>
      <p>Prose picks up again afterwards.</p>
    </use-prose>
  `,
};

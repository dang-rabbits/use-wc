import { LitElement } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

type Direction = "column" | "row";
type Align = "" | "start" | "center" | "end" | "stretch";
type Justify = "" | "start" | "center" | "end" | "space-between" | "space-around";
type Gap = "" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type PaddingToken = "" | "none" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type NamedPaddingToken = Exclude<PaddingToken, "">;
type Padding = PaddingToken | `${NamedPaddingToken} ${NamedPaddingToken}`;

function omitEmptyAttribute(value: string) {
  return value ? value : null;
}

function readStringAttribute(value: string | null) {
  return value ?? "";
}

/**
 * `use-layout` is a configurable flex-container primitive, styled entirely by the design
 * system's theme layer (`theme/layout.css`) rather than by any shadow DOM here — this element
 * renders its light-DOM children exactly as given and exists only to give its attributes real,
 * typed properties, so an author gets autocomplete and a type checker gets something to check
 * instead of a bag of untyped strings.
 *
 * Direction, alignment, justification, named gap/padding scales, wrapping, and inline vs. block
 * display are all driven by these properties, reflected onto the matching attribute for the
 * theme's CSS to read. Five variant classes (`page`, `entry`, `message`, `card`, `media`) and
 * their modifiers (`.divided`, `.compact`, `.outlined`, `.flush`) stay plain classes rather than
 * properties here — the same as any other themed class in this system, like `use-avatar`'s
 * `.circle`/`.square`.
 *
 * ```html
 * <use-layout direction="row" gap="small">
 *   <button type="button">One</button>
 *   <button type="button">Two</button>
 * </use-layout>
 * ```
 *
 * When a direct child `use-layout` carries `fill`, that child grows to consume the remaining
 * space and its siblings are pinned so they can't shrink; with no such child, `use-layout` is a
 * bare flex container that leaves its children alone.
 *
 * @attr direction - `column` (the default) or `row`.
 * @attr align - Maps to `align-items`: `start`, `center`, `end`, or `stretch`. Left empty, no
 *   attribute is set and the browser's own default applies.
 * @attr justify - Maps to `justify-content`: `start`, `center`, `end`, `space-between`, or
 *   `space-around`. Left empty, no attribute is set.
 * @attr gap - A named scale from `xsmall` to `super`. Left empty, no attribute is set and the
 *   container has no gap of its own.
 * @attr padding - A named scale from `xsmall` to `super`, or `none` for an explicit zero, applied
 *   to all four sides. Two space-separated tokens set `padding-block` and `padding-inline`
 *   separately instead — `padding="medium small"` reads the same as CSS's own two-value `padding`
 *   shorthand (block first, then inline) — but that compound form only resolves once this element
 *   is upgraded: it's parsed here and re-expressed as the `padding-block`/`padding-inline`
 *   attributes below, since a plain CSS attribute selector can't tell one word in a value from
 *   another. A single token needs no such parsing and works whether or not this element is
 *   registered, the same as every other attribute here.
 * @attr padding-block - A named scale from `xsmall` to `super`, or `none`, applied to the block
 *   axis only. Left empty, no attribute is set.
 * @attr padding-inline - A named scale from `xsmall` to `super`, or `none`, applied to the inline
 *   axis only. Left empty, no attribute is set.
 * @attr wrap - Maps to `flex-wrap: wrap`.
 * @attr inline - Renders as `inline-flex` rather than `flex`.
 * @attr fill - Read only on a direct child `use-layout`: that child grows to fill the remaining
 *   space and every other child is pinned so it can't shrink.
 * @slot - The container's content. Untouched otherwise — `use-layout` renders no shadow DOM and
 *   arranges its children with CSS alone.
 */
@customElement("use-layout")
export class UseLayout extends LitElement {
  @property({
    reflect: true,
    converter: {
      toAttribute: (value: Direction) => (value === "row" ? "row" : null),
      fromAttribute: (value: string | null) => (value === "row" ? "row" : "column"),
    },
  })
  direction: Direction = "column";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  align: Align = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  justify: Justify = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  gap: Gap = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  padding: Padding = "";

  @property({
    attribute: "padding-block",
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  paddingBlock: PaddingToken = "";

  @property({
    attribute: "padding-inline",
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  paddingInline: PaddingToken = "";

  @property({ type: Boolean, reflect: true })
  wrap = false;

  @property({ type: Boolean, reflect: true })
  inline = false;

  @property({ type: Boolean, reflect: true })
  fill = false;

  createRenderRoot() {
    return this;
  }

  // A two-token `padding` ("<block> <inline>") can't be resolved by a plain CSS attribute
  // selector — `[padding="medium small"]` would need one exact-match rule per combination to
  // stay pure CSS — so it's split here instead and re-expressed as the `padding-block`/
  // `padding-inline` properties, reusing their own attribute-selector rules rather than adding
  // any CSS of its own. A single-token `padding` needs no parsing and is left to the plain
  // `[padding="…"]` rule, so it still works before this element ever upgrades. Done in
  // `willUpdate`, before this pass renders/reflects, so deriving one property from another
  // doesn't schedule a second update cycle the way doing it in `updated` would.
  willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    if (!changedProperties.has("padding")) {
      return;
    }

    const tokens = this.padding.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 2) {
      const [blockToken, inlineToken] = tokens as [NamedPaddingToken, NamedPaddingToken];
      this.paddingBlock = blockToken;
      this.paddingInline = inlineToken;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-layout": UseLayout;
  }
}

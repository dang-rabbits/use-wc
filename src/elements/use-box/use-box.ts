import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

type Direction = "column" | "row";
type Align = "" | "start" | "center" | "end" | "stretch";
type Justify = "" | "start" | "center" | "end" | "space-between" | "space-around";
type Spacing = "" | "none" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type Gutter = "" | "none" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type Padding = "" | "none" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type Gap = "" | "xsmall" | "small" | "medium" | "large" | "xlarge" | "super";
type Divided = "" | "true" | "full";

function omitEmptyAttribute(value: string) {
  return value ? value : null;
}

function readStringAttribute(value: string | null) {
  return value ?? "";
}

/**
 * `use-box` is a test component styled entirely by the design system's theme layer
 * (`theme/box.css`) rather than by any shadow DOM here — this element renders its light-DOM
 * children exactly as given and exists only to give its attributes real, typed properties.
 *
 * ```html
 * <use-box spacing="medium">
 *   <p>First</p>
 *   <p>Middle</p>
 *   <p>Last</p>
 * </use-box>
 * ```
 *
 * @attr spacing - A named scale from `xsmall` to `super`, or `none`. Puts half its value as
 *   padding on every direct child along the box's main axis — block padding by default, or
 *   inline padding when `direction="row"` — so two adjacent children's touching edges add up to
 *   one spacing unit between them. The first child's own leading side and the last child's own
 *   trailing side on that axis are forced to zero, so the box carries no outer inset of its own
 *   there. Left empty, no attribute is set and children carry no padding at all. Reach for this
 *   instead of `gap` when a direct child is its own scroll container (`overflow`) holding
 *   focusable content: a focus ring at that content's edge spills into the child's padding, and
 *   the child's scrollport clips anything beyond it. `gap` leaves the child with no padding, so
 *   the ring gets cut off. `spacing` gives it room between children, but not on the first
 *   child's leading side or the last child's trailing side, which stay at zero.
 * @attr gutter - A named scale from `xsmall` to `super`, or `none`. Puts its full value as
 *   padding on every direct child along the box's cross axis — inline padding by default, or
 *   block padding when `direction="row"` — uniformly, no halving, no first/last exception,
 *   since there's nothing side-by-side on that axis for two children to double up with. Left
 *   empty, no attribute is set and children carry no cross-axis padding at all. Reach for this
 *   instead of the box's own `padding` when a direct child is itself a scroll container
 *   (`overflow`) and can show a focus ring near its own cross-axis edges: the box's `padding`
 *   sits outside the child, so the child's own scrollport still clips the ring. `gutter`'s
 *   padding is added directly to the child, so the ring has room inside it on both cross-axis
 *   sides.
 * @attr padding - A named scale from `xsmall` to `super`, or `none`, applied to the box's own
 *   padding on all four sides. Left empty, no attribute is set. Set `paddingblock`/
 *   `paddinginline` instead for different values per axis.
 * @attr paddingblock - A named scale from `xsmall` to `super`, or `none`, applied to the box's
 *   own block padding only. Left empty, no attribute is set.
 * @attr paddinginline - A named scale from `xsmall` to `super`, or `none`, applied to the box's
 *   own inline padding only. Left empty, no attribute is set.
 * @attr gap - A named scale from `xsmall` to `super`, applied to the box's own real `gap` CSS
 *   property. Left empty, no attribute is set and the box has no gap of its own.
 * @attr divided - Boolean, or `full`. Draws a rule on every child that follows another one — the
 *   first child never gets one, since there's nothing before it to divide from. Drawn as a plain
 *   border on the box's main axis leading edge — `border-block-start` by default, or
 *   `border-inline-start` when `direction="row"` — whenever `spacing` is set or no real `gap`
 *   exists to draw into (each child owns its own padding there instead) — but when `gap` is set
 *   and `spacing` isn't, drawn natively into the real gap via CSS Gap Decorations on browsers
 *   that support it: `row-rule` by default, or `column-rule` when `direction="row"`. Set to
 *   `full` to additionally bleed that native rule through the box's own padding on the cross
 *   axis, so it reaches the box's outer edge instead of stopping at the padding — only has an
 *   effect when both `gap` and padding (`padding`, or `paddinginline`/`paddingblock` on the
 *   relevant axis) are set.
 * @attr direction - `column` (the default) or `row`, mapped to `flex-direction`. `use-box` is a
 *   flex container by default now that this exists to set.
 * @attr align - Maps to `align-items`: `start`, `center`, `end`, or `stretch`. Left empty, no
 *   attribute is set and the browser's own default applies.
 * @attr justify - Maps to `justify-content`: `start`, `center`, `end`, `space-between`, or
 *   `space-around`. Left empty, no attribute is set.
 * @slot - The box's content. Untouched otherwise — `use-box` renders no shadow DOM and arranges
 *   its children with CSS alone.
 */
@customElement("use-box")
export class UseBox extends LitElement {
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
  spacing: Spacing = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  gutter: Gutter = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  padding: Padding = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  paddingBlock: Padding = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  paddingInline: Padding = "";

  @property({
    reflect: true,
    converter: { toAttribute: omitEmptyAttribute, fromAttribute: readStringAttribute },
  })
  gap: Gap = "";

  @property({
    reflect: true,
    converter: {
      toAttribute: (value: Divided) => (value === "" ? null : value === "full" ? "full" : ""),
      fromAttribute: (value: string | null) =>
        value === null ? "" : value === "full" ? "full" : "true",
    },
  })
  divided: Divided = "";

  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-box": UseBox;
  }
}

import { unsafeCSS } from "lit";
import type { CSSResult } from "lit";

const ANCHORALIGN_POSITION_AREAS: Record<string, string> = {
  "end end": "block-end span-inline-start",
  "start start": "block-start span-inline-end",
  "start end": "block-start span-inline-start",
};

/**
 * Generates the `position-area` rules shared by every anchored component — `use-menu` and
 * `use-anchored` both use CSS anchor positioning the same way, the same `anchoralign` values, and
 * the same `position-try` flip fallback chain. What differs between them is *what* gets
 * positioned: `use-menu`'s host is the positioned element itself, so its rules read
 * `:host(:popover-open)`; `use-anchored` wraps a slotted child instead, so its rules read
 * `:host ::slotted(:is([open], :popover-open))`. Rather than force one shape onto the other —
 * which for `use-menu` would mean wrapping its menu items in a slotted popover element,
 * reintroducing the shadow/slot Tab-order and focus problems `use-popover` had to work around by
 * hand — each component supplies its own selector pieces and this fills in the shared
 * `position-area` logic between them.
 *
 * `position-anchor` itself isn't declared here — `AnchorController` writes it directly as an
 * `important` inline style. See its docblock for why: a `var()`-driven `position-anchor` fails
 * to link on a popover-promoted shadow host, ruling that out as an option here.
 *
 * @param hostCondition - The `:host()` argument, e.g. `:popover-open`. Combined with
 * `[anchoralign="…"]` for the alignment variants. Omit for no extra condition (bare `:host`).
 * @param targetSuffix - Anything after `:host(...)` that selects the actual positioned element,
 * e.g. `` (empty, host is the target) or ` ::slotted(:is([open], :popover-open))`.
 */
export function anchorPositioningStyles(
  hostCondition: string = "",
  targetSuffix: string = "",
): CSSResult {
  const hostSelector = hostCondition ? `:host(${hostCondition})` : ":host";

  const variants = Object.entries(ANCHORALIGN_POSITION_AREAS)
    .map(
      ([anchoralign, positionArea]) => `
        :host([anchoralign="${anchoralign}"]${hostCondition})${targetSuffix} {
          position-area: ${positionArea};
        }
      `,
    )
    .join("\n");

  return unsafeCSS(`
    ${hostSelector}${targetSuffix} {
      inset: unset;
      position: fixed;
      position-area: block-end span-inline-end;
      position-try:
        flip-block,
        flip-inline,
        flip-inline flip-block;
    }

    ${variants}
  `);
}

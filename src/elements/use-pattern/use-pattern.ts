import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/**
 * `use-pattern` arranges a region-based unit of content — a card, a row in a list, a chat
 * message, a media object — styled entirely by the design system's theme layer
 * (`theme/pattern.css`) rather than by any shadow DOM here. It renders its light-DOM children
 * exactly as given.
 *
 * Its variant classes (`card`, `entry`, `message`, `media`) and their modifiers (`.divided`,
 * `.compact`, `.outlined`, `.flush`) are plain classes rather than properties, the same as any
 * other themed class in this system, like `use-avatar`'s `.circle`/`.square`. For generic flex
 * arrangement, or a page frame, use `use-layout`, which nests freely inside a pattern's regions.
 *
 * ```html
 * <use-pattern class="card">
 *   <header>
 *     <hgroup><h3>Title</h3><p>Subtitle</p></hgroup>
 *   </header>
 *   <main><p>Body</p></main>
 *   <footer><button type="button">Done</button></footer>
 * </use-pattern>
 * ```
 *
 * @slot - The pattern's regions — `figure`, `header`, `main`, `footer`, or any other element.
 */
@customElement("use-pattern")
export class UsePattern extends LitElement {
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "use-pattern": UsePattern;
  }
}

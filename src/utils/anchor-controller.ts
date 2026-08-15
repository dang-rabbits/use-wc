import type { ReactiveController, ReactiveControllerHost } from "lit";

function generateAnchorName(namePrefix: string) {
  return `${namePrefix}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Anchors an element to another element using CSS anchor positioning, publishing an
 * `anchor-name` onto the target and a matching `position-anchor` onto the positioned element.
 *
 * The positioned element defaults to the host itself — the common case, where the host *is*
 * the thing being positioned (`use-menu`, for instance). Pass a different element explicitly
 * when the actual positioned box lives elsewhere — `use-anchored` positions its slotted child,
 * not its own `display: contents` host.
 *
 * Some components — `use-caret` among them — render their host as `display: contents`,
 * which has no box of its own for CSS anchor positioning to resolve against. If the target
 * computes a non-empty `--usewc-anchor-name` custom property, the controller uses that
 * dashed-ident directly instead of generating and writing its own onto the target — letting a
 * component publish the name of a real, box-generating part of itself for other components to
 * target instead of its host, even though that part lives inside the component's own shadow
 * root.
 *
 * Both `anchor-name` and `position-anchor` are written with `important` priority. This isn't
 * about outranking page authors — it's so the link survives `use-theme-escape`'s Storybook demo
 * scaffold, which sweeps `all: revert-layer !important` across light-DOM descendants to render
 * unstyled native defaults. A plain (non-important) inline value loses to that sweep with
 * nothing to roll back to, reverting to "none"/"normal" instead of surviving. Routing either
 * property through a `var()`-driven custom property instead — the more obvious-looking fix —
 * doesn't work here: Chromium's anchor-positioning engine fails to register the anchor link when
 * `position-anchor`'s value comes from a custom property on an element that is itself promoted
 * to the top layer via `showPopover()`, exactly `use-menu`'s own shape, even though
 * `getComputedStyle` reports the correct resolved value. `important` on the plain properties
 * sidesteps both problems at once.
 *
 * Sets the `anchored` custom state on the host's `ElementInternals` once a target is resolved.
 */
export class AnchorController implements ReactiveController {
  #host: ReactiveControllerHost & HTMLElement;
  #internals: ElementInternals;
  #positionedElement: HTMLElement;
  #anchorName: string;
  #anchorElement: Element | null = null;
  #usingPublishedAnchorName = false;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    internals: ElementInternals,
    namePrefix: string,
    positionedElement: HTMLElement = host,
  ) {
    this.#host = host;
    this.#internals = internals;
    this.#positionedElement = positionedElement;
    this.#anchorName = generateAnchorName(namePrefix);
    host.addController(this);
  }

  get anchorElement() {
    return this.#anchorElement;
  }

  set anchorElement(element: Element | null) {
    this.#detachAnchor();
    this.#anchorElement = element;
    this.#attachAnchor();
  }

  /**
   * Resolves the anchor element from an id, looked up in the host's own root node, and attaches
   * to it. Pass `undefined` to detach without resolving a new target.
   */
  resolve(targetId: string | undefined) {
    this.#detachAnchor();

    if (targetId) {
      const root = this.#host.getRootNode() as Document | ShadowRoot;
      this.#anchorElement = root.getElementById(targetId);
    }

    this.#attachAnchor();
  }

  hostDisconnected() {
    this.#detachAnchor();
  }

  #attachAnchor() {
    if (!(this.#anchorElement instanceof HTMLElement)) {
      this.#positionedElement.style.removeProperty("position-anchor");
      this.#internals.states.delete("anchored");
      return;
    }

    const publishedAnchorName = getComputedStyle(this.#anchorElement)
      .getPropertyValue("--usewc-anchor-name")
      .trim();

    if (publishedAnchorName) {
      this.#usingPublishedAnchorName = true;
      this.#positionedElement.style.setProperty(
        "position-anchor",
        publishedAnchorName,
        "important",
      );
    } else {
      this.#usingPublishedAnchorName = false;

      const existingAnchorNames = getComputedStyle(this.#anchorElement).getPropertyValue(
        "anchor-name",
      );
      const anchorNames: string[] =
        existingAnchorNames === "none"
          ? []
          : existingAnchorNames.split(",").map((name) => name.trim());
      anchorNames.push(this.#anchorName);

      this.#anchorElement.style.setProperty("anchor-name", anchorNames.join(", "));
      this.#positionedElement.style.setProperty("position-anchor", this.#anchorName);
    }

    this.#internals.states.add("anchored");
  }

  #detachAnchor() {
    if (this.#anchorElement instanceof HTMLElement && !this.#usingPublishedAnchorName) {
      const anchorNames: string[] = getComputedStyle(this.#anchorElement)
        .getPropertyValue("anchor-name")
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name && name !== this.#anchorName);
      if (anchorNames.length > 0) {
        this.#anchorElement.style.setProperty("anchor-name", anchorNames.join(", "), "important");
      } else {
        this.#anchorElement.style.removeProperty("anchor-name");
      }
    }

    this.#anchorElement = null;
    this.#usingPublishedAnchorName = false;
    this.#positionedElement.style.removeProperty("position-anchor");
    this.#internals.states.delete("anchored");
  }
}

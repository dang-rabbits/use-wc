import { createElement, Fragment, useEffect, useMemo, useRef } from "react";
import { Heading, Markdown, useOf } from "@storybook/addon-docs/blocks";
import { render } from "lit";
import {
  nativeThemeTokens,
  themeTokensFor,
  tokenReference,
} from "../src/stories/design-token-reference";

const nativeElementsTitle = "Design System/Native Elements";
const description =
  "The semantic tokens this theme reads, previewed in light and dark. Override any of them on `:root` or an ancestor to retheme it.";

const noTokens = { tokens: [], sharedGroups: [] };

function tokensForTitle(title: string) {
  if (title === nativeElementsTitle) {
    return nativeThemeTokens();
  }
  const tagName = title.split("/").pop()!;
  return /^use-[a-z][a-z0-9-]*$/.test(tagName) ? themeTokensFor(tagName) : noTokens;
}

function sharedGroupsNote(sharedGroups: string[], hasOwnTokens: boolean) {
  const groups = sharedGroups.map((group) => `\`${group}\``).join(", ");
  const lead = hasOwnTokens ? "It also reads" : "This theme reads only";
  return `${lead} shared tokens from ${groups}; find them in the [Tokens reference](?path=/docs/design-system-tokens--docs).`;
}

export function ThemeTokens() {
  const resolvedMeta = useOf("meta");
  const title = resolvedMeta.type === "meta" ? resolvedMeta.preparedMeta.title : "";
  const { tokens, sharedGroups } = useMemo(() => tokensForTitle(title), [title]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && tokens.length > 0) {
      render(tokenReference(tokens), containerRef.current);
    }
  }, [tokens]);

  if (tokens.length === 0 && sharedGroups.length === 0) {
    return null;
  }
  return createElement(
    Fragment,
    null,
    createElement(Heading, null, "Theme tokens"),
    tokens.length > 0 ? createElement(Markdown, null, description) : null,
    tokens.length > 0
      ? createElement("div", { ref: containerRef, className: "sb-unstyled" })
      : null,
    sharedGroups.length > 0
      ? createElement(Markdown, null, sharedGroupsNote(sharedGroups, tokens.length > 0))
      : null,
  );
}

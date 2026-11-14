import { html, nothing, type TemplateResult } from "lit";
import semanticStylesheet from "../styles/tokens/semantic.css?raw";
import {
  groupByComponent,
  parseDesignTokens,
  tokensForElement,
  tokensForNativeElements,
  type DesignToken,
} from "./design-tokens.ts";

interface ResolvedToken extends DesignToken {
  light: string;
  dark: string;
}

type PreviewKind =
  | "color"
  | "radius"
  | "shadow"
  | "mask"
  | "image"
  | "font-size"
  | "font-family"
  | "font-weight"
  | "length"
  | "none";

export const semanticTokens = parseDesignTokens(semanticStylesheet);

const themeStylesheets = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../styles/theme/*.css", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  ).map(([path, css]) => [path.split("/").pop()!.replace(".css", ""), css]),
);

const documentBackground = "--usewc-color-document-background";
const documentText = "--usewc-color-document-text";

function createProbe(darkScheme: boolean) {
  const probe = document.createElement("div");
  probe.hidden = true;
  for (const token of semanticTokens) {
    const value = darkScheme ? (token.darkValue ?? token.value) : token.value;
    probe.style.setProperty(token.name, value);
  }
  document.body.append(probe);
  return probe;
}

function resolveTokens(tokens: DesignToken[]) {
  const lightProbe = createProbe(false);
  const darkProbe = createProbe(true);
  const lightStyle = getComputedStyle(lightProbe);
  const darkStyle = getComputedStyle(darkProbe);
  const read = (style: CSSStyleDeclaration, name: string) => style.getPropertyValue(name).trim();

  const resolvedTokens: ResolvedToken[] = tokens.map((token) => ({
    ...token,
    light: read(lightStyle, token.name),
    dark: read(darkStyle, token.name),
  }));
  const darkScheme = {
    background: read(darkStyle, documentBackground),
    text: read(darkStyle, documentText),
  };

  lightProbe.remove();
  darkProbe.remove();
  return { resolvedTokens, darkScheme };
}

function previewKind(token: DesignToken, value: string): PreviewKind {
  const { name, category } = token;
  if (!value) {
    return "none";
  }
  if (name.includes("mask-image")) {
    return "mask";
  }
  if (name.includes("background-image")) {
    return CSS.supports("background-image", value) ? "image" : "none";
  }
  if (category === "color" && CSS.supports("color", value)) {
    return "color";
  }
  if (name.includes("radius") && CSS.supports("border-radius", value)) {
    return "radius";
  }
  if (name.includes("shadow") && CSS.supports("box-shadow", value)) {
    return "shadow";
  }
  if (category === "font") {
    if (name.endsWith("-size") && CSS.supports("font-size", value)) {
      return "font-size";
    }
    if (name.endsWith("-family")) {
      return "font-family";
    }
    if (name.endsWith("-weight") && CSS.supports("font-weight", value)) {
      return "font-weight";
    }
  }
  if (category === "layout" && !/^[a-z-]+$/.test(value) && CSS.supports("inline-size", value)) {
    return "length";
  }
  return "none";
}

function preview(token: DesignToken, value: string) {
  switch (previewKind(token, value)) {
    case "color":
      return html`<span class="swatch"><span style="background: ${value}"></span></span>`;
    case "radius":
      return html`<span class="box outlined" style="border-radius: ${value}"></span>`;
    case "shadow":
      return html`<span class="box" style="box-shadow: ${value}"></span>`;
    case "mask":
      return html`<span class="box masked" style="mask-image: ${value}"></span>`;
    case "image":
      return html`<span class="box imaged" style="background-image: ${value}"></span>`;
    case "font-size":
      return html`<span class="glyph" style="font-size: ${value}">Aa</span>`;
    case "font-family":
      return html`<span class="glyph" style="font-family: ${value}">Aa</span>`;
    case "font-weight":
      return html`<span class="glyph" style="font-weight: ${value}">Aa</span>`;
    case "length":
      return html`<span class="bar" style="inline-size: ${value}"></span>`;
    default:
      return nothing;
  }
}

async function copyTokenName(event: Event) {
  const button = event.currentTarget as HTMLButtonElement;
  await window.top?.navigator.clipboard.writeText(button.value);
  button.dataset.copied = "";
  setTimeout(() => delete button.dataset.copied, 1200);
}

function filterTokens(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const query = input.value.trim().toLowerCase();
  const reference = input.closest(".design-token-reference")!;
  for (const group of reference.querySelectorAll<HTMLElement>("section")) {
    let visibleRows = 0;
    for (const row of group.querySelectorAll<HTMLTableRowElement>("tbody tr")) {
      row.hidden = !row.dataset.token!.includes(query);
      visibleRows += row.hidden ? 0 : 1;
    }
    group.hidden = visibleRows === 0;
  }
}

const styles = html`
  <style>
    .design-token-reference {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      font-size: 0.875rem;
    }
    .design-token-reference input[type="search"] {
      max-inline-size: 24rem;
    }
    .design-token-reference h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      text-transform: capitalize;
    }
    .design-token-reference table {
      inline-size: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .design-token-reference th {
      text-align: start;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-block-end: 1px solid color-mix(in oklab, currentColor 20%, transparent);
    }
    .design-token-reference th:first-child {
      inline-size: 40%;
    }
    .design-token-reference td {
      vertical-align: top;
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid color-mix(in oklab, currentColor 10%, transparent);
    }
    .design-token-reference .token-name {
      all: unset;
      cursor: copy;
      font-family: monospace;
      font-size: 0.8125rem;
      overflow-wrap: anywhere;
    }
    .design-token-reference .token-name:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    .design-token-reference .token-name[data-copied]::after {
      content: " ✓ copied";
      opacity: 0.6;
    }
    .design-token-reference .swatch {
      display: block;
      inline-size: 3rem;
      block-size: 1.5rem;
      border-radius: 0.25rem;
      outline: 1px solid color-mix(in oklab, currentColor 20%, transparent);
      background: repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 0.5rem 0.5rem;
      overflow: hidden;
    }
    .design-token-reference .swatch > span {
      display: block;
      block-size: 100%;
    }
    .design-token-reference .box {
      display: block;
      inline-size: 2rem;
      block-size: 2rem;
      background: color-mix(in oklab, currentColor 8%, transparent);
    }
    .design-token-reference .outlined {
      background: none;
      border: 2px solid currentColor;
    }
    .design-token-reference .masked {
      background: currentColor;
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
    }
    .design-token-reference .imaged {
      background-color: transparent;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    .design-token-reference .glyph {
      line-height: 1.2;
    }
    .design-token-reference .bar {
      display: block;
      max-inline-size: 100%;
      min-inline-size: 1px;
      block-size: 0.5rem;
      border-radius: 1px;
      background: currentColor;
      opacity: 0.6;
    }
  </style>
`;

export function tokenReference(tokens: DesignToken[]): TemplateResult {
  const { resolvedTokens, darkScheme } = resolveTokens(tokens);
  const darkCellStyle = `background: ${darkScheme.background}; color: ${darkScheme.text}; color-scheme: dark`;

  return html`
    ${styles}
    <div class="design-token-reference">
      <input
        type="search"
        placeholder="Filter by name"
        aria-label="Filter tokens by name"
        @input=${filterTokens}
      />
      ${[...groupByComponent(resolvedTokens)].map(
        ([component, groupTokens]) => html`
          <section>
            <h3>${component}</h3>
            <table>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Light</th>
                  <th scope="col">Dark</th>
                </tr>
              </thead>
              <tbody>
                ${groupTokens.map(
                  (token) => html`
                    <tr data-token=${token.name}>
                      <td>
                        <button
                          type="button"
                          class="token-name"
                          value=${token.name}
                          title="Copy token name"
                          @click=${copyTokenName}
                        >
                          ${token.name}
                        </button>
                      </td>
                      <td>${preview(token, token.light)}</td>
                      <td style=${darkCellStyle}>${preview(token, token.dark)}</td>
                    </tr>
                  `,
                )}
              </tbody>
            </table>
          </section>
        `,
      )}
    </div>
  `;
}

export function themeTokensFor(tagName: string) {
  return tokensForElement(themeStylesheets, semanticTokens, tagName);
}

export function nativeThemeTokens() {
  return tokensForNativeElements(themeStylesheets, semanticTokens);
}

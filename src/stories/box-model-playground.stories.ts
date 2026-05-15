import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import "../styles/tokens.css";
import atomicCss from "../styles/tokens/atomic.css?raw";
import semanticCss from "../styles/tokens/semantic.css?raw";

const allTokens = Array.from(
  new Set(`${atomicCss}\n${semanticCss}`.match(/--usewc-[a-z0-9-]+/g) ?? []),
).sort();

function tokensMatching(...prefixes: string[]) {
  return allTokens.filter((token) => prefixes.some((prefix) => token.startsWith(prefix)));
}

const tokenLists = {
  color: tokensMatching("--usewc-color-"),
  size: tokensMatching("--usewc-size-", "--usewc-space-"),
  font: tokensMatching("--usewc-font-", "--usewc-line-height-"),
  effect: tokensMatching("--usewc-effect-", "--usewc-transition-"),
  all: allTokens,
};

type TokenCategory = "color" | "space" | "layout" | "font" | "effect";

type PlaygroundProperty = {
  name: string;
  list: keyof typeof tokenLists;
  category: TokenCategory;
  defaultValue?: string;
  stateDefaults?: Partial<Record<State, string>>;
  options?: readonly string[];
};

const layoutProperties: ReadonlyArray<PlaygroundProperty> = [
  {
    name: "box-sizing",
    list: "all",
    category: "layout",
    defaultValue: "border-box",
    options: ["content-box", "border-box"],
  },
  {
    name: "display",
    list: "all",
    category: "layout",
    defaultValue: "inline-flex",
    options: ["block", "flex", "inline-flex", "inline-block", "grid", "inline", "none"],
  },
  {
    name: "flex-direction",
    list: "all",
    category: "layout",
    defaultValue: "row",
    options: ["row", "row-reverse", "column", "column-reverse"],
  },
  {
    name: "align-items",
    list: "all",
    category: "layout",
    defaultValue: "center",
    options: ["stretch", "flex-start", "center", "flex-end", "baseline"],
  },
  {
    name: "justify-content",
    list: "all",
    category: "layout",
    defaultValue: "center",
    options: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  },
  { name: "margin-block", list: "size", category: "space" },
  { name: "margin-inline", list: "size", category: "space" },
  { name: "margin", list: "size", category: "space", defaultValue: "0" },
  {
    name: "border-size",
    list: "size",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-border)",
  },
  {
    name: "padding-block",
    list: "size",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-base-padding-block)",
  },
  {
    name: "padding-inline",
    list: "size",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-base-padding-inline)",
  },
  { name: "padding", list: "size", category: "layout" },
  {
    name: "line-height",
    list: "font",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-line-height)",
  },
  {
    name: "gap",
    list: "size",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-base-gap)",
  },
  {
    name: "font-size",
    list: "font",
    category: "layout",
    defaultValue: "var(--usewc-layout-button-base-font-size)",
  },
];

const effectProperties: ReadonlyArray<PlaygroundProperty> = [
  {
    name: "border-style",
    list: "all",
    category: "effect",
    defaultValue: "var(--usewc-effect-input-border-style)",
  },
  {
    name: "border-color",
    list: "color",
    category: "color",
    defaultValue: "var(--usewc-color-button-base-border-static)",
    stateDefaults: {
      hover: "var(--usewc-color-button-base-border-hover)",
      active: "var(--usewc-color-button-base-border-active)",
    },
  },
  {
    name: "border-radius",
    list: "effect",
    category: "effect",
    defaultValue: "var(--usewc-effect-input-border-radius)",
  },
  { name: "corner-shape", list: "all", category: "effect" },
  { name: "outline-size", list: "size", category: "effect" },
  { name: "outline-style", list: "all", category: "effect" },
  { name: "outline-color", list: "color", category: "color" },
  { name: "outline-offset", list: "size", category: "effect" },
  { name: "box-shadow", list: "effect", category: "effect" },
  {
    name: "background",
    list: "color",
    category: "color",
    defaultValue: "var(--usewc-color-button-base-background-static)",
    stateDefaults: {
      hover: "var(--usewc-color-button-base-background-hover)",
      active: "var(--usewc-color-button-base-background-active)",
    },
  },
  { name: "background-image", list: "all", category: "effect" },
  { name: "background-repeat", list: "all", category: "layout" },
  { name: "background-size", list: "size", category: "layout" },
  {
    name: "color",
    list: "color",
    category: "color",
    defaultValue: "var(--usewc-color-button-base-text-static)",
    stateDefaults: {
      hover: "var(--usewc-color-button-base-text-hover)",
      active: "var(--usewc-color-button-base-text-active)",
    },
  },
  { name: "text-decoration", list: "all", category: "effect" },
  {
    name: "font-weight",
    list: "font",
    category: "font",
    defaultValue: "var(--usewc-font-weight-normal)",
  },
  {
    name: "font-family",
    list: "font",
    category: "font",
    defaultValue: "var(--usewc-font-input-family)",
  },
  { name: "transform", list: "all", category: "effect" },
  { name: "opacity", list: "all", category: "effect" },
  { name: "cursor", list: "all", category: "effect", defaultValue: "default" },
];

const animationProperties: ReadonlyArray<PlaygroundProperty> = [
  { name: "transition", list: "effect", category: "effect" },
];

const propertyGroups: ReadonlyArray<{
  caption: string;
  properties: ReadonlyArray<PlaygroundProperty>;
}> = [
  { caption: "Layout", properties: layoutProperties },
  { caption: "Effect", properties: effectProperties },
  { caption: "Animation", properties: animationProperties },
];

const STATES = [
  "static",
  "hover",
  "focus",
  "active",
  "pressed",
  "selected",
  "checked",
  "invalid",
  "valid",
  "disabled",
  "readonly",
] as const;
type State = (typeof STATES)[number];

const STATE_ATTRIBUTES: Partial<Record<State, { attribute: string; value: string }>> = {
  pressed: { attribute: "aria-pressed", value: "true" },
  selected: { attribute: "aria-selected", value: "true" },
  checked: { attribute: "aria-checked", value: "true" },
  invalid: { attribute: "aria-invalid", value: "true" },
  valid: { attribute: "aria-invalid", value: "false" },
  disabled: { attribute: "aria-disabled", value: "true" },
  readonly: { attribute: "aria-readonly", value: "true" },
};

function stateSelectorSuffixes(state: State): readonly string[] {
  switch (state) {
    case "static":
      return [""];
    case "hover":
      return [":hover"];
    case "focus":
      return [":focus", ":focus-visible"];
    case "active":
      return [":active"];
    default: {
      const attributeInfo = STATE_ATTRIBUTES[state];
      return attributeInfo ? [`[${attributeInfo.attribute}="${attributeInfo.value}"]`] : [""];
    }
  }
}

const STYLE_ID = "box-model-playground-style";
const GENERATED_ID = "box-model-playground-generated";
const DIMENSIONS_ID = "box-model-playground-dimensions";
const BOX_CLASS = "box-model-playground-box";
const PARENT_CLASS = "box-model-playground-parent";
const STORAGE_KEY = "box-model-playground-values-v4";

const cssPropertyOverrides: Record<string, string> = {
  "border-size": "border-width",
  "outline-size": "outline-width",
};

function cssPropertyFor(property: string) {
  return cssPropertyOverrides[property] ?? property;
}

function saveValues(form: HTMLFormElement) {
  const values: Record<string, string> = {};
  for (const [key, raw] of new FormData(form).entries()) {
    values[key] = String(raw);
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // localStorage may be unavailable (private mode, sandboxed iframe)
  }
}

function restoreValues(form: HTMLFormElement) {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return;
  }
  if (!stored) return;
  let values: Record<string, string>;
  try {
    values = JSON.parse(stored);
  } catch {
    return;
  }
  for (const [key, value] of Object.entries(values)) {
    const field = form.elements.namedItem(key);
    if (field instanceof HTMLInputElement) {
      if (field.type === "checkbox") {
        field.checked = true;
      } else {
        field.value = value;
      }
    } else if (field instanceof HTMLSelectElement || field instanceof RadioNodeList) {
      field.value = value;
    }
  }
}

function getActiveState(form: HTMLFormElement): State {
  const field = form.elements.namedItem("__state");
  const value = field instanceof RadioNodeList ? field.value : "";
  return (STATES as readonly string[]).includes(value) ? (value as State) : "static";
}

function getScope(form: HTMLFormElement, state: State): "self" | "parent" {
  const field = form.elements.namedItem(`scope:${state}`);
  return field instanceof HTMLSelectElement && field.value === "parent" ? "parent" : "self";
}

function collectValues(formData: FormData) {
  const byState: Partial<Record<State, Record<string, string>>> = {};
  for (const [key, raw] of formData.entries()) {
    if (key.startsWith("__") || key.startsWith("scope:")) continue;
    const value = String(raw).trim();
    if (!value) continue;
    const separator = key.lastIndexOf(":");
    if (separator === -1) continue;
    const property = key.slice(0, separator);
    const state = key.slice(separator + 1) as State;
    if (!(STATES as readonly string[]).includes(state)) continue;
    (byState[state] ??= {})[cssPropertyFor(property)] = value;
  }
  return byState;
}

function renderBlock(properties: Record<string, string>) {
  return Object.entries(properties)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
}

const COLOR_REMAP_PARTS = ["background", "border", "text"] as const;
const COLOR_REMAP_STATES = ["static", "hover", "active"] as const;
const SIZE_REMAP_PROPERTIES = ["padding-block", "padding-inline", "gap", "font-size"] as const;

function applyVariantRemap(staticProps: Record<string, string>, variant: string) {
  const trimmed = variant.trim();
  if (!trimmed || trimmed === "base") return;
  for (const part of COLOR_REMAP_PARTS) {
    for (const state of COLOR_REMAP_STATES) {
      const key = `--usewc-color-button-base-${part}-${state}`;
      staticProps[key] = `var(--usewc-color-button-${trimmed}-${part}-${state})`;
    }
  }
}

function applySizeRemap(staticProps: Record<string, string>, size: string) {
  const trimmed = size.trim();
  if (!trimmed || trimmed === "base" || trimmed === "medium") return;
  for (const property of SIZE_REMAP_PROPERTIES) {
    staticProps[`--usewc-layout-button-base-${property}`] =
      `var(--usewc-layout-button-${trimmed}-${property})`;
  }
  staticProps["--usewc-layout-button-line-height"] =
    `var(--usewc-layout-button-${trimmed}-line-height)`;
}

function getMacroValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field.value : "";
}

function buildStylesheet(form: HTMLFormElement) {
  const byState = collectValues(new FormData(form));
  const staticProps = (byState.static ??= {});
  applyVariantRemap(staticProps, getMacroValue(form, "__variant"));
  applySizeRemap(staticProps, getMacroValue(form, "__size"));
  const blocks: string[] = [];
  for (const state of STATES) {
    const properties = byState[state];
    if (!properties || Object.keys(properties).length === 0) continue;
    const scope = state === "static" ? "self" : getScope(form, state);
    const selectors = stateSelectorSuffixes(state).map((suffix) =>
      scope === "parent" ? `.${PARENT_CLASS}${suffix} .${BOX_CLASS}` : `.${BOX_CLASS}${suffix}`,
    );
    blocks.push(`${selectors.join(",\n")} {\n${renderBlock(properties)}\n}`);
  }
  return blocks.join("\n\n");
}

function syncPanels(form: HTMLFormElement, root: Document | ShadowRoot) {
  const activeState = getActiveState(form);
  root.querySelectorAll<HTMLElement>("[data-state-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.statePanel !== activeState;
  });
}

function updatePreview(form: HTMLFormElement, root: Document | ShadowRoot) {
  const box = root.querySelector<HTMLElement>(`.${BOX_CLASS}`);
  const parent = root.querySelector<HTMLElement>(`.${PARENT_CLASS}`);
  for (const { attribute } of Object.values(STATE_ATTRIBUTES)) {
    box?.removeAttribute(attribute);
    parent?.removeAttribute(attribute);
  }
  const activeState = getActiveState(form);
  const attributeInfo = STATE_ATTRIBUTES[activeState];
  if (!attributeInfo) return;
  const checkbox = form.elements.namedItem(`__preview-${activeState}`);
  if (!(checkbox instanceof HTMLInputElement) || !checkbox.checked) return;
  const target = getScope(form, activeState) === "parent" ? parent : box;
  target?.setAttribute(attributeInfo.attribute, attributeInfo.value);
}

function updateTokenDisplays(form: HTMLFormElement, root: Document | ShadowRoot) {
  const component = getMacroValue(form, "__component").trim();
  const part = getMacroValue(form, "__part").trim();
  const variant = getMacroValue(form, "__variant").trim();
  const codes = root.querySelectorAll<HTMLElement>("[data-token-display]");
  codes.forEach((code) => {
    const fieldName = code.dataset.tokenDisplay ?? "";
    const propertyName = code.dataset.property ?? "";
    const category = code.dataset.category ?? "";
    const state = code.dataset.state ?? "";
    const stateSegment = state === "static" ? "" : state;
    const tokenName = ["--usewc", category, component, part, variant, propertyName, stateSegment]
      .filter(Boolean)
      .join("-");
    const field = form.elements.namedItem(fieldName);
    let value = "";
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
      value = field.value;
    }
    code.textContent = value ? `${tokenName}: ${value};` : tokenName;
  });
}

function applyStylesheet(form: HTMLFormElement) {
  const stylesheet = buildStylesheet(form);
  const root = form.getRootNode() as Document | ShadowRoot;
  const host = (root as Document).head ?? form.parentElement ?? form;
  let styleNode = (root as Document).getElementById?.(STYLE_ID) as HTMLStyleElement | null;
  if (!styleNode) {
    styleNode = document.createElement("style");
    styleNode.id = STYLE_ID;
    host.appendChild(styleNode);
  }
  styleNode.textContent = stylesheet;

  const generated = (root as Document).getElementById?.(GENERATED_ID) as HTMLPreElement | null;
  if (generated) {
    generated.textContent = stylesheet || "/* (no values yet) */";
  }

  syncPanels(form, root);
  updatePreview(form, root);
  updateTokenDisplays(form, root);

  const box = (root as Document).querySelector?.(`.${BOX_CLASS}`) as HTMLElement | null;
  const dimensions = (root as Document).getElementById?.(DIMENSIONS_ID) as HTMLElement | null;
  if (box && dimensions) {
    const rect = box.getBoundingClientRect();
    dimensions.textContent = `${rect.width.toFixed(1)}px × ${rect.height.toFixed(1)}px`;
  }

  saveValues(form);
}

function handleFormChange(event: Event) {
  applyStylesheet(event.currentTarget as HTMLFormElement);
}

function handleFormInput(event: Event) {
  applyStylesheet(event.currentTarget as HTMLFormElement);
}

function handleFormReady(form?: Element) {
  if (form) {
    requestAnimationFrame(() => {
      const formElement = form as HTMLFormElement;
      restoreValues(formElement);
      applyStylesheet(formElement);
    });
  }
}

async function handleCopyToClipboard() {
  const generated = document.getElementById(GENERATED_ID);
  const value = generated?.textContent ?? "";
  await window.top?.navigator.clipboard.writeText(value);
}

function boxIcon(label: string) {
  return html`
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-label=${label}
      style="flex: none;"
    >
      <circle cx="8" cy="8" r="6" fill="currentColor" />
    </svg>
  `;
}

function renderDatalists() {
  return Object.entries(tokenLists).map(
    ([key, tokens]) => html`
      <datalist id="box-model-tokens-${key}">
        ${tokens.map((token) => html`<option value="var(${token})">${token}</option>`)}
      </datalist>
    `,
  );
}

function renderControl(property: PlaygroundProperty, state: State) {
  const name = `${property.name}:${state}`;
  const defaultValue =
    property.stateDefaults?.[state] ?? (state === "static" ? property.defaultValue : undefined);
  const control = property.options
    ? html`
        <select name=${name} style="width: 100%; font-family: monospace;">
          <option value="">-</option>
          ${property.options.map(
            (option) => html`
              <option value=${option} ?selected=${option === defaultValue}>${option}</option>
            `,
          )}
        </select>
      `
    : html`
        <input
          type="text"
          name=${name}
          list="box-model-tokens-${property.list}"
          value=${defaultValue ?? ""}
          style="width: 100%; font-family: monospace;"
        />
      `;
  return html`
    <div style="display: flex; flex-direction: column; gap: 0.125rem;">
      ${control}
      <code
        data-token-display=${name}
        data-property=${property.name}
        data-category=${property.category}
        data-state=${state}
        style="font-size: 0.7rem; color: var(--usewc-color-document-text-muted); font-family: monospace; word-break: break-all;"
      ></code>
    </div>
  `;
}

function renderGroup(
  group: { caption: string; properties: ReadonlyArray<PlaygroundProperty> },
  state: State,
) {
  return html`
    <table width="100%">
      <caption style="text-align: left; font-weight: bold; padding: 0.5rem 0;">
        ${group.caption}
      </caption>
      <thead>
        <tr>
          <th width="25%" style="text-align: left;">Property</th>
          <th style="text-align: left;">Value</th>
        </tr>
      </thead>
      <tbody>
        ${group.properties.map(
          (property) => html`
            <tr>
              <td><code>${property.name}</code></td>
              <td>${renderControl(property, state)}</td>
            </tr>
          `,
        )}
      </tbody>
    </table>
  `;
}

function renderStateControls(state: State) {
  return html`
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding: 0.5rem 0;">
      <label style="font-family: monospace;">
        apply to
        <select name=${`scope:${state}`}>
          <option value="self">self (.box)</option>
          <option value="parent">parent (.parent .box)</option>
        </select>
      </label>
      ${STATE_ATTRIBUTES[state]
        ? html`
            <label style="font-family: monospace;">
              <input type="checkbox" name=${`__preview-${state}`} value="on" />
              preview this state on the sample
            </label>
          `
        : ""}
    </div>
  `;
}

function renderStatePanel(state: State) {
  return html`
    <div data-state-panel=${state} ?hidden=${state !== "static"}>
      ${state === "static" ? "" : renderStateControls(state)}
      ${propertyGroups.map((group) => renderGroup(group, state))}
    </div>
  `;
}

function renderStateSelector() {
  return html`
    <div class="bmp-tablist">
      ${STATES.map(
        (state) => html`
          <label class="bmp-tab">
            <input type="radio" name="__state" value=${state} ?checked=${state === "static"} />
            ${state}
          </label>
        `,
      )}
    </div>
  `;
}

const meta: Meta = {
  title: "Box Model Playground",
  tags: ["autodocs", "!dev", "utility"],
  args: {},
  render: () => html`
    <style>
      .bmp-tablist {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      .bmp-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.6rem;
        border: 1px solid var(--usewc-color-document-text-muted);
        border-radius: 0.25rem;
        cursor: pointer;
        font-family: monospace;
        font-size: 0.85rem;
      }
      .bmp-tab:has(input:checked) {
        background: color-mix(in oklch, var(--usewc-color-outline) 18%, transparent);
        border-color: var(--usewc-color-outline);
        font-weight: bold;
      }
    </style>
    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div
          class=${PARENT_CLASS}
          tabindex="0"
          style="display: flex; align-items: center; justify-content: center; min-height: 12rem; padding: 2rem; border: 1px dashed var(--usewc-color-document-text-muted);"
        >
          <div class=${BOX_CLASS} tabindex="0">
            ${boxIcon("inline-start")} Sample box ${boxIcon("inline-end")}
          </div>
        </div>
        <div
          id=${DIMENSIONS_ID}
          style="text-align: center; font-family: monospace; color: var(--usewc-color-document-text-muted);"
        ></div>
      </div>
      <form ${ref(handleFormReady)} @change=${handleFormChange} @input=${handleFormInput}>
        ${renderDatalists()}
        <datalist id="box-model-components">
          <option value="document"></option>
          <option value="form"></option>
          <option value="input"></option>
          <option value="selector"></option>
          <option value="action"></option>
        </datalist>
        <datalist id="box-model-parts">
          <option value="trigger"></option>
          <option value="segment"></option>
          <option value="indicator"></option>
          <option value="text"></option>
          <option value="label"></option>
          <option value="helper-text"></option>
          <option value="header"></option>
          <option value="body"></option>
          <option value="aside"></option>
          <option value="footer"></option>
        </datalist>
        <datalist id="box-model-variants">
          <option value="base"></option>
          <option value="primary"></option>
          <option value="auxiliary"></option>
          <option value="danger"></option>
          <option value="attention"></option>
          <option value="info"></option>
          <option value="success"></option>
        </datalist>
        <datalist id="box-model-sizes">
          <option value="extra-small"></option>
          <option value="small"></option>
          <option value="medium"></option>
          <option value="large"></option>
          <option value="extra-large"></option>
        </datalist>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem;">
          <label style="display: flex; flex-direction: column; gap: 0.25rem;">
            <strong>Component</strong>
            <input
              type="text"
              name="__component"
              list="box-model-components"
              placeholder="action"
              style="font-family: monospace; width: 100%;"
            />
          </label>
          <label style="display: flex; flex-direction: column; gap: 0.25rem;">
            <strong>Part</strong>
            <input
              type="text"
              name="__part"
              list="box-model-parts"
              placeholder="(none)"
              style="font-family: monospace; width: 100%;"
            />
          </label>
          <label style="display: flex; flex-direction: column; gap: 0.25rem;">
            <strong>Variant</strong>
            <input
              type="text"
              name="__variant"
              list="box-model-variants"
              placeholder="base"
              style="font-family: monospace; width: 100%;"
            />
          </label>
          <label style="display: flex; flex-direction: column; gap: 0.25rem;">
            <strong>Size</strong>
            <input
              type="text"
              name="__size"
              list="box-model-sizes"
              placeholder="medium"
              style="font-family: monospace; width: 100%;"
            />
          </label>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <strong>State</strong>
          ${renderStateSelector()}
        </div>
        ${STATES.map((state) => renderStatePanel(state))}
      </form>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <strong>Generated CSS</strong>
          <button type="button" @click=${handleCopyToClipboard}>Copy to clipboard</button>
        </div>
        <pre
          id=${GENERATED_ID}
          style="font-family: monospace; padding: 1rem; background: var(--usewc-color-code-background); color: var(--usewc-color-code-text); border: 1px solid var(--usewc-color-code-border); border-radius: 0.25rem; white-space: pre-wrap; min-height: 4rem; margin: 0;"
        >
/* (no values yet) */</pre
        >
      </div>
    </div>
  `,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

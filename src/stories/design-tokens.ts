export interface DesignToken {
  name: string;
  category: string;
  component: string;
  value: string;
  darkValue?: string;
}

interface DeclarationBlock {
  preludes: string[];
  body: string;
}

const tokenPrefix = "--usewc-";
const darkSchemePrelude = /prefers-color-scheme:\s*dark/;

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function declarationBlocks(css: string) {
  const blocks: DeclarationBlock[] = [];
  const stack: DeclarationBlock[] = [{ preludes: [], body: "" }];
  let buffer = "";
  let quote: string | null = null;

  for (const character of stripComments(css)) {
    if (quote) {
      buffer += character;
      if (character === quote) {
        quote = null;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
      buffer += character;
    } else if (character === "{") {
      const preludeStart = buffer.lastIndexOf(";") + 1;
      const parent = stack.at(-1)!;
      parent.body += buffer.slice(0, preludeStart);
      stack.push({ preludes: [...parent.preludes, buffer.slice(preludeStart).trim()], body: "" });
      buffer = "";
    } else if (character === "}") {
      const block = stack.pop()!;
      block.body += buffer;
      if (block.body.trim()) {
        blocks.push(block);
      }
      buffer = "";
    } else {
      buffer += character;
    }
  }

  return blocks;
}

function splitDeclarations(body: string) {
  const declarations: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;

  for (const character of body) {
    if (quote) {
      if (character === quote) {
        quote = null;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
    } else if (character === ";" && depth === 0) {
      declarations.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  declarations.push(current);

  return declarations.map((declaration) => declaration.trim()).filter(Boolean);
}

function customProperties(body: string) {
  const properties = new Map<string, string>();
  for (const declaration of splitDeclarations(body)) {
    const separator = declaration.indexOf(":");
    const name = declaration.slice(0, separator).trim();
    if (separator > 0 && name.startsWith(tokenPrefix)) {
      properties.set(
        name,
        declaration
          .slice(separator + 1)
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  }
  return properties;
}

function isRootBlock(block: DeclarationBlock) {
  return block.preludes.length === 1 && block.preludes[0] === ":root";
}

function isDarkRootBlock(block: DeclarationBlock) {
  return (
    block.preludes.length === 2 &&
    darkSchemePrelude.test(block.preludes[0]) &&
    block.preludes[1] === ":root"
  );
}

export function parseDesignTokens(css: string): DesignToken[] {
  const blocks = declarationBlocks(css);
  const lightProperties = new Map<string, string>();
  const darkProperties = new Map<string, string>();

  for (const block of blocks) {
    if (isRootBlock(block)) {
      customProperties(block.body).forEach((value, name) => lightProperties.set(name, value));
    } else if (isDarkRootBlock(block)) {
      customProperties(block.body).forEach((value, name) => darkProperties.set(name, value));
    }
  }

  return [...lightProperties].map(([name, value]) => {
    const [category, component] = name.slice(tokenPrefix.length).split("-");
    const token: DesignToken = { name, category, component, value };
    if (darkProperties.has(name)) {
      token.darkValue = darkProperties.get(name);
    }
    return token;
  });
}

function referencedNames(css: string) {
  return [...stripComments(css).matchAll(/var\(\s*(--usewc-[a-z0-9-]+)/g)].map((match) => match[1]);
}

export interface ElementTokens {
  tokens: DesignToken[];
  sharedGroups: string[];
}

type Stylesheets = Record<string, string>;

function referencedTokens(bodies: string[], tokensByName: Map<string, DesignToken>) {
  return bodies
    .flatMap(referencedNames)
    .map((name) => tokensByName.get(name))
    .filter((token): token is DesignToken => token !== undefined);
}

function withSameGroupDerivations(
  direct: DesignToken[],
  tokens: DesignToken[],
  tokensByName: Map<string, DesignToken>,
) {
  const pending = [...direct];
  const found = new Set<string>();

  while (pending.length > 0) {
    const token = pending.pop()!;
    if (found.has(token.name)) {
      continue;
    }
    found.add(token.name);
    const derivedFrom = referencedTokens([token.value, token.darkValue ?? ""], tokensByName);
    pending.push(...derivedFrom.filter((source) => source.component === token.component));
  }

  return tokens.filter((token) => found.has(token.name));
}

function selectorPreludes(block: DeclarationBlock) {
  return block.preludes.filter((prelude) => !prelude.startsWith("@"));
}

function mentionsElement(prelude: string, tagName: string) {
  return new RegExp(`(?<![\\w-])${tagName}[a-z]*(?![\\w-])`).test(prelude);
}

function mentionsAnyCustomElement(prelude: string) {
  return /(?<![\w-])use-(?!theme)[a-z][a-z0-9-]*/.test(prelude);
}

function filesReadingGroups(stylesheets: Stylesheets, tokensByName: Map<string, DesignToken>) {
  const files = new Map<string, Set<string>>();
  for (const [file, css] of Object.entries(stylesheets)) {
    for (const token of referencedTokens([css], tokensByName)) {
      const groupFiles = files.get(token.component) ?? new Set<string>();
      groupFiles.add(file);
      files.set(token.component, groupFiles);
    }
  }
  return files;
}

export function tokensForElement(
  stylesheets: Stylesheets,
  tokens: DesignToken[],
  tagName: string,
): ElementTokens {
  const tokensByName = new Map(tokens.map((token) => [token.name, token]));
  const homeFiles = new Set<string>();
  const bodies: string[] = [];

  for (const [file, css] of Object.entries(stylesheets)) {
    for (const block of declarationBlocks(css)) {
      if (selectorPreludes(block).some((prelude) => mentionsElement(prelude, tagName))) {
        homeFiles.add(file);
        bodies.push(block.body);
      }
    }
  }

  const groupFiles = filesReadingGroups(stylesheets, tokensByName);
  const elementName = tagName.replace(/^use-/, "");
  const isOwnGroup = (group: string) =>
    group === elementName ||
    homeFiles.has(group) ||
    [...(groupFiles.get(group) ?? [])].every((file) => homeFiles.has(file));

  const direct = referencedTokens(bodies, tokensByName);
  return {
    tokens: withSameGroupDerivations(
      direct.filter((token) => isOwnGroup(token.component)),
      tokens,
      tokensByName,
    ),
    sharedGroups: [
      ...new Set(direct.map((token) => token.component).filter((group) => !isOwnGroup(group))),
    ],
  };
}

export function tokensForNativeElements(
  stylesheets: Stylesheets,
  tokens: DesignToken[],
): ElementTokens {
  const tokensByName = new Map(tokens.map((token) => [token.name, token]));
  const bodies = Object.values(stylesheets)
    .flatMap(declarationBlocks)
    .filter((block) => {
      const preludes = selectorPreludes(block);
      return preludes.length > 0 && !preludes.some(mentionsAnyCustomElement);
    })
    .map((block) => block.body);
  const direct = referencedTokens(bodies, tokensByName);
  return { tokens: withSameGroupDerivations(direct, tokens, tokensByName), sharedGroups: [] };
}

export function groupByComponent<Token extends DesignToken>(tokens: Token[]) {
  const groups = new Map<string, Token[]>();
  for (const token of tokens) {
    const group = groups.get(token.component) ?? [];
    group.push(token);
    groups.set(token.component, group);
  }
  return groups;
}

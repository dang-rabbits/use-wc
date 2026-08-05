import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptsDir, "..");
const manifestPath = resolve(projectRoot, "custom-elements.json");
const outputDir = resolve(projectRoot, "dist", "docs");

function escapeCell(value) {
  return value.replace(/\|/g, "\\|");
}

function renderTable(headers, rows) {
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = rows.map((cells) => `| ${cells.join(" | ")} |`);
  return [headerRow, separatorRow, ...dataRows].join("\n");
}

function typeText(type) {
  return type?.text ? `\`${escapeCell(type.text)}\`` : "-";
}

function defaultText(value) {
  return value !== undefined ? `\`${escapeCell(value)}\`` : "-";
}

function descriptionText(value) {
  return value ? escapeCell(value) : "-";
}

function generateMarkdown(declaration) {
  const sections = [];

  const header = declaration.description
    ? `# \`${declaration.tagName}\`\n\n${declaration.description}`
    : `# \`${declaration.tagName}\``;
  sections.push(header);

  const attributes = declaration.attributes ?? [];
  if (attributes.length > 0) {
    const rows = attributes.map((attribute) => [
      escapeCell(attribute.name),
      typeText(attribute.type),
      defaultText(attribute.default),
      descriptionText(attribute.description),
    ]);
    sections.push(
      `## Attributes\n\n${renderTable(["Name", "Type", "Default", "Description"], rows)}`,
    );
  }

  const jsOnlyProperties = (declaration.members ?? []).filter(
    (member) => member.kind === "field" && !("attribute" in member),
  );
  if (jsOnlyProperties.length > 0) {
    const rows = jsOnlyProperties.map((member) => [
      escapeCell(member.name),
      typeText(member.type),
      defaultText(member.default),
      descriptionText(member.description),
    ]);
    sections.push(
      `## Properties\n\n${renderTable(["Name", "Type", "Default", "Description"], rows)}`,
    );
  }

  const methods = (declaration.members ?? []).filter((member) => member.kind === "method");
  if (methods.length > 0) {
    const rows = methods.map((method) => {
      const params = (method.parameters ?? [])
        .map((parameter) => `${parameter.name}: ${parameter.type?.text ?? "unknown"}`)
        .join(", ");
      const signature = `(${params})${method.return?.type?.text ? `: ${method.return.type.text}` : ""}`;
      return [
        escapeCell(method.name),
        `\`${escapeCell(signature)}\``,
        descriptionText(method.description),
      ];
    });
    sections.push(`## Methods\n\n${renderTable(["Name", "Signature", "Description"], rows)}`);
  }

  const events = declaration.events ?? [];
  if (events.length > 0) {
    const rows = events.map((event) => [
      escapeCell(event.name),
      typeText(event.type),
      descriptionText(event.description),
    ]);
    sections.push(`## Events\n\n${renderTable(["Name", "Type", "Description"], rows)}`);
  }

  const slots = declaration.slots ?? [];
  if (slots.length > 0) {
    const rows = slots.map((slot) => [`\`${slot.name}\``, descriptionText(slot.description)]);
    sections.push(`## Slots\n\n${renderTable(["Name", "Description"], rows)}`);
  }

  const cssProperties = declaration.cssProperties ?? [];
  if (cssProperties.length > 0) {
    const rows = cssProperties.map((property) => [
      escapeCell(property.name),
      defaultText(property.default),
      descriptionText(property.description),
    ]);
    sections.push(
      `## CSS Custom Properties\n\n${renderTable(["Name", "Default", "Description"], rows)}`,
    );
  }

  const cssStates = declaration.cssStates ?? [];
  if (cssStates.length > 0) {
    const rows = cssStates.map((state) => [
      escapeCell(state.name),
      descriptionText(state.description),
    ]);
    sections.push(`## CSS States\n\n${renderTable(["State", "Description"], rows)}`);
  }

  return sections.join("\n\n");
}

if (!existsSync(manifestPath)) {
  console.error(`custom-elements.json not found at ${manifestPath}. Run 'vp run analyze' first.`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

const declarations = manifest.modules
  .flatMap((module) => module.declarations ?? [])
  .filter((declaration) => declaration.tagName !== undefined);

mkdirSync(outputDir, { recursive: true });

for (const declaration of declarations) {
  const markdown = generateMarkdown(declaration);
  const outputPath = resolve(outputDir, `${declaration.tagName}.md`);
  writeFileSync(outputPath, markdown + "\n", "utf-8");
}

console.log(`Generated docs for ${declarations.length} components.`);

import { definePlugin, defineRule } from "vite-plus/lint/plugins";

const USER_FACING_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "title",
  "alt",
  "placeholder",
];

const USER_FACING_PROPERTIES = new Set([
  "ariaLabel",
  "ariaDescription",
  "ariaRoleDescription",
  "ariaValueText",
  "title",
  "alt",
  "placeholder",
]);

const NON_ELEMENT_OBJECTS = new Set(["dataset", "style"]);
const TEMPLATE_TAGS = new Set(["html", "svg"]);
const EXPRESSION_MARKER = "\u0000";
const LETTER = /\p{L}/u;
const IGNORED_FILE = /\.(test|stories)\.[cm]?[jt]s$/;
const ATTRIBUTE_PATTERN = new RegExp(
  `(?<=\\s)(${USER_FACING_ATTRIBUTES.join("|")})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>"']+))`,
  "gi",
);

function staticText(node) {
  if (node?.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  if (node?.type === "TemplateLiteral") {
    return node.quasis
      .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
      .join(EXPRESSION_MARKER);
  }
  return undefined;
}

function hasHardcodedText(text) {
  return text !== undefined && LETTER.test(text.replaceAll(EXPRESSION_MARKER, ""));
}

const noHardcodedStrings = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hardcoded user-facing text in component templates and attribute calls; declare it in the component's strings JSON instead.",
    },
    messages: {
      hardcoded:
        'Hardcoded user-facing text in "{{name}}". Move it into the component\'s <tag>.strings.json and resolve it with this.string().',
    },
    schema: [],
  },
  create(context) {
    if (IGNORED_FILE.test(context.filename)) {
      return {};
    }

    return {
      TaggedTemplateExpression(node) {
        if (node.tag.type !== "Identifier" || !TEMPLATE_TAGS.has(node.tag.name)) {
          return;
        }
        const quasis = node.quasi.quasis;
        const text = quasis.map((quasi) => quasi.value.raw).join(EXPRESSION_MARKER);
        const quasiEnds = [];
        let offset = 0;
        for (const quasi of quasis) {
          offset += quasi.value.raw.length + 1;
          quasiEnds.push(offset);
        }

        for (const match of text.matchAll(ATTRIBUTE_PATTERN)) {
          const value = match[2] ?? match[3] ?? match[4];
          if (hasHardcodedText(value)) {
            const quasiIndex = quasiEnds.findIndex((end) => match.index < end);
            context.report({
              node: quasis[quasiIndex] ?? node,
              messageId: "hardcoded",
              data: { name: match[1] },
            });
          }
        }
      },
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type !== "MemberExpression" ||
          callee.computed ||
          callee.property.name !== "setAttribute"
        ) {
          return;
        }
        const [nameArgument, valueArgument] = node.arguments;
        const name = staticText(nameArgument)?.toLowerCase();
        if (
          name &&
          USER_FACING_ATTRIBUTES.includes(name) &&
          hasHardcodedText(staticText(valueArgument))
        ) {
          context.report({ node: valueArgument, messageId: "hardcoded", data: { name } });
        }
      },
      AssignmentExpression(node) {
        const target = node.left;
        if (
          node.operator !== "=" ||
          target.type !== "MemberExpression" ||
          target.computed ||
          !USER_FACING_PROPERTIES.has(target.property.name) ||
          (target.object.type === "MemberExpression" &&
            NON_ELEMENT_OBJECTS.has(target.object.property.name))
        ) {
          return;
        }
        if (hasHardcodedText(staticText(node.right))) {
          context.report({
            node: node.right,
            messageId: "hardcoded",
            data: { name: target.property.name },
          });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "use-wc" },
  rules: { "no-hardcoded-strings": noHardcodedStrings },
});

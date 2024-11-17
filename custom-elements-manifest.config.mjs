// custom-elements-manifest.config.mjs
export default {
    litelement: true,
    globs: ['src/elements/**/*.ts'],
    plugins: [
        {
            name: 'web-components-private-fields-filter',
            analyzePhase({ ts, node, moduleDoc }) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration: {
                        const className = node.name.getText();
                        const classDoc = moduleDoc?.declarations?.find((declaration) => declaration.name === className);

                        if (classDoc?.members) {
                            classDoc.members = classDoc.members.filter((member) => !member.privacy);
                        }
                    }
                }
            },
        },
    ],
};
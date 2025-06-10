// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsparser,
      sourceType: 'module',
    },

    plugins: {
      '@typescript-eslint': tseslint,
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      semi: ['error', 'always'],
      'prettier/prettier': 'error',
    },
  },
  eslintPluginPrettierRecommended,
  ...storybook.configs['flat/recommended'],
];

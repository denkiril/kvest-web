import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ['projects/**/*'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  ...fixupConfigRules(compat.extends(
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@angular-eslint/recommended',
    'plugin:@angular-eslint/template/process-inline-templates',
    'plugin:prettier/recommended',
  )).map(config => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    name: 'ts config',
    files: ['**/*.ts'],
    settings: {
      // https://github.com/import-js/eslint-import-resolver-typescript#configuration
      'import/resolver': { typescript: true },
    },
    rules: {
      '@angular-eslint/directive-selector': ['error', {
        type: 'attribute',
        prefix: 'exokv',
        style: 'camelCase',
      }],
      '@angular-eslint/component-selector': ['error', {
        type: 'element',
        prefix: 'exokv',
        style: 'kebab-case',
      }],
      'no-console': 'warn',
      // https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/order.md
      'import/order': ['warn', {
        alphabetize: {
          order: 'asc',
        },
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index', 'unknown'],
        ],
        'newlines-between': 'always',
      }],
      'prettier/prettier': 'warn',
    },
  },

  ...fixupConfigRules(compat.extends(
    'plugin:@angular-eslint/template/recommended',
    'plugin:@angular-eslint/template/accessibility',
  )).map(config => ({
    ...config,
    files: ['**/*.html'],
  })),
  {
    name: 'html eslint config',
    files: ['**/*.html'],
  },

  ...fixupConfigRules(compat.extends('plugin:prettier/recommended')).map(config => ({
    ...config,
    files: ['**/*.html'],
    ignores: ['**/*inline-template-*.component.html'],
  })),
  {
    name: 'html prettier config',
    files: ['**/*.html'],
    ignores: ['**/*inline-template-*.component.html'],
    rules: {
      'prettier/prettier': ['warn', {
        parser: 'angular',
      }],
    },
  },
];

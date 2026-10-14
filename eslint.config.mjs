import globals from 'globals';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import ember from 'eslint-plugin-ember/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import qunit from 'eslint-plugin-qunit';
import n from 'eslint-plugin-n';
import babelParser from '@babel/eslint-parser/experimental-worker';

const esmParserOptions = {
  ecmaFeatures: { modules: true },
  ecmaVersion: 'latest',
};

export default defineConfig([
  globalIgnores([
    'blueprints/*/files/**',
    'vendor/**',
    'dist/**',
    'tmp/**',
    'bower_components/**',
    'node_modules/**',
    'coverage/**',
    'output/**',
    '.node_modules.ember-try/**',
    'server/**',
    '**/.eslintrc.js',
  ]),
  js.configs.recommended,
  eslintConfigPrettier,
  ember.configs.base,
  {
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-dupe-class-members': 'off',
      'ember/no-empty-glimmer-component-classes': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
    },
  },
  {
    files: ['**/*.js'],
    ignores: [
      'app.js',
      'testem.cjs',
      'webpack.config.js',
      'config/**/*.js',
      'lib/**/*.js',
      'scripts/**/*.js',
    ],
    languageOptions: {
      parserOptions: esmParserOptions,
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    ...qunit.configs.recommended,
    files: ['tests/**/*-test.{js,gjs}'],
    plugins: {
      qunit,
    },
    rules: {
      'qunit/no-assert-equal': 'off',
      'qunit/require-expect': 'off',
    },
  },
  {
    ...n.configs['flat/recommended-script'],
    files: [
      '*.cjs',
      '*.js',
      'config/**/*.js',
      'lib/**/*.js',
      'scripts/**/*.js',
      'testem.cjs',
      'webpack.config.js',
      'app.js',
    ],
    ignores: ['app/**/*.js', 'tests/**/*.js'],
    plugins: {
      n,
    },
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'n/no-unpublished-require': 'off',
    },
  },
  {
    ...n.configs['flat/recommended-module'],
    files: ['**/*.mjs'],
    plugins: {
      n,
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: esmParserOptions,
      globals: {
        ...globals.node,
      },
    },
  },
]);

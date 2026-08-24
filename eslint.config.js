import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['deleteDiscordMessages.user.js', 'Undiscord-fixed-*.user.js', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'build/**/*.mjs', 'rollup.config.mjs', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-expressions': 'error',
      'no-trailing-spaces': 'off',
      'no-undef': 'error',
    },
  },
];

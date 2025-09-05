const js = require('@eslint/js');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-node');
const securityPlugin = require('eslint-plugin-security');

module.exports = [
  // Base configuration
  {
    ignores: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in backend
      'prefer-const': 'error',
      'no-var': 'error',
      'no-process-exit': 'warn', // Allow process.exit in server context
    },
  },
  // Node.js specific configuration
  {
    files: ['**/*.js'],
    ignores: ['eslint.config.js', 'node_modules/**', 'prisma/**'],
    plugins: {
      node: nodePlugin,
      security: securityPlugin,
    },
    rules: {
      ...nodePlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',
      'node/no-missing-require': 'off',
      'node/no-extraneous-require': 'off',
      'node/no-unpublished-require': 'off',
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
    },
  },
];
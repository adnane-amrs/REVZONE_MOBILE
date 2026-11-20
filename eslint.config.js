// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Fail when a file imports a name another file doesn't export (it would render `undefined` and crash)
    rules: {
      'import/named': 'error',
    },
  },
]);

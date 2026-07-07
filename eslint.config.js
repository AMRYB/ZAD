const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/**','android/**','ios/**','docs/**','legacy-web/**','src/data/quran.ts'] }]);

/**
 * @handgemacht/eslint-plugin
 *
 * Shared ESLint rules for Handgemacht React Native projects.
 * Enforces Container/View pattern and React best practices.
 */

const enforceContainerViewPattern = require('./rules/enforce-container-view-pattern');
const matchComponentToFilename = require('./rules/match-component-to-filename');
const maxHooksPerComponent = require('./rules/max-hooks-per-component');
const maxUsestateInCustomHooks = require('./rules/max-usestate-in-custom-hooks');
const noHooksInViews = require('./rules/no-hooks-in-views');
const noContainerImportsInViews = require('./rules/no-container-imports-in-views');
const noHardcodedQueryKeys = require('./rules/no-hardcoded-query-keys');

module.exports = {
  meta: {
    name: '@handgemacht-ai/eslint-plugin',
    version: '0.1.0',
  },
  rules: {
    'enforce-container-view-pattern': enforceContainerViewPattern,
    'match-component-to-filename': matchComponentToFilename,
    'max-hooks-per-component': maxHooksPerComponent,
    'max-usestate-in-custom-hooks': maxUsestateInCustomHooks,
    'no-hooks-in-views': noHooksInViews,
    'no-container-imports-in-views': noContainerImportsInViews,
    'no-hardcoded-query-keys': noHardcodedQueryKeys,
  },
  configs: {
    recommended: {
      plugins: ['@handgemacht'],
      rules: {
        '@handgemacht/enforce-container-view-pattern': 'error',
        '@handgemacht/match-component-to-filename': 'error',
        '@handgemacht/max-hooks-per-component': 'error',
        '@handgemacht/max-usestate-in-custom-hooks': 'error',
        '@handgemacht/no-hooks-in-views': 'error',
        '@handgemacht/no-container-imports-in-views': 'error',
        '@handgemacht/no-hardcoded-query-keys': 'error',
      },
    },
  },
};

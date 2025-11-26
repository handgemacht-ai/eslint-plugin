/**
 * ESLint rule to limit useState calls in custom hooks
 *
 * Custom hooks with many useState calls become difficult to manage.
 * This rule enforces a maximum of 5 useState calls, encouraging
 * developers to refactor into useReducer for complex state management.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Limit useState calls in custom hooks to 5, recommend useReducer',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      tooManyUseState:
        'Custom hook has {{count}} useState calls (max: 5). Consider refactoring to useReducer for complex state management.',
    },
    schema: [],
  },

  create(context) {
    const useStateCalls = [];
    let isCustomHook = false;

    // Check if file contains a custom hook (function starting with 'use')
    function isCustomHookFunction(node) {
      if (node.type === 'FunctionDeclaration' && node.id) {
        return node.id.name.startsWith('use') && node.id.name.length > 3;
      }

      if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
        return node.id.name.startsWith('use') && node.id.name.length > 3;
      }

      return false;
    }

    return {
      // Detect custom hook definitions
      FunctionDeclaration(node) {
        if (isCustomHookFunction(node)) {
          isCustomHook = true;
        }
      },

      VariableDeclarator(node) {
        if (isCustomHookFunction(node)) {
          isCustomHook = true;
        }
      },

      // Detect export function useCustomHook
      ExportNamedDeclaration(node) {
        if (node.declaration && isCustomHookFunction(node.declaration)) {
          isCustomHook = true;
        }
      },

      // Detect export default function useCustomHook
      ExportDefaultDeclaration(node) {
        if (node.declaration && isCustomHookFunction(node.declaration)) {
          isCustomHook = true;
        }
      },

      // Count useState calls
      CallExpression(node) {
        // Check for useState()
        if (node.callee.type === 'Identifier' && node.callee.name === 'useState') {
          useStateCalls.push(node);
        }

        // Check for React.useState()
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'React' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'useState'
        ) {
          useStateCalls.push(node);
        }
      },

      'Program:exit'() {
        // Only check if this is a custom hook and has too many useState calls
        if (isCustomHook && useStateCalls.length > 5) {
          context.report({
            loc: { line: 1, column: 0 },
            messageId: 'tooManyUseState',
            data: {
              count: useStateCalls.length,
            },
          });
        }
      },
    };
  },
};

/**
 * ESLint rule to enforce Container/View naming pattern
 *
 * All React components must be either:
 * - *Container.tsx (business logic, state, API calls)
 * - *View.tsx (pure presentation)
 *
 * Exceptions:
 * - Files in /ui/ directory (reusable UI components)
 * - Files in /app/ directory (Expo Router pages)
 * - Test files
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that React components follow Container/View naming pattern',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      mustBeContainerOrView:
        'Component files must be named either *Container.tsx or *View.tsx. Found: {{filename}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Skip if not a TypeScript React file
    if (!filename.endsWith('.tsx')) {
      return {};
    }

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.spec.')) {
      return {};
    }

    // Skip files in exempted directories
    const exemptPatterns = [
      '/ui/', // Reusable UI components
      '/app/', // Expo Router pages/layouts
      '/_layout.tsx', // Expo Router layouts
      '/+', // Expo Router special files (+html.tsx, +not-found.tsx)
    ];

    if (exemptPatterns.some((pattern) => filename.includes(pattern))) {
      return {};
    }

    // Check if file has a React component export
    let hasReactComponent = false;

    return {
      ExportNamedDeclaration(node) {
        // Check for: export function ComponentName() {}
        if (node.declaration && node.declaration.type === 'FunctionDeclaration') {
          hasReactComponent = true;
        }
        // Check for: export const ComponentName = () => {}
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration' &&
          node.declaration.declarations.some(
            (decl) =>
              decl.init &&
              (decl.init.type === 'ArrowFunctionExpression' ||
                decl.init.type === 'FunctionExpression')
          )
        ) {
          hasReactComponent = true;
        }
      },

      ExportDefaultDeclaration(node) {
        // Check for: export default function ComponentName() {}
        if (
          node.declaration &&
          (node.declaration.type === 'FunctionDeclaration' ||
            node.declaration.type === 'ArrowFunctionExpression' ||
            node.declaration.type === 'FunctionExpression')
        ) {
          hasReactComponent = true;
        }
      },

      'Program:exit'() {
        // Only enforce if file contains a React component
        if (!hasReactComponent) {
          return;
        }

        // Check if filename follows the pattern
        const isContainer = filename.endsWith('Container.tsx');
        const isView = filename.endsWith('View.tsx');

        if (!isContainer && !isView) {
          const filenameParts = filename.split('/');
          const shortFilename = filenameParts[filenameParts.length - 1];

          context.report({
            loc: { line: 1, column: 0 },
            messageId: 'mustBeContainerOrView',
            data: {
              filename: shortFilename,
            },
          });
        }
      },
    };
  },
};

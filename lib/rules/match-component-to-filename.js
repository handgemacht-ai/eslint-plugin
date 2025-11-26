/**
 * ESLint rule to enforce that component names match their filename
 *
 * Examples:
 * - UserProfile.tsx must export "UserProfile"
 * - ChildListContainer.tsx must export "ChildListContainer"
 *
 * Exceptions:
 * - Files in /ui/ directory (reusable UI components)
 * - Files in /app/ directory (Expo Router pages)
 * - Test files
 * - Expo Router special files (_layout.tsx, +not-found.tsx, etc.)
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that React component names match their filename',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      mismatch:
        "Component name '{{componentName}}' does not match filename '{{filename}}'. Expected component to be named '{{expectedName}}'.",
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

    // Extract expected component name from filename
    const filenameParts = filename.split('/');
    let basename = filenameParts[filenameParts.length - 1];

    // Skip ESLint temp check files created by hooks
    if (basename.includes('__eslint_check_')) {
      // Extract actual filename from: __eslint_check_123__ActualFileName.tsx
      const match = basename.match(/__eslint_check_\d+__(.+)/);
      if (match) {
        basename = match[1];
      } else {
        return {}; // Skip if we can't extract the real filename
      }
    }

    const expectedName = basename.replace('.tsx', '');

    return {
      // Check default exports: export default function ComponentName() {}
      ExportDefaultDeclaration(node) {
        let componentName = null;

        // Handle: export default function ComponentName() {}
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id
        ) {
          componentName = node.declaration.id.name;
        }

        // Handle: export default ComponentName (identifier reference)
        if (node.declaration && node.declaration.type === 'Identifier') {
          componentName = node.declaration.name;
        }

        // Check if component name matches expected filename
        if (componentName && componentName !== expectedName) {
          context.report({
            node,
            messageId: 'mismatch',
            data: {
              componentName,
              filename: basename,
              expectedName,
            },
          });
        }
      },

      // Check named exports: export function ComponentName() {}
      ExportNamedDeclaration(node) {
        let componentName = null;

        // Handle: export function ComponentName() {}
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id
        ) {
          componentName = node.declaration.id.name;
        }

        // Handle: export const ComponentName = () => {}
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration' &&
          node.declaration.declarations.length === 1
        ) {
          const decl = node.declaration.declarations[0];
          if (
            decl.id &&
            decl.id.type === 'Identifier' &&
            decl.init &&
            (decl.init.type === 'ArrowFunctionExpression' ||
              decl.init.type === 'FunctionExpression')
          ) {
            componentName = decl.id.name;
          }
        }

        // Check if component name matches expected filename
        if (componentName && componentName !== expectedName) {
          context.report({
            node,
            messageId: 'mismatch',
            data: {
              componentName,
              filename: basename,
              expectedName,
            },
          });
        }
      },
    };
  },
};

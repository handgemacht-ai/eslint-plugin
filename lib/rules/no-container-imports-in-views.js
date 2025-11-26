/**
 * ESLint rule to prevent View components from importing Container components
 *
 * View components should be pure presentational components that receive all
 * dependencies via props (dependency injection). They should never import
 * Container components directly.
 *
 * If a View needs a Container, the Container should be injected as a prop
 * using the component prop pattern.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing Container components in View components (*View.tsx files)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noContainerImportInView:
        'View components must not import Container components directly. Use dependency injection instead - pass the rendered {{containerName}} instance as a ReactNode prop to {{viewName}}.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Only check files named *View.tsx
    if (!filename.endsWith('View.tsx')) {
      return {};
    }

    // Extract view component name from filename
    const filenameParts = filename.split('/');
    const viewFilename = filenameParts[filenameParts.length - 1];
    const viewName = viewFilename.replace('.tsx', '');

    return {
      ImportDeclaration(node) {
        // Skip type-only imports (import type { ... })
        if (node.importKind === 'type') {
          return;
        }

        // Check if import source ends with Container.tsx or Container
        const importSource = node.source.value;

        // Match imports like:
        // - import { SomeContainer } from './SomeContainer'
        // - import { SomeContainer } from './SomeContainer.tsx'
        // - import SomeContainer from '../components/SomeContainer'
        const isContainerImport =
          importSource.endsWith('Container') || importSource.endsWith('Container.tsx');

        if (isContainerImport) {
          // Extract container name from import path
          const containerPath = importSource.split('/');
          const containerFile = containerPath[containerPath.length - 1];
          const containerName = containerFile.replace('.tsx', '').replace('Container', 'Container');

          context.report({
            node,
            messageId: 'noContainerImportInView',
            data: {
              containerName,
              viewName,
            },
          });
        }
      },
    };
  },
};

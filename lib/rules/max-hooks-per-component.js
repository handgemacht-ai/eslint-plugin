/**
 * ESLint rule to limit the total number of React hooks per component
 *
 * Components with too many hooks become difficult to maintain and test.
 * This rule enforces a maximum of 5 hooks per component, encouraging
 * developers to extract custom hooks or split into smaller components.
 *
 * Note: This rule only checks React components (PascalCase functions),
 * not custom hooks (camelCase functions starting with 'use').
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Limit the total number of React hooks per component to 5',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      tooManyHooks:
        'Component has {{count}} hooks (max: 5). Refactor into custom hooks or split into smaller components. Hooks found: {{hookNames}}',
    },
    schema: [],
  },

  create(context) {
    // Track hooks per component
    const componentStack = [];
    let currentComponent = null;

    // List of React hooks to count
    const reactHooks = [
      'useState',
      'useReducer',
      'useEffect',
      'useLayoutEffect',
      'useContext',
      'useRef',
      'useMemo',
      'useCallback',
      'useImperativeHandle',
      'useDebugValue',
      'useDeferredValue',
      'useTransition',
      'useId',
      'useSyncExternalStore',
    ];

    // Check if identifier is a React hook
    function isReactHook(name) {
      // React hooks or custom hooks (start with 'use')
      return reactHooks.includes(name) || (name && name.startsWith('use') && name.length > 3);
    }

    // Check if a function name is a React component (PascalCase)
    function isComponentName(name) {
      if (!name) return false;
      // Components start with uppercase letter
      return /^[A-Z]/.test(name);
    }

    // Check if a function name is a custom hook (camelCase starting with 'use')
    function isCustomHook(name) {
      if (!name) return false;
      // Custom hooks start with 'use' followed by uppercase
      return /^use[A-Z]/.test(name);
    }

    // Enter a component scope
    function enterComponent(node, name) {
      if (isComponentName(name) && !isCustomHook(name)) {
        currentComponent = {
          name,
          node,
          hooks: [],
        };
        componentStack.push(currentComponent);
      }
    }

    // Exit a component scope
    function exitComponent() {
      if (currentComponent && currentComponent.hooks.length > 5) {
        context.report({
          node: currentComponent.node,
          messageId: 'tooManyHooks',
          data: {
            count: currentComponent.hooks.length,
            hookNames: currentComponent.hooks.join(', '),
          },
        });
      }

      componentStack.pop();
      currentComponent = componentStack[componentStack.length - 1] || null;
    }

    return {
      // Function declarations: function MyComponent() {}
      FunctionDeclaration(node) {
        if (node.id) {
          enterComponent(node, node.id.name);
        }
      },

      'FunctionDeclaration:exit'(node) {
        if (node.id && isComponentName(node.id.name) && !isCustomHook(node.id.name)) {
          exitComponent();
        }
      },

      // Variable declarations with arrow functions: const MyComponent = () => {}
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.init &&
          (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')
        ) {
          enterComponent(node.init, node.id.name);
        }
      },

      'VariableDeclarator:exit'(node) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.init &&
          (node.init.type === 'ArrowFunctionExpression' ||
            node.init.type === 'FunctionExpression') &&
          isComponentName(node.id.name) &&
          !isCustomHook(node.id.name)
        ) {
          exitComponent();
        }
      },

      // Export declarations: export function MyComponent() {}
      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id
        ) {
          enterComponent(node.declaration, node.declaration.id.name);
        }
      },

      'ExportNamedDeclaration:exit'(node) {
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id &&
          isComponentName(node.declaration.id.name) &&
          !isCustomHook(node.declaration.id.name)
        ) {
          exitComponent();
        }
      },

      // Default exports: export default function MyComponent() {}
      ExportDefaultDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id
        ) {
          enterComponent(node.declaration, node.declaration.id.name);
        }
      },

      'ExportDefaultDeclaration:exit'(node) {
        if (
          node.declaration &&
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id &&
          isComponentName(node.declaration.id.name) &&
          !isCustomHook(node.declaration.id.name)
        ) {
          exitComponent();
        }
      },

      CallExpression(node) {
        // Only count hooks if we're inside a component
        if (!currentComponent) return;

        // Check for direct hook calls: useState()
        if (node.callee.type === 'Identifier' && isReactHook(node.callee.name)) {
          currentComponent.hooks.push(node.callee.name);
        }

        // Check for React.useState() style calls
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'React' &&
          node.callee.property.type === 'Identifier' &&
          isReactHook(node.callee.property.name)
        ) {
          currentComponent.hooks.push(`React.${node.callee.property.name}`);
        }
      },
    };
  },
};

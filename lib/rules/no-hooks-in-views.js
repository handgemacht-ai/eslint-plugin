/**
 * ESLint rule to prevent React hooks in View components
 *
 * View components should be pure presentational components that only receive
 * data via props. All state management, side effects, and business logic
 * should live in Container components.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow React hooks in View components (*View.tsx files)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noHooksInView:
        'View components must not use {{hookName}}. Move state management and side effects to a Container component.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Only check files named *View.tsx
    if (!filename.endsWith('View.tsx')) {
      return {};
    }

    // List of React hooks that are prohibited in View components
    const prohibitedHooks = [
      'useState',
      'useReducer',
      'useEffect',
      'useLayoutEffect',
      'useContext',
      'useRef',
      'useMemo',
      'useImperativeHandle',
      'useDebugValue',
      'useDeferredValue',
      'useTransition',
      'useId',
      'useSyncExternalStore',
    ];

    // Hooks that are allowed in View components
    const allowedHooks = [
      'useTranslation', // i18n hook - purely functional, no side effects
      'useCallback', // Performance optimization - needed for stable function references
      // Moti animation hooks - UI state, not business logic
      'useAnimationState', // Declarative animation state management
      'useDynamicAnimation', // Dynamic animation control
      'useImperativeHandle', // For exposing imperative animation triggers
    ];

    // Check if identifier is a React hook or custom hook
    function isHook(name) {
      // Allow explicitly permitted hooks
      if (allowedHooks.includes(name)) {
        return false;
      }

      return (
        prohibitedHooks.includes(name) ||
        // Also catch custom hooks (start with 'use')
        (name && name.startsWith('use') && name.length > 3)
      );
    }

    return {
      CallExpression(node) {
        // Check if it's a direct hook call (e.g., useState())
        if (node.callee.type === 'Identifier' && isHook(node.callee.name)) {
          context.report({
            node,
            messageId: 'noHooksInView',
            data: {
              hookName: node.callee.name,
            },
          });
        }

        // Check if it's a React.useState() style call
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'React' &&
          node.callee.property.type === 'Identifier' &&
          isHook(node.callee.property.name)
        ) {
          context.report({
            node,
            messageId: 'noHooksInView',
            data: {
              hookName: `React.${node.callee.property.name}`,
            },
          });
        }
      },
    };
  },
};

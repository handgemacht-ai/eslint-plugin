/**
 * ESLint rule to prevent hardcoded TanStack Query keys
 *
 * Query keys should use the centralized `queryKeys` factory from `@/lib/query-helpers`
 * to ensure consistent cache invalidation patterns.
 *
 * Good:
 *   queryKey: queryKeys.availability.all
 *   queryKey: queryKeys.users.detail(userId)
 *
 * Bad:
 *   queryKey: ['availability']
 *   queryKey: ['users', 'detail', userId]
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded query keys in TanStack Query usage',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noHardcodedQueryKey:
        'Hardcoded query key {{ key }} is not allowed.\n\n' +
        'Import and use the queryKeys factory:\n' +
        "  import { queryKeys } from '@/lib/query-helpers';\n\n" +
        'Available domains: availability, children, connections, invitations, notifications, onboarding, roadmap, user\n\n' +
        'Example: queryKey: queryKeys.{{ suggestedDomain }}.all',
    },
    schema: [],
  },

  create(context) {
    /**
     * Extract a string representation of the array for the error message
     */
    function getArrayKeyString(arrayNode) {
      const elements = arrayNode.elements.map((el) => {
        if (!el) return 'undefined';
        if (el.type === 'Literal') return JSON.stringify(el.value);
        if (el.type === 'Identifier') return el.name;
        if (el.type === 'TemplateLiteral') return '`template`';
        return '...';
      });
      return `[${elements.join(', ')}]`;
    }

    /**
     * Suggest a domain based on the first element of the array
     */
    function suggestDomain(arrayNode) {
      const firstEl = arrayNode.elements[0];
      if (firstEl && firstEl.type === 'Literal' && typeof firstEl.value === 'string') {
        const value = firstEl.value.toLowerCase();
        // Map common patterns to domains
        if (value.includes('availability')) return 'availability';
        if (value.includes('child') || value === 'my-children') return 'children';
        if (value.includes('connection')) return 'connections';
        if (value.includes('invitation')) return 'invitations';
        if (value.includes('notification')) return 'notifications';
        if (value.includes('onboarding')) return 'onboarding';
        if (value.includes('roadmap')) return 'roadmap';
        if (value.includes('user')) return 'user';
      }
      return 'domain';
    }

    return {
      Property(node) {
        // Check if this is a queryKey property
        if (
          node.key &&
          ((node.key.type === 'Identifier' && node.key.name === 'queryKey') ||
            (node.key.type === 'Literal' && node.key.value === 'queryKey'))
        ) {
          const value = node.value;

          // If the value is an array literal, it's hardcoded - flag it
          if (value.type === 'ArrayExpression') {
            context.report({
              node: value,
              messageId: 'noHardcodedQueryKey',
              data: {
                key: getArrayKeyString(value),
                suggestedDomain: suggestDomain(value),
              },
            });
          }
        }
      },
    };
  },
};

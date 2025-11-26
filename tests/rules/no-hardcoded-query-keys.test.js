const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/no-hardcoded-query-keys');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-hardcoded-query-keys', rule, {
  valid: [
    // Using queryKeys factory
    {
      code: `
        const query = useQuery({
          queryKey: queryKeys.users.all,
          queryFn: fetchUsers,
        });
      `,
      filename: '/src/hooks/useUsers.ts',
    },
    // Using queryKeys with parameters
    {
      code: `
        const query = useQuery({
          queryKey: queryKeys.users.detail(userId),
          queryFn: () => fetchUser(userId),
        });
      `,
      filename: '/src/hooks/useUser.ts',
    },
    // Non-queryKey property with array is fine
    {
      code: `
        const config = {
          items: ['a', 'b', 'c'],
        };
      `,
      filename: '/src/config.ts',
    },
    // queryKey as variable reference
    {
      code: `
        const key = queryKeys.users.all;
        const query = useQuery({
          queryKey: key,
          queryFn: fetchUsers,
        });
      `,
      filename: '/src/hooks/useUsers.ts',
    },
  ],
  invalid: [
    // Hardcoded array query key
    {
      code: `
        const query = useQuery({
          queryKey: ['users'],
          queryFn: fetchUsers,
        });
      `,
      filename: '/src/hooks/useUsers.ts',
      errors: [{ messageId: 'noHardcodedQueryKey' }],
    },
    // Hardcoded array with multiple elements
    {
      code: `
        const query = useQuery({
          queryKey: ['users', 'detail', userId],
          queryFn: () => fetchUser(userId),
        });
      `,
      filename: '/src/hooks/useUser.ts',
      errors: [{ messageId: 'noHardcodedQueryKey' }],
    },
    // Hardcoded availability key
    {
      code: `
        const query = useQuery({
          queryKey: ['availability'],
          queryFn: fetchAvailability,
        });
      `,
      filename: '/src/hooks/useAvailability.ts',
      errors: [{ messageId: 'noHardcodedQueryKey' }],
    },
    // Hardcoded children key
    {
      code: `
        const query = useQuery({
          queryKey: ['my-children'],
          queryFn: fetchChildren,
        });
      `,
      filename: '/src/hooks/useChildren.ts',
      errors: [{ messageId: 'noHardcodedQueryKey' }],
    },
  ],
});

console.log('no-hardcoded-query-keys: All tests passed!');

const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/no-container-imports-in-views');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-container-imports-in-views', rule, {
  valid: [
    // View importing non-Container component
    {
      code: `
        import { Button } from './Button';
        function MyView() {
          return <Button />;
        }
      `,
      filename: '/src/components/MyView.tsx',
    },
    // View importing utility
    {
      code: `
        import { formatDate } from '../utils/date';
        function MyView({ date }) {
          return <div>{formatDate(date)}</div>;
        }
      `,
      filename: '/src/components/MyView.tsx',
    },
    // Container importing another Container (allowed)
    {
      code: `
        import { OtherContainer } from './OtherContainer';
        function MyContainer() {
          return <OtherContainer />;
        }
      `,
      filename: '/src/components/MyContainer.tsx',
    },
    // Non-View file importing Container (allowed)
    {
      code: `
        import { MyContainer } from './MyContainer';
        function App() {
          return <MyContainer />;
        }
      `,
      filename: '/src/App.tsx',
    },
    // Note: Type-only imports (import type { ... }) are also allowed
    // but require TypeScript parser to test. The rule checks node.importKind === 'type'
  ],
  invalid: [
    // View importing Container
    {
      code: `
        import { UserContainer } from './UserContainer';
        function MyView() {
          return <UserContainer />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noContainerImportInView' }],
    },
    // View importing Container with .tsx extension
    {
      code: `
        import { ProfileContainer } from '../ProfileContainer.tsx';
        function MyView() {
          return <ProfileContainer />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noContainerImportInView' }],
    },
    // View importing default Container
    {
      code: `
        import ListContainer from './ListContainer';
        function MyView() {
          return <ListContainer />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noContainerImportInView' }],
    },
  ],
});

console.log('no-container-imports-in-views: All tests passed!');

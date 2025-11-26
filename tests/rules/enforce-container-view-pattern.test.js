const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/enforce-container-view-pattern');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('enforce-container-view-pattern', rule, {
  valid: [
    // Container files
    {
      code: 'export function MyContainer() { return <div />; }',
      filename: '/src/components/MyContainer.tsx',
    },
    // View files
    {
      code: 'export function MyView() { return <div />; }',
      filename: '/src/components/MyView.tsx',
    },
    // Files in /ui/ directory are exempt
    {
      code: 'export function Button() { return <button />; }',
      filename: '/src/ui/Button.tsx',
    },
    // Files in /app/ directory are exempt
    {
      code: 'export default function Home() { return <div />; }',
      filename: '/src/app/index.tsx',
    },
    // Layout files are exempt
    {
      code: 'export default function Layout() { return <div />; }',
      filename: '/src/app/_layout.tsx',
    },
    // Non-TSX files are exempt
    {
      code: 'export function helper() { return 1; }',
      filename: '/src/utils/helper.ts',
    },
    // Test files are exempt
    {
      code: 'export function Test() { return <div />; }',
      filename: '/src/components/My.test.tsx',
    },
    // Files without React components are exempt
    {
      code: 'export const config = { key: "value" };',
      filename: '/src/MyFile.tsx',
    },
  ],
  invalid: [
    // File with component but wrong naming
    {
      code: 'export function MyComponent() { return <div />; }',
      filename: '/src/components/MyComponent.tsx',
      errors: [{ messageId: 'mustBeContainerOrView' }],
    },
    // Arrow function component
    {
      code: 'export const MyComponent = () => <div />;',
      filename: '/src/components/MyComponent.tsx',
      errors: [{ messageId: 'mustBeContainerOrView' }],
    },
    // Default export component
    {
      code: 'export default function MyComponent() { return <div />; }',
      filename: '/src/components/MyComponent.tsx',
      errors: [{ messageId: 'mustBeContainerOrView' }],
    },
  ],
});

console.log('enforce-container-view-pattern: All tests passed!');

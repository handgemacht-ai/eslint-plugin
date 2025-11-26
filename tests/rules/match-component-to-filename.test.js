const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/match-component-to-filename');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('match-component-to-filename', rule, {
  valid: [
    // Component name matches filename
    {
      code: 'export function MyContainer() { return <div />; }',
      filename: '/src/components/MyContainer.tsx',
    },
    // Default export matches
    {
      code: 'export default function MyView() { return <div />; }',
      filename: '/src/components/MyView.tsx',
    },
    // Arrow function matches
    {
      code: 'export const ProfileCard = () => <div />;',
      filename: '/src/components/ProfileCard.tsx',
    },
    // Files in /ui/ directory are exempt
    {
      code: 'export function SomethingElse() { return <div />; }',
      filename: '/src/ui/Button.tsx',
    },
    // Files in /app/ directory are exempt
    {
      code: 'export default function Page() { return <div />; }',
      filename: '/src/app/index.tsx',
    },
    // Non-TSX files are exempt
    {
      code: 'export function helper() { return 1; }',
      filename: '/src/utils/helper.ts',
    },
    // Test files are exempt
    {
      code: 'export function WrongName() { return <div />; }',
      filename: '/src/components/My.test.tsx',
    },
  ],
  invalid: [
    // Component name doesn't match filename
    {
      code: 'export function WrongName() { return <div />; }',
      filename: '/src/components/MyContainer.tsx',
      errors: [{ messageId: 'mismatch' }],
    },
    // Default export doesn't match
    {
      code: 'export default function Foo() { return <div />; }',
      filename: '/src/components/BarView.tsx',
      errors: [{ messageId: 'mismatch' }],
    },
    // Arrow function doesn't match
    {
      code: 'export const Wrong = () => <div />;',
      filename: '/src/components/ProfileCard.tsx',
      errors: [{ messageId: 'mismatch' }],
    },
  ],
});

console.log('match-component-to-filename: All tests passed!');

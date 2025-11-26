const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/max-hooks-per-component');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('max-hooks-per-component', rule, {
  valid: [
    // Component with 5 hooks (at the limit)
    {
      code: `
        function MyComponent() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const ref = useRef(null);
          useEffect(() => {}, []);
          return <div />;
        }
      `,
      filename: '/src/MyComponent.tsx',
    },
    // Custom hooks are not counted as components
    {
      code: `
        function useMyHook() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const [e, setE] = useState(5);
          const [f, setF] = useState(6);
          return a;
        }
      `,
      filename: '/src/hooks/useMyHook.ts',
    },
    // Component with no hooks
    {
      code: `
        function MyComponent() {
          return <div />;
        }
      `,
      filename: '/src/MyComponent.tsx',
    },
  ],
  invalid: [
    // Component with 6 hooks (over the limit)
    {
      code: `
        function MyComponent() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const ref = useRef(null);
          useEffect(() => {}, []);
          return <div />;
        }
      `,
      filename: '/src/MyComponent.tsx',
      errors: [{ messageId: 'tooManyHooks' }],
    },
    // Arrow function component with too many hooks
    {
      code: `
        const MyComponent = () => {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const [e, setE] = useState(5);
          const [f, setF] = useState(6);
          return <div />;
        };
      `,
      filename: '/src/MyComponent.tsx',
      errors: [{ messageId: 'tooManyHooks' }],
    },
  ],
});

console.log('max-hooks-per-component: All tests passed!');

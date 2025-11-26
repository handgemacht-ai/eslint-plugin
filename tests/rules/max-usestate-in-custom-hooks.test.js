const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/max-usestate-in-custom-hooks');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('max-usestate-in-custom-hooks', rule, {
  valid: [
    // Custom hook with 5 useState (at the limit)
    {
      code: `
        function useMyHook() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const [e, setE] = useState(5);
          return { a, b, c, d, e };
        }
      `,
      filename: '/src/hooks/useMyHook.ts',
    },
    // Regular component (not a custom hook) - exempt
    {
      code: `
        function MyComponent() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const [e, setE] = useState(5);
          const [f, setF] = useState(6);
          return <div />;
        }
      `,
      filename: '/src/MyComponent.tsx',
    },
    // Custom hook with no useState
    {
      code: `
        function useMyHook() {
          const ref = useRef(null);
          return ref;
        }
      `,
      filename: '/src/hooks/useMyHook.ts',
    },
  ],
  invalid: [
    // Custom hook with 6 useState (over the limit)
    {
      code: `
        function useMyHook() {
          const [a, setA] = useState(1);
          const [b, setB] = useState(2);
          const [c, setC] = useState(3);
          const [d, setD] = useState(4);
          const [e, setE] = useState(5);
          const [f, setF] = useState(6);
          return { a, b, c, d, e, f };
        }
      `,
      filename: '/src/hooks/useMyHook.ts',
      errors: [{ messageId: 'tooManyUseState' }],
    },
    // Exported custom hook with too many useState
    {
      code: `
        export function useFormState() {
          const [name, setName] = useState('');
          const [email, setEmail] = useState('');
          const [phone, setPhone] = useState('');
          const [address, setAddress] = useState('');
          const [city, setCity] = useState('');
          const [zip, setZip] = useState('');
          return { name, email, phone, address, city, zip };
        }
      `,
      filename: '/src/hooks/useFormState.ts',
      errors: [{ messageId: 'tooManyUseState' }],
    },
  ],
});

console.log('max-usestate-in-custom-hooks: All tests passed!');

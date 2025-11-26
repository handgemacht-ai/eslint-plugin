const { RuleTester } = require('eslint');
const rule = require('../../lib/rules/no-hooks-in-views');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-hooks-in-views', rule, {
  valid: [
    // View component with no hooks
    {
      code: `
        function MyView({ data }) {
          return <div>{data}</div>;
        }
      `,
      filename: '/src/components/MyView.tsx',
    },
    // View with allowed hooks (useTranslation, useCallback)
    {
      code: `
        function MyView({ onPress }) {
          const { t } = useTranslation();
          const handlePress = useCallback(() => onPress(), [onPress]);
          return <button onClick={handlePress}>{t('label')}</button>;
        }
      `,
      filename: '/src/components/MyView.tsx',
    },
    // Container files are exempt
    {
      code: `
        function MyContainer() {
          const [state, setState] = useState(null);
          useEffect(() => {}, []);
          return <div />;
        }
      `,
      filename: '/src/components/MyContainer.tsx',
    },
    // Non-View files are exempt
    {
      code: `
        function MyComponent() {
          const [state, setState] = useState(null);
          return <div />;
        }
      `,
      filename: '/src/components/MyComponent.tsx',
    },
    // View with Moti animation hooks (allowed)
    {
      code: `
        function MyView() {
          const animationState = useAnimationState({ from: {}, to: {} });
          return <MotiView state={animationState} />;
        }
      `,
      filename: '/src/components/MyView.tsx',
    },
  ],
  invalid: [
    // View with useState
    {
      code: `
        function MyView() {
          const [state, setState] = useState(null);
          return <div />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noHooksInView' }],
    },
    // View with useEffect
    {
      code: `
        function MyView() {
          useEffect(() => {}, []);
          return <div />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noHooksInView' }],
    },
    // View with useReducer
    {
      code: `
        function MyView() {
          const [state, dispatch] = useReducer(reducer, initial);
          return <div />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noHooksInView' }],
    },
    // View with custom hook (other than allowed ones)
    {
      code: `
        function MyView() {
          const data = useMyCustomHook();
          return <div>{data}</div>;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [{ messageId: 'noHooksInView' }],
    },
    // View with multiple prohibited hooks
    {
      code: `
        function MyView() {
          const [state, setState] = useState(null);
          useEffect(() => {}, []);
          return <div />;
        }
      `,
      filename: '/src/components/MyView.tsx',
      errors: [
        { messageId: 'noHooksInView' },
        { messageId: 'noHooksInView' },
      ],
    },
  ],
});

console.log('no-hooks-in-views: All tests passed!');

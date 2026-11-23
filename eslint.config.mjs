import js from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import typescript from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

// eslint-plugin-react 7 does not support ESLint 10. Preserve its applicable
// recommended checks with the supported replacement rather than suppressing them.
// https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react
// TypeScript checks duplicate JSX attributes, undefined JSX names and class
// render signatures. ESLint 10 itself tracks JSX references for unused variables.
const jsxText = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      unescaped:
        'Escape {{character}} in JSX text with an HTML entity or a JSX expression.'
    }
  },
  create(context) {
    return {
      JSXText(node) {
        // node.value is decoded, so inspect source to allow &quot; / &apos;.
        const text = context.sourceCode.getText(node);
        for (const match of text.matchAll(/["'>}]/g)) {
          context.report({
            node,
            messageId: 'unescaped',
            data: { character: match[0] }
          });
        }
      }
    };
  }
};

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**'
    ]
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      ...typescript.configs['flat/recommended'],
      tailwindcss.configs.recommended,
      prettier
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.jest }
    },
    plugins: {
      '@eslint-react': react,
      'react-hooks': reactHooks,
      omni: { rules: { 'no-unescaped-entities': jsxText } }
    },
    settings: {
      'react-x': { version: 'detect' },
      tailwindcss: { cssConfigPath: './src/tailwind.css' }
    },
    rules: {
      '@eslint-react/no-missing-component-display-name': 'error',
      '@eslint-react/no-missing-key': 'error',
      '@eslint-react/jsx-no-comment-textnodes': 'error',
      '@eslint-react/dom-no-unsafe-target-blank': 'error',
      '@eslint-react/jsx-no-children-prop': 'error',
      '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
      '@eslint-react/no-component-will-mount': 'error',
      '@eslint-react/no-component-will-receive-props': 'error',
      '@eslint-react/no-component-will-update': 'error',
      '@eslint-react/no-direct-mutation-state': 'error',
      '@eslint-react/dom-no-find-dom-node': 'error',
      '@eslint-react/dom-no-render-return-value': 'error',
      '@eslint-react/dom-no-render': 'error',
      '@eslint-react/dom-no-hydrate': 'error',
      '@eslint-react/dom-no-unknown-property': 'error',
      'omni/no-unescaped-entities': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[property.name="isMounted"]',
          message:
            'React isMounted is deprecated; clean up subscriptions instead.'
        },
        {
          selector: 'JSXAttribute[name.name="ref"] > Literal[value=/./]',
          message:
            'React string refs are unsupported; use a ref object or callback.'
        },
        {
          selector:
            'JSXAttribute[name.name="ref"] > JSXExpressionContainer > Literal[value=/./]',
          message:
            'React string refs are unsupported; use a ref object or callback.'
        }
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // ban-types was off; its v8 replacements preserve that policy, while the
      // old no-empty-interface check remains enabled via no-empty-object-type.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowObjectTypes: 'always' }
      ],
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn',
      'tailwindcss/no-contradicting-classname': 'error'
    }
  }
]);

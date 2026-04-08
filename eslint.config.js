//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'
import pluginRouter from '@tanstack/eslint-plugin-router'
import { configs } from 'eslint-plugin-react-hooks'
import stylistic from '@stylistic/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'

export default [
  ...tanstackConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
    rules: {
      'react/jsx-boolean-value': ['error'],
      "react/jsx-indent-props": ["error", 2],
      "react/jsx-indent": ["error", 2],
    }
  },
  ...pluginRouter.configs['flat/recommended'],
  { ...configs.flat['recommended-latest'] },
  {
    ...stylistic.configs.recommended,
    rules: {
      "@stylistic/jsx-self-closing-comp": ["error"],
      "@stylistic/jsx-newline": ["error"],
      "@stylistic/jsx-max-props-per-line": ["error"],
      "@stylistic/array-bracket-spacing": ["error"],
      "@stylistic/newline-per-chained-call": ["error"],
      "@stylistic/no-confusing-arrow": ["error"],
      "@stylistic/object-property-newline": ["error"],
    }
  },
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]

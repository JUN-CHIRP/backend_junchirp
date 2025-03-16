// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const stylisticTs = require('@stylistic/eslint-plugin-ts');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      eslintPluginPrettierRecommended,
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': typescriptEslintPlugin,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:.*'],
            ['^@?\\w'],
            ['^(@|src)(/.*|$)'],
            ['^\\.\\.(/.*|$)'],
            ['^\\./'],
            ['.+\\.(css|scss|sass|less|png|jpg|jpeg|svg|gif|ico|json)$'],
          ],
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      '@stylistic/ts/comma-dangle': ['error', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'always-multiline',
        'importAttributes': 'never',
        'dynamicImports': 'never',
        'enums': 'always-multiline',
      }],
      '@stylistic/ts/comma-spacing': 'error',
      '@stylistic/ts/no-extra-semi': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 2, 50, 7, 8, 20, 254, 10, 30, 60, 1000, 100000, 999999, 200, 3000, 6, 24, 465, 5],
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: true,
          classes: true,
          variables: true,
          allowNamedExports: false,
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@stylistic/ts/quotes': [
        'error',
        'single',
        { allowTemplateLiterals: true },
      ],
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          "allow": ["arrowFunctions"],
        }
      ],
      '@stylistic/ts/func-call-spacing': 'error',
      '@stylistic/ts/keyword-spacing': 'error',
      '@stylistic/ts/lines-between-class-members': [
        'error',
        'always',
        { exceptAfterOverload: false },
      ],
      '@stylistic/ts/space-before-blocks': 'error',
      '@stylistic/ts/semi': 'error',
      '@stylistic/ts/space-before-function-paren': [
        'error',
        { anonymous: 'always', named: 'never', asyncArrow: 'always' },
      ],
      '@stylistic/ts/space-infix-ops': ['error', { int32Hint: false }],
      '@stylistic/ts/object-curly-spacing': ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          trailingComma: 'all',
        }
      ],
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
      'class-methods-use-this': 'off',
      'no-var': 'error',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-duplicate-case': 'error',
      'prefer-const': 'error',
      curly: 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
);

// https://github.com/antfu/eslint-config
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['**/*.md'],

  javascript: {
    overrides: {
      // add `caughtErrors: 'none'`
      // https://github.com/antfu/eslint-config/blob/a98ccc8ab87e4598e836e12a23b2aae78c86b8a6/src/configs/javascript.ts#L196
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
          caughtErrors: 'none', // added
        },
      ],
    },
  },

  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})

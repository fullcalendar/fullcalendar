
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    react: {
      version: '18.2.0', // can't detect b/c we don't use React. hardcode a recent version
    },
  },
  env: {
    es2022: true,
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-double'], // rethink this?
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'always-multiline', // not included in single-value specification
    }],

    // typescript will check unknown vars, even for js (with checkJs)
    'no-undef': 'off',

    // jsx
    'react/react-in-jsx-scope': 'off', // not compat w/ Preact (checked in ts anyway)
    'react/display-name': 'off',

    // easy fixes in near-term
    '@typescript-eslint/no-unused-vars': 'off',

    // hard fixes in long-term
    'prefer-const': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // legitimately want disabled
    '@typescript-eslint/no-empty-interface': 'off', // need empty interfaces for decl merging
    '@typescript-eslint/no-non-null-assertion': 'off',

    // TODO: merge rules from this legacy file:
    // https://github.com/fullcalendar/fullcalendar/blob/v5.11.3/.eslintrc.yml
  },
  overrides: [
    {
      files: '*.cjs', // at any depth
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // allow require() statements
      },
    },
  ],
}

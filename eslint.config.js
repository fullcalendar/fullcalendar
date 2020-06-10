
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module' // allows for the use of imports
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'import'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [ // TODO: start using 'standard'
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  rules: {
    'no-unused-vars': 0,
      // disable so that doesn't complain about unnused ts type imports.
      // also because can't get jsxFactory to work.

    'no-undef': 0, // because tsc already checks this. hard to make work with tests globals
    'prefer-const': 0,
    'prefer-spread': 0,
    'prefer-rest-params': 0,
    'react/react-in-jsx-scope': 0, // requires React to always be imported
    'react/display-name': 0,
    'react/prop-types': 0,

    'import/no-extraneous-dependencies': 'error',

    '@typescript-eslint/ban-types': 'error'

    // TODO: enable lots of typescript rules found here:
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    // The reason we didn't enable 'plugin:@typescript-eslint/recommended' was because it required
    // REALLY slow ts processing. Somehow enable all rules that DON'T cause things to be slow.
  }
}

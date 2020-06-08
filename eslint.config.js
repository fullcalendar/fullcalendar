
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  plugins: [
    '@typescript-eslint',
    'react'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  rules: {
    'no-unused-vars': 0, // because can't get jsxFactory to work. and don't like func arg stipulation
    'no-undef': 0, // because tsc does this. hard to make work with tests globals
    'prefer-const': 0,
    'prefer-spread': 0,
    'prefer-rest-params': 0,
    'react/react-in-jsx-scope': 0, // requires React to always be imported
    'react/display-name': 0,
    'react/prop-types': 0,

    '@typescript-eslint/ban-types': 'error'

    // TODO: enable lots of typescript rules found here:
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
    // The reason we didn't enable 'plugin:@typescript-eslint/recommended' was because it required
    // REALLY slow ts processing. Somehow enable all rules that DON'T cause things to be slow.
  }
}

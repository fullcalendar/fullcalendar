
module.exports = {
  extends: 'airbnb-typescript',
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/semi': ['error', 'never'], // don't allow semicolons
    '@typescript-eslint/no-use-before-define': ['error', {
      variables: true,
      functions: false, // disable. i love hoisting functions
      classes: false, // "
    }],
    'object-curly-newline': ['error', {
      ImportDeclaration: { multiline: true } // newlines were required within `import` statements? disable. pretty sure this was a mistake
    }],
    'operator-linebreak': 'off', // prevents JSX if statements looking correct. REVISIT for other uses
    'prefer-const': 'off', // TODO: revisit
    'import/no-cycle': 'off', // TODO: reenable. disabled because circular deps are hard to fix right now
    'import/prefer-default-export': 'off', // named exports much better for .d.ts files
    'no-restricted-syntax': 'off', // was restricting for...of statements. a mistake it seems. REVISIT
    'react/jsx-props-no-spreading': 'off', // more acceptable in preact, b/c no proptype filtering
    'react/react-in-jsx-scope': 'off', // because we use preact
  }
}

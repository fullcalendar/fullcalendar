
module.exports = {
  extends: 'airbnb-typescript',
  settings: {
    react: {
      version: 'detect'
    }
  },
  // TODO: revisit these disabled rules
  rules: {
    '@typescript-eslint/semi': 0,
    'prefer-const': 0
  }
}

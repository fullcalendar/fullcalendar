
module.exports = {
  extends: [
    './eslint.base.cjs',
  ],
  ignorePatterns: [
    'dist',
  ],
  env: {
    node: true,
  },
}

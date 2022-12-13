/*
NOTE: unfortunately can't rename this file to `postcss.cjs` or error is thrown
*/

module.exports = {
  parser: require('postcss-comment'), // for "//" style comments
  plugins: [
    require('postcss-advanced-variables'),
    require('postcss-nesting'),
    require('autoprefixer'),
  ],
}

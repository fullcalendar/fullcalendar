/*
NOTE: unfortunately can't rename this file to `postcss.cjs` or error is thrown
*/

module.exports = {
  parser: require('postcss-comment'), // for "//" style comments
  plugins: [
    require('postcss-advanced-variables'),
    require('postcss-nesting'),
    require('autoprefixer'),

    // TODO: remove empty blocks
    // apparently it should automatically work with postcss-nesting, but doesn't seem to
    // https://github.com/jonathantneal/postcss-nesting/issues/19
  ],
}

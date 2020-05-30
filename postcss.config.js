module.exports = {
  parser: require('postcss-comment'), // for "//" style comments
  plugins: [
    require('postcss-advanced-variables'),
    require('postcss-nesting'),
    require('postcss-custom-properties')({
      importFrom: './packages/common/src/styles/vars.css', // available to all stylesheets
      preserve: true
    }),
    require('postcss-calc')

    // TODO: remove empty blocks
    // apparently it should automatically work with postcss-nesting, but doesn't seem to
    // https://github.com/jonathantneal/postcss-nesting/issues/19
  ]
}

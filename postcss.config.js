
module.exports = {
  parser: require('postcss-comment'), // for "//" style comments
  plugins: [
    require('postcss-advanced-variables'),
    require('postcss-nesting'),
    require('@arshaw/postcss-custom-properties')({ // a fork that does preserveWithFallback
      importFrom: './packages/common/src/styles/vars.css', // available to all stylesheets
      preserve: true, // keep var statements intact (but still reduce their value in a second statement)
      preserveWithFallback: true // the preserved var statements will have a fallback value
    }),
    require('postcss-calc')

    // TODO: remove empty blocks
    // apparently it should automatically work with postcss-nesting, but doesn't seem to
    // https://github.com/jonathantneal/postcss-nesting/issues/19
  ]
}

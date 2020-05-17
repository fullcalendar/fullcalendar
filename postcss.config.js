module.exports = {
  parser: require('postcss-comment'), // for "//" style comments. is a parser apparently :(
  plugins: [
    require('postcss-mixins'), // needs to be before postcss-nested ... dont need??? advanced-variables already do this
    require('postcss-advanced-variables'),
    require('postcss-nested'),
    require('postcss-nested-ancestors') // for & within nested
  ]
}

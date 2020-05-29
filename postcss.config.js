module.exports = {
  parser: require('postcss-comment'), // for "//" style comments
  plugins: [
    require('postcss-advanced-variables'),
    require('postcss-nested'),
    require('postcss-nested-ancestors'), // for & within nested ... needed?
    require('postcss-calc')
  ]
}

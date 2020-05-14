const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  devtool: 'sourcemap',
  entry: './tests-index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      }
    ]
  },
  output: {
    filename: 'tests-all.js',
    path: __dirname
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
}

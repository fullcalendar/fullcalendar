
let isDev = true
if (!/^(development|production)$/.test(process.env.BUILD)) {
  console.warn('BUILD environment not specified. Assuming \'development\'')
} else {
  isDev = process.env.BUILD === 'development'
}


const buildModuleConfigs = require('./scripts/lib/rollup-modules')
const buildBundleConfigs = require('./scripts/lib/rollup-bundles')
const buildTestConfigs = require('./scripts/lib/rollup-tests')
const buildDtsConfig = require('./scripts/lib/rollup-dts')


module.exports = [
  buildDtsConfig(),
  ...buildModuleConfigs(isDev),
  ...buildBundleConfigs(isDev),
  ...buildTestConfigs()
]

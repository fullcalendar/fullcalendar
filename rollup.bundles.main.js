const path = require('path')
const nodeResolve = require('@rollup/plugin-node-resolve')


const BUNDLE_DIRS = [ // TODO: use glob!
  'packages/bundle',
  'packages-premium/bundle'
]


module.exports = [
  ...BUNDLE_DIRS.map(bundleMainConfig),
]


function bundleMainConfig(bundleDir) {
  return {
    input: path.join(bundleDir, 'tsc/main.js'),
    output: {
      format: 'iife',
      name: 'FullCalendar',
      dir: path.join(bundleDir, 'dist')
    },
    plugins: [
      {
        resolveId(id, importer) {
          if (id.match(/\.(css|scss|sass)$/)) {
            return { id, external: true } // whaaaaaaa
          }
        }
      },
      nodeResolve()
    ]
  }
}

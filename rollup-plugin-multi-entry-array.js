// ripped from https://github.com/rollup/rollup-plugin-multi-entry/blob/master/src/index.js
// released under the MIT license: https://opensource.org/licenses/MIT

import { promise as matched } from 'matched' // TODO: add to package.json

const entry = '\0array-entry'

export default function multiEntry(config) {
  let include = []
  let exclude = []

  function configure(config) {
    if (typeof config === 'string') {
      include = [config]
    } else if (Array.isArray(config)) {
      include = config
    } else {
      include = config.include || []
      exclude = config.exclude || []
    }
  }

  if (config) {
    configure(config)
  }

  return {
    options(options) {
      if (options.input && options.input !== entry) {
        configure(options.input)
      }
      options.input = entry
    },

    resolveId(id) {
      if (id === entry) {
        return entry
      }
    },

    load(id) {
      if (id === entry) {
        if (!include.length) {
          return Promise.resolve('')
        }
        const patterns = include.concat(exclude.map(pattern => '!' + pattern))
        return matched(patterns, { realpath: true }).then(paths => {
          let s =
            paths.map((path, index) => `import _m${index} from ${JSON.stringify(path)}`).join(';\n') +
            ';\n' +
            'export default [\n' +
            paths.map((path, index) => `_m${index}`).join(', ') + '\n' +
            '];\n'
          return s
        })
      }
    }
  }
}

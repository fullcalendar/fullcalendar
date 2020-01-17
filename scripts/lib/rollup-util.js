const { readFileSync } = require('fs')
const path = require('path')
const glob = require('glob')
const cleanup = require('rollup-plugin-cleanup')
const sourcemaps = require('rollup-plugin-sourcemaps')
const replace = require('rollup-plugin-replace')
const handleBars = require('handlebars')
const rootPkgJsonData = require('../../package.json')


exports.EXTERNAL_BROWSER_GLOBALS = {
  fullcalendar: 'FullCalendar', // if this gets updated, update codebase...
  'fullcalendar-scheduler': 'FullCalendar',
  luxon: 'luxon',
  rrule: 'rrule',
  moment: 'moment',
  'moment-timezone/builds/moment-timezone-with-data': 'moment' // see moment-timezone/src/main.ts
}


exports.WATCH_OPTIONS = {
  chokidar: { // better than default watch util. doesn't fire change events on stat changes (like last opened)
    awaitWriteFinish: { // because tsc/rollup sometimes takes a long time to write and triggers two recompiles
      stabilityThreshold: 500,
      pollInterval: 100
    }
  },
  clearScreen: false // let tsc do the screan clearing
}


exports.SOURCEMAP_PLUGINS = [
  sourcemaps(),
  // HACK: there's a bug with sourcemap reading and watching: the first rebuild includes the intermediate
  // sourceMappingURL comments, confusing consumers of the generated sourcemap. Forcefully remove these comments.
  cleanup({ comments: 'none' })
]


exports.TEMPLATE_PLUGIN = replace({
  delimiters: [ '<%= ', ' %>' ],
  values: {
    version: rootPkgJsonData.version,
    releaseDate: new Date().toISOString().replace(/T.*/, '')
    // ^TODO: store this in package.json for easier old-release recreation
  }
})


exports.renderBanner = handleBars.compile(
  readFileSync(
    path.join(__dirname, '../../packages/banner.tpl'),
    { encoding: 'utf8' }
  )
)


const REL_PATH_RE = /^[/.]/
const SCSS_PATH_RE = /\.scss$/i
const TILDE_PATH_RE = /^~/


exports.onwarn = function(warning, warn) {
  // ignore circ dep warnings. too numerous and hard to fix right now
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    warn(warning)
  }
}


exports.isRelPath = function(path) {
  return REL_PATH_RE.test(path)
}


exports.isScssPath = function(path) {
  return SCSS_PATH_RE.test(path)
}


// a rollup plugin
// TODO: rename to watchSassIncludesInDir
// TODO: only look at names like _*.scss
exports.watchSubdirSassIncludes = {
  transform(code, id) {
    if (exports.isScssPath(id)) { // yuck
      let allStyleFiles = glob.sync(
        path.join(path.dirname(id), '**/*.{scss,sass,css}')
      )
      for (let styleFile of allStyleFiles) {
        this.addWatchFile(styleFile)
      }
    }
    return null
  }
}

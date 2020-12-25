const path = require('path')
const nodeResolve = require('@rollup/plugin-node-resolve').default
const alias = require('@rollup/plugin-alias')
const dts = require('rollup-plugin-dts').default
const sourceMapLoader = require('rollup-plugin-sourcemaps')
const postcss = require('rollup-plugin-postcss')
const { checkNoSymlinks, buildBanner } = require('./scripts/lib/new')
const {
  externalizeStylesheets, externalizeNonRelative, injectReleaseDateAndVersion,
  buildAliasMap, removeStylesheetImports, removeEmptyImports
} = require('./scripts/lib/new-rollup')


/*
needs tsc to run first
but needs symlinks killed also

compiles from TSC files
*/

const { publicPackageStructs } = require('./scripts/lib/package-index')
checkNoSymlinks(publicPackageStructs)


let pkgsWithBrowserGlobal = []
let browserGlobalByPkg = {}
for (let struct of publicPackageStructs) {
  if (struct.meta.browserGlobal) {
    pkgsWithBrowserGlobal.push(struct)
    browserGlobalByPkg[struct.name] = struct.meta.browserGlobal
  }
}

browserGlobalByPkg['@fullcalendar/common'] = 'FullCalendar'

const THIRD_PARTY_BROWSER_GLOBALS = {
  // preact: 'Preact', // we actually want this inlined
  rrule: 'rrule',
  moment: 'moment',
  'moment-timezone': 'moment',
  luxon: 'luxon',
  'ical.js': 'ICAL'
}
let allGlobals = { ...THIRD_PARTY_BROWSER_GLOBALS, ...browserGlobalByPkg }
let externalList = Object.keys(allGlobals)
let externalListNoCommon = externalList.filter((name) => name !== '@fullcalendar/common')
let aliasMap = buildAliasMap(publicPackageStructs)


module.exports = [

  // for JS (ESM)
  ...publicPackageStructs.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainTscJs),
      output: {
        format: 'es',
        file: path.join(struct.dir, struct.mainDistJs),
        sourcemap: true,
        banner: buildBanner(struct.isPremium)
      },
      plugins: [
        externalizeVDom('.js'),
        externalizeNonRelative(),
        sourceMapLoader(), // load from transpiled-via-tsc JS files
        postcss({ // will use postcss.config.js
          extract: true
        }),
        transplantCss(struct.mainName),
        injectReleaseDateAndVersion()
      ]
    }
  }),

  // for JS (CJS)
  ...publicPackageStructs.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainTscJs),
      output: [{
        format: 'cjs',
        exports: 'named',
        file: path.join(struct.dir, struct.mainDistJs.replace('.js', '.cjs.js')),
        banner: buildBanner(struct.isPremium)
      }],
      plugins: [
        externalizeVDom('.cjs'),
        externalizeNonRelative(),
        removeStylesheetImports(),
        injectReleaseDateAndVersion(),
        removeEmptyImports() // because of removeStylesheetImports and CJS
      ]
    }
  }),

  // vdom from @fullcalendar/core-preact
  {
    input: 'packages/core/tsc/vdom.js',
    output: [
      {
        format: 'cjs',
        exports: 'named',
        file: 'packages/core/vdom.cjs.js'
      },
      {
        format: 'esm',
        file: 'packages/core/vdom.js'
      }
    ],
    plugins: [
      externalizeNonRelative('@fullcalendar/core-preact'),
      nodeResolve()
    ]
  },
  {
    input: 'packages/common/tsc/vdom.js',
    output: [
      {
        format: 'cjs',
        exports: 'named',
        file: 'packages/common/vdom.cjs.js'
      },
      {
        format: 'esm',
        file: 'packages/common/vdom.js'
      }
    ],
    plugins: [
      externalizeNonRelative('@fullcalendar/core-preact'),
      nodeResolve()
    ]
  },

  // for global variable JS
  ...pkgsWithBrowserGlobal.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainGlobalTscJs),
      external: struct.name === '@fullcalendar/core' ? externalListNoCommon : externalList, // if core, inline common
      output: {
        format: 'iife',
        name: struct.meta.browserGlobal,
        exports: 'named',
        file: path.join(struct.dir, struct.mainDistJs.replace('.js', '.global.js')),
        banner: buildBanner(struct.isPremium),
        globals: allGlobals
      },
      plugins: [ // same plugins that rollup.bundle.js uses
        removeStylesheetImports(),
        alias({
          entries: aliasMap // TODO: for packages like @fullcalendar/common which will be inlined
        }),
        nodeResolve(), // for tslib
        injectReleaseDateAndVersion()
      ]
    }
  }),


  // for DTS
  ...publicPackageStructs.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainTscDts),
      output: {
        format: 'es',
        file: path.join(struct.dir, struct.mainDistDts),
      },
      plugins: [
        fixDtsCodeIn(),
        ensurePremiumCommonAmbient(),
        externalizeVDom(''),
        externalizeStylesheets(),
        externalizeNonRelative(),
        dts(),
        fixDtsCodeOut()
      ]
    }
  })

]


function transplantCss(fileName) { // fileName w/o extension
  let hasCss = false

  return         {
    resolveId(id, importer) {
      if (/^\./.test(id) && /\.css$/.test(id)) { // relative stylesheet
        hasCss = true
        let filePath = path.join(importer, '..', id)
        filePath = filePath.replace('/tsc/', '/src/') // not very robust!!!
        return filePath
      }
    },
    intro() {
      if (hasCss) {
        return `import './${fileName}.css';`
      } else {
        return ''
      }
    }
  }
}


function externalizeVDom(addExtension) {
  return {
    resolveId(id, importer) {
      if (/\/vdom$/.test(id) || id.match(/^(preact|react|react-dom)$/)) {
        if (
          importer.match('packages/common') ||
          importer.match('packages/core')
        ) {
          return { id: './vdom' + (addExtension || ''), external: true, moduleSideEffects: true }
        } else {
          return { id: '@fullcalendar/common', external: true, moduleSideEffects: true }
        }
      }
    }
  }
}


function ensurePremiumCommonAmbient() {
  return {
    resolveId(id) {
      if (id === '@fullcalendar/premium-common') {
        return { id, external: true, moduleSideEffects: true }
      }
    }
  }
}


function fixDtsCodeIn() {
  return {
    /*
    fix problem with tsc outputting random imports like this:
      import("../../../packages/common/src/plugin-system-struct")
      import("../../../packages/common/src/main")
    relevant tickets:
      https://github.com/microsoft/TypeScript/issues/38111 - "Declaration emit reveals paths within dependency that were not referred to in the source file"
    */
    resolveId(id, importer) {
      if (importer && id.match('packages/common')) {
        return { id: '@fullcalendar/common', external: true }
      }
    }
  }
}


function fixDtsCodeOut() {
  return {
    renderChunk(code) {

      // remove sourcemap comments and ///<reference>
      code = code.replace(/\/\/.*/g, '')

      /*
      tsc, for classes that have superclasses with getter methods, sometimes reference the return type like this:
        import("@fullcalendar/common/tsc/whatever").Something
      (and this is from WITHIN the @fullcalendar/common package)
      possible BUG with this hack: playing weird with TS triple-slash references
      relevant tickets:
        https://github.com/microsoft/TypeScript/issues/38111 - "Declaration emit reveals paths within dependency that were not referred to in the source file"
      */
      code = code.replace(/(['"]@fullcalendar\/[^'"]+)\/[^'"]+(['"])/g, function(m0, m1, m2) {
        return m1 + m2
      })

      /*
      sometimes tsc fully resolved generic vdom declarations to preact, which makes the VNode<any> a thing (which it shouldn't be)
      relevant tickets:
        https://github.com/microsoft/TypeScript/issues/37151 - "Declaration emit should not inline type definitions"
      */
      code = code.replace(/VNode<any>/g, 'VNode')

      if (/\b(p?react)\b/.test(code)) {
        throw new Error('BAD reference to preact/react in DTS')
      }

      return code
    }
  }
}

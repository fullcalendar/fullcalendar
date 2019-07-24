const path = require('path')
const bundleDts = require('@arshaw/dts-bundle').bundle
const { pkgStructs } = require('./pkg-struct')


exports.bundlPkgDefs = bundlPkgDefs


/*
Assumes granular .d.ts files have already been generated
*/
function bundlPkgDefs() {

  for (let pkgStruct of pkgStructs) {
    bundlePkgDef(pkgStruct)
  }

  return Promise.resolve() // need to return a promise even tho bundlePkgDef is synchronous
}


function bundlePkgDef(pkgStruct) {
  bundleDts({ // synchronous
    name: pkgStruct.name,
    main: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.d.ts'),
    transformModuleBody: transformDefaultClassExports,
    out: path.join(process.cwd(), pkgStruct.distDir, 'main.d.ts') // needs to be absolute, or becomes rel to entry
  })
}


// changes the name of the default export to `Default` and exports it as a *named* export.
// this allows ambient declaration merging to grab onto it.
// workaround for https://github.com/Microsoft/TypeScript/issues/14080
function transformDefaultClassExports(moduleBody) {
  return moduleBody.replace(/^(\s*)export default (abstract )?class ([\w]+)/mg, function(m0, m1, m2, m3) {
    return m1 + 'export { ' + m3 + ' as default, ' + m3 + ' };\n' +
      m1 + (m2 || '') + 'class ' + m3
  })
}

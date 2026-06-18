#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const STANDARD_ROOT = path.resolve(import.meta.dirname, '../../..')
const VANILLA_PKG = path.join(STANDARD_ROOT, 'packages/vanilla/package.json')
const VANILLA_DIST = path.join(STANDARD_ROOT, 'packages/vanilla/dist')
const ANGULAR_DIST = path.join(STANDARD_ROOT, 'packages/angular/dist/lib')

interface BuildExportConfig {
  format: 'module' | 'css' | 'global'
  [key: string]: unknown
}

// Read vanilla's buildConfig.exports
const vanillaPkg = JSON.parse(fs.readFileSync(VANILLA_PKG, 'utf-8'))
const buildExports: Record<string, BuildExportConfig> = vanillaPkg.buildConfig.exports

// 1. Get locale codes from vanilla dist (by scanning files)
const localeCodes = fs.readdirSync(path.join(VANILLA_DIST, 'locales'))
  .filter(f => f.endsWith('.js') && !f.includes('.global') && !f.includes('.min'))
  .map(f => f.replace('.js', ''))

console.log(`Found ${localeCodes.length} locale codes`)

// 2. Generate locale re-export files
fs.mkdirSync(path.join(ANGULAR_DIST, 'locales'), { recursive: true })
for (const code of localeCodes) {
  fs.writeFileSync(
    path.join(ANGULAR_DIST, `locales/${code}.mjs`),
    `export { default } from "fullcalendar/locales/${code}"\n`
  )
}
fs.writeFileSync(
  path.join(ANGULAR_DIST, 'locales/locale.d.ts'),
  `export { default } from "fullcalendar/locales/locale"\n`
)

console.log(`Generated ${localeCodes.length} locale JS files + locale.d.ts`)

// 3. Generate theme JS re-exports (driven by buildConfig.exports)
const themeModules = Object.entries(buildExports)
  .filter(([key, val]) => key.startsWith('./themes/') && val.format === 'module')
  .map(([key]) => key)

for (const exportKey of themeModules) {
  const themePath = exportKey.slice(2) // 'themes/classic'
  fs.mkdirSync(path.dirname(path.join(ANGULAR_DIST, themePath)), { recursive: true })
  fs.writeFileSync(
    path.join(ANGULAR_DIST, `${themePath}.mjs`),
    `export { default } from "fullcalendar/${themePath}"\n`
  )
  fs.writeFileSync(
    path.join(ANGULAR_DIST, `${themePath}.d.ts`),
    `export { default } from "fullcalendar/${themePath}"\n`
  )
}

console.log(`Generated ${themeModules.length} theme module re-exports`)

// 4. Generate plugin/utility module re-exports (driven by buildConfig.exports)
const pluginUtilityModules = Object.entries(buildExports)
  .filter(([key, val]) =>
    val.format === 'module' &&
    [
      './daygrid',
      './timegrid',
      './list',
      './multimonth',
      './interaction',
      './locales-all',
      './protected-api',
      './protected-styles'
    ].includes(key)
  )
  .map(([key]) => key)

for (const exportKey of pluginUtilityModules) {
  const modulePath = exportKey.slice(2) // 'daygrid', 'interaction', etc.

  // Special case: protected-api has no default export
  const content = modulePath === 'protected-api'
    ? `export * from "fullcalendar/${modulePath}"\n`
    : `export * from "fullcalendar/${modulePath}"\nexport { default } from "fullcalendar/${modulePath}"\n`

  fs.writeFileSync(path.join(ANGULAR_DIST, `${modulePath}.mjs`), content)
  fs.writeFileSync(path.join(ANGULAR_DIST, `${modulePath}.d.ts`), content)
}

console.log(`Generated ${pluginUtilityModules.length} plugin/utility module re-exports`)

// 5. Copy CSS files (driven by buildConfig.exports)
const cssExports = Object.entries(buildExports)
  .filter(([key, val]) => val.format === 'css')
  .map(([key]) => key)

for (const exportKey of cssExports) {
  const cssPath = exportKey.slice(2) // 'skeleton.css' or 'themes/classic/theme.css'
  const src = path.join(VANILLA_DIST, cssPath)
  const dest = path.join(ANGULAR_DIST, cssPath)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

console.log(`Copied ${cssExports.length} CSS files`)

// 6. Update package.json with new exports
const angularPkg = JSON.parse(fs.readFileSync(path.join(ANGULAR_DIST, 'package.json'), 'utf-8'))

// Add locale wildcard
angularPkg.exports['./locales/*'] = {
  types: './locales/locale.d.ts',
  default: './locales/*.mjs'
}

// Add theme module exports
for (const exportKey of themeModules) {
  const themePath = exportKey.slice(2)
  angularPkg.exports[exportKey] = {
    types: `./${themePath}.d.ts`,
    default: `./${themePath}.mjs`
  }
}

// Add CSS exports
for (const exportKey of cssExports) {
  angularPkg.exports[exportKey] = exportKey // './foo.css' -> './foo.css'
}

// Add plugin/utility module exports
for (const exportKey of pluginUtilityModules) {
  const modulePath = exportKey.slice(2)
  angularPkg.exports[exportKey] = {
    types: `./${modulePath}.d.ts`,
    default: `./${modulePath}.mjs`
  }
}

fs.writeFileSync(
  path.join(ANGULAR_DIST, 'package.json'),
  JSON.stringify(angularPkg, null, 2) + '\n'
)

console.log('Updated package.json exports')
console.log(`Total exports: ${Object.keys(angularPkg.exports).length}`)
console.log('Done!')

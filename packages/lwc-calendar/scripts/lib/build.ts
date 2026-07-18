import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import {
  basename,
  dirname,
  join,
  parse,
} from 'node:path'

type ThemeSpec = {
  palettes: string[]
}

export type AdditionalStaticResourceContext = {
  outputStaticResourcesDir: string
}

export type AppBuilderComponentConfig = {
  sourceDir: string
  componentName: string
}

export type LwcBuildConfig = {
  packageDir: string
  sourceLwcDir?: string
  componentName?: string
  componentLabel?: string
  componentDescription?: string
  appBuilderComponent?: AppBuilderComponentConfig
  copyAdditionalStaticResources?: (context: AdditionalStaticResourceContext) => Promise<void>
}

type BuildContext = {
  sourceLwcDir: string
  outputLwcRootDir: string
  outputLwcDir: string
  componentName: string
  outputStaticResourcesDir: string
  outputResourceDir: string
  componentLabel: string
  componentDescription: string
}

export const resourceMetaXmlText = `<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
  <cacheControl>Private</cacheControl>
  <contentType>application/zip</contentType>
</StaticResource>
`

const salesforceProjectConfigText = `${JSON.stringify({
  packageDirectories: [
    {
      path: 'force-app',
      default: true,
    },
  ],
  sourceApiVersion: '62.0',
}, null, 2)}
`

export async function buildLwcPackage(config: LwcBuildConfig) {
  const {
    packageDir,
    sourceLwcDir = join(packageDir, 'src'),
    componentName = 'fullCalendar',
    componentLabel = 'FullCalendar',
    componentDescription = 'FullCalendar component',
    appBuilderComponent,
    copyAdditionalStaticResources,
  } = config
  const distDir = join(packageDir, 'dist')
  const defaultMetadataDir = join(distDir, 'force-app', 'main', 'default')
  const outputLwcRootDir = join(defaultMetadataDir, 'lwc')
  const outputLwcDir = join(outputLwcRootDir, componentName)
  const outputStaticResourcesDir = join(defaultMetadataDir, 'staticresources')
  const outputResourceDir = join(outputStaticResourcesDir, 'fullCalendarLib')
  const context: BuildContext = {
    sourceLwcDir,
    outputLwcRootDir,
    outputLwcDir,
    componentName,
    outputStaticResourcesDir,
    outputResourceDir,
    componentLabel,
    componentDescription,
  }
  const packageJsonPath = join(packageDir, 'package.json')
  const require = createRequire(packageJsonPath)
  const fcPkgPath = require.resolve('fullcalendar/package.json')
  const fcDistDir = resolveDistDirFromPackageJson(fcPkgPath)

  await rm(distDir, { recursive: true, force: true })

  const themes = await readThemes(join(fcDistDir, 'themes'))
  const locales = await readLocales(join(fcDistDir, 'locales'))

  await copyLwcSource(context)

  if (appBuilderComponent) {
    await copyAppBuilderComponent(context, appBuilderComponent, themes, locales)
  }

  await copyStaticResources(context, fcDistDir, themes, locales)
  await writeFile(
    join(outputStaticResourcesDir, 'fullCalendarLib.resource-meta.xml'),
    resourceMetaXmlText,
  )

  if (copyAdditionalStaticResources) {
    await copyAdditionalStaticResources({ outputStaticResourcesDir })
  }

  await writeFile(join(distDir, 'sfdx-project.json'), salesforceProjectConfigText)
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function resolveDistDirFromPackageJson(packageJsonPath: string) {
  const packageDirPath = dirname(packageJsonPath)

  return parse(packageDirPath).base === 'dist'
    ? packageDirPath
    : join(packageDirPath, 'dist')
}

async function copyLwcSource(context: BuildContext) {
  const {
    sourceLwcDir,
    outputLwcDir,
    componentName,
    componentLabel,
    componentDescription,
  } = context

  await mkdir(outputLwcDir, { recursive: true })
  await copyFile(
    join(sourceLwcDir, 'fullCalendar.html'),
    join(outputLwcDir, `${componentName}.html`),
  )

  await copyFile(
    join(sourceLwcDir, 'fullCalendar.js'),
    join(outputLwcDir, `${componentName}.js`),
  )

  const metaTemplate = await readFile(join(sourceLwcDir, 'fullCalendar.js-meta.xml.template'), 'utf8')

  await writeFile(
    join(outputLwcDir, `${componentName}.js-meta.xml`),
    metaTemplate
      .replace('{{COMPONENT_LABEL}}', escapeXml(componentLabel))
      .replace('{{COMPONENT_DESCRIPTION}}', escapeXml(componentDescription)),
  )
}

async function copyAppBuilderComponent(
  context: BuildContext,
  config: AppBuilderComponentConfig,
  themes: Map<string, ThemeSpec>,
  locales: string[],
) {
  const {
    sourceDir,
    componentName,
  } = config
  const outputDir = join(context.outputLwcRootDir, componentName)

  await mkdir(outputDir, { recursive: true })
  await copyFile(
    join(sourceDir, `${componentName}.html`),
    join(outputDir, `${componentName}.html`),
  )
  await copyFile(
    join(sourceDir, `${componentName}.js`),
    join(outputDir, `${componentName}.js`),
  )

  const themeDatasource = Array.from(themes.keys()).join(',')
  const localeDatasource = ['en', ...locales.filter((locale) => locale !== 'en')].join(',')
  const metadata = await readFile(
    join(sourceDir, `${componentName}.js-meta.xml`),
    'utf8',
  )

  await writeFile(
    join(outputDir, `${componentName}.js-meta.xml`),
    metadata
      .replace('{{THEME_DATASOURCE}}', themeDatasource)
      .replace('{{LOCALE_DATASOURCE}}', localeDatasource),
  )
}

async function copyStaticResources(
  context: BuildContext,
  fcDistDir: string,
  themes: Map<string, ThemeSpec>,
  locales: string[],
) {
  const { outputResourceDir } = context
  const outputAllDir = join(outputResourceDir, 'all')

  await mkdir(outputResourceDir, { recursive: true })
  await mkdir(outputAllDir, { recursive: true })

  await copyFile(join(fcDistDir, 'all', 'global.js'), join(outputAllDir, 'global.js'))
  await copyFile(join(fcDistDir, 'skeleton.css'), join(outputResourceDir, 'skeleton.css'))

  const outputThemesDir = join(outputResourceDir, 'themes')

  await mkdir(outputThemesDir, { recursive: true })

  for (const [themeName, themeSpec] of themes.entries()) {
    const inputThemeDir = join(fcDistDir, 'themes', themeName)
    const outputThemeDir = join(outputThemesDir, themeName)

    await mkdir(outputThemeDir, { recursive: true })

    await copyFile(join(inputThemeDir, 'global.js'), join(outputThemeDir, 'global.js'))
    await copyFile(join(inputThemeDir, 'theme.css'), join(outputThemeDir, 'theme.css'))

    if (themeName === 'classic') {
      await copyFile(join(inputThemeDir, 'palette.css'), join(outputThemeDir, 'palette.css'))
    } else {
      const outputPaletteDir = join(outputThemeDir, 'palettes')

      await mkdir(outputPaletteDir, { recursive: true })

      for (const paletteName of themeSpec.palettes) {
        await copyFile(
          join(inputThemeDir, 'palettes', `${paletteName}.css`),
          join(outputPaletteDir, `${paletteName}.css`),
        )
      }
    }
  }

  const outputLocalesDir = join(outputResourceDir, 'locales')

  await mkdir(outputLocalesDir, { recursive: true })

  for (const localeName of locales) {
    const outputLocaleDir = join(outputLocalesDir, localeName)

    await mkdir(outputLocaleDir, { recursive: true })
    await copyFile(
      join(fcDistDir, 'locales', localeName, 'global.js'),
      join(outputLocaleDir, 'global.js'),
    )
  }
}

async function readThemes(themesDir: string) {
  const themeEntries = await readdir(themesDir, { withFileTypes: true })
  const themes = new Map<string, ThemeSpec>()

  for (const themeEntry of themeEntries) {
    if (!themeEntry.isDirectory()) {
      continue
    }

    const themeName = themeEntry.name
    const themeDir = join(themesDir, themeName)

    await assertExists(join(themeDir, 'global.js'))
    await assertExists(join(themeDir, 'theme.css'))

    let palettes: string[] = []
    const palettesDir = join(themeDir, 'palettes')

    try {
      const paletteEntries = await readdir(palettesDir, { withFileTypes: true })
      palettes = paletteEntries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
        .map((entry) => basename(entry.name, '.css'))
        .sort((left, right) => left.localeCompare(right))
    } catch {
      await assertExists(join(themeDir, 'palette.css'))
      palettes = ['default']
    }

    if (!palettes.length) {
      throw new Error(`Theme ${themeName} did not expose any palette CSS files`)
    }

    themes.set(themeName, { palettes })
  }

  return new Map(Array.from(themes.entries()).sort(([left], [right]) => left.localeCompare(right)))
}

async function readLocales(localesDir: string) {
  const localeEntries = await readdir(localesDir, { withFileTypes: true })

  return localeEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

async function assertExists(filePath: string) {
  await access(filePath)
}

import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import { type TransformPluginContext, type OutputBundle, type OutputAsset } from 'rollup'
import { HashGenerator } from './hash-generator.ts'

export default function transformClassNamesPlugin(minify: boolean, isPublicMui: boolean) {
  return {
    name: 'transform-classnames',

    // for JS
    // must be aware of source file
    transform(this: TransformPluginContext, code: string, id: string) {
      const themeName = getThemeName(id, isPublicMui)
      if (themeName) {
        // console.log('MATCH', { themeName, id })
        if (id.endsWith('.js')) {
          if (isPublicMui && !id.endsWith('Views.js') && !id.endsWith('icons.js')) {
            return null // don't transform EventCalendar/Scheduler.js, which contains sx props
          }
          return transformJs(themeName, isPublicMui, minify, code, this.parse(code))
        }
      } else {
        // console.log('NO-MATCH', { themeName, id })
      }
    },

    // for CSS
    // works on files outputted via rollup's .emitFile
    generateBundle(_options: unknown, bundle: OutputBundle) {
      for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunkOrAsset.type === 'asset') {
          const asset = chunkOrAsset as OutputAsset
          const themeName = getThemeName(fileName, isPublicMui)
          if (themeName) {
            // console.log('MATCH', { themeName, fileName })
            const cssText =
              typeof asset.source === 'string'
                ? asset.source
                : Buffer.from(asset.source).toString('utf8')
            const result = transformCss(themeName, isPublicMui, minify, cssText)
            asset.source = result.code
          } else {
            // console.log('NO-MATCH', { themeName, fileName })
          }
        }
      }
    }
  }
}

function getThemeName(pathId: string, isPublicMui: boolean): string | undefined {
  if (isPublicMui) {
    // JS (in tsout)
    let match = pathId.match(/\/ui\-mui\/dist\/\.tsout\/([A-Za-z]+)\//) // brittle
    if (match) {
      return match[1]
    }

    // CSS (emitted, relative to dist)
    match = pathId.match(/^([A-Za-z]+)\/theme\.css/) // brittle
    if (match) {
      return match[1]
    }
  } else {
    // JS & CSS
    const match = pathId.match(/themes\/([A-Za-z]+)\//) // brittle
    if (match) {
      return match[1]
    }
  }
}

function transformJs(themeName: string, isPublicMui: boolean, minify: boolean, code: string, ast: any) {
  const s = new MagicString(code)

  walk(ast, {
    enter(node) {
      // 1) Plain string literals: "foo", 'bar'
      if (node.type === 'Literal' && typeof node.value === 'string') {
        const original = node.value
        const updated = transformJsString(themeName, isPublicMui, minify, original)

        // Replace source text with a new quoted literal
        s.overwrite(node.start, node.end, JSON.stringify(updated))
      }

      // 2) Template literals: `foo ${bar} baz`
      if (node.type === 'TemplateLiteral') {
        for (const quasi of node.quasis) {
          if (quasi.start < quasi.end) {
            const original = quasi.value.cooked ?? quasi.value.raw
            const updated = transformJsString(themeName, isPublicMui, minify, original)

            // You must escape backticks and ${ inside template segments
            const escaped = updated
              .replace(/(`|\${)/g, '\\$1')
              .replace(/\r/g, '\\r')
              .replace(/\n/g, '\\n')
              .replace(/\t/g, '\\t')

            // `quasi.start`/`quasi.end` cover the raw text inside the backticks
            // in most ESTree parsers; overwrite that region
            s.overwrite(quasi.start, quasi.end, escaped)

            // Keep AST consistent if something else reuses it
            quasi.value.cooked = updated
            quasi.value.raw = escaped
          }
        }
      }
    },
  })

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true }),
  };
}

function transformJsString(themeName: string, isPublicMui: boolean, minify: boolean, s: string): string {
  return s.split(' ').map((part) => transformPotentialClassName(themeName, isPublicMui, minify, part)).join(' ')
}

function transformPotentialClassName(themeName: string, isPublicMui: boolean, minify: boolean, potentialClassName: string): string {
  if (isClassName(potentialClassName)) {
    return transformClassName(themeName, isPublicMui, minify, potentialClassName)
  }
  return potentialClassName
}

const exactClassNames: { [key: string]: 1 } = {
  'root-reset': 1,
  'button-reset': 1,
  'link-reset': 1,
}

const tailwindClassNamePrefixes: { [key: string]: 1 } = {
  mt: 1,
  mb: 1,
  ml: 1,
  mr: 1,
  ms: 1,
  me: 1,
  mx: 1,
  my: 1,
  pt: 1,
  pb: 1,
  pl: 1,
  pr: 1,
  ps: 1,
  pe: 1,
  px: 1,
  py: 1,
  border: 1,
  relative: 1,
  absolute: 1,
  text: 1,
  size: 1,
  items: 1,
  rounded: 1,
  shadow: 1,
  flex: 1,
  hidden: 1,
  justify: 1,
  grow: 1,
  overflow: 1,
  self: 1,
  shrink: 1,
  whitespace: 1,
  gap: 1,
  group: 1,
  rotate: 1,
  bg: 1,
  inset: 1,
  ring: 1,
  opacity: 1,
  uppercase: 1,
  font: 1,
  outline: 1,
  order: 1,
  italic: 1,
  left: 1,
  right: 1,
  pointer: 1, // for pointer-events
}

function isClassName(s: string): boolean {
  if (
    s.startsWith('[') ||
    s.startsWith('p-') ||
    s.startsWith('m-') ||
    s.startsWith('-m-') ||
    s.startsWith('w-') ||
    s.startsWith('h-') ||
    s.startsWith('min-w-') ||
    s.startsWith('min-h-') ||
    s.startsWith('max-w-') ||
    s.startsWith('max-h-') ||
    s.startsWith('hover:') ||
    s.startsWith('active:') ||
    s.startsWith('print:') ||
    s.startsWith('last:') ||
    s.startsWith('first:') ||
    s.startsWith('not-') ||
    s.startsWith('focus-visible:') ||
    s.startsWith('start-') ||
    s.startsWith('end-') ||
    s.startsWith('top-') ||
    s.startsWith('bottom-') ||
    s.startsWith('-start-') ||
    s.startsWith('-end-') ||
    s.startsWith('-top-') ||
    s.startsWith('-bottom-')
  ) {
    return true
  }

  if (exactClassNames[s]) {
    return true
  }

  const match = s.match(/^(-)?([a-z]+)/)
  if (match) {
    if (tailwindClassNamePrefixes[match[2]]) {
      return true
    }
  }

  return false
}

function transformCss(themeName: string, isPublicMui: boolean, minify: boolean, code: string) {
  const root = postcss.parse(code, { from: undefined })

  const transformSelector = selectorParser(selectors => {
    selectors.walkClasses(classNode => {
      classNode.value = transformClassName(themeName, isPublicMui, minify, classNode.value)
    })
  })

  root.walkRules(rule => {
    if (!rule.selector) return
    rule.selector = transformSelector.processSync(rule.selector)
  })

  const result = root.toResult()

  return {
    code: result.css,
    map: null, // or result.map.toJSON() -- doesn't work
  }
}

function transformClassName(themeName: string, isPublicMui: boolean, minify: boolean, className: string) {
  if (minify) {
    return generateObfuscatedClassName(themeName, isPublicMui, className)
  }
  return 'fc' + themeName.charAt(0) + '-' + className
}

function generateObfuscatedClassName(themeName: string, isPublicMui: boolean, className: string): string {
  const hashGenerator = getHashGenerator(isPublicMui, themeName)
  return 'fc-' + themeName + '-' + hashGenerator.generate(className)!
}

const muiHashGeneratorsByTheme: { [themeName: string]: HashGenerator } = {}
const nonMuiHashGeneratorsByTheme: { [themeName: string]: HashGenerator } = {}

function getHashGenerator(isPublicMui: boolean, themeName: string): HashGenerator {
  const hashGeneratorsByTheme = isPublicMui
    ? muiHashGeneratorsByTheme
    : nonMuiHashGeneratorsByTheme

  const charLength = 3
  const salt = isPublicMui ? 'mui' : 'non-mui'

  if (!hashGeneratorsByTheme[themeName]) {
    hashGeneratorsByTheme[themeName] = new HashGenerator(charLength, salt)
  }

  return hashGeneratorsByTheme[themeName]
}

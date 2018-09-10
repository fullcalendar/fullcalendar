import { assignTo, mapHash } from '../util/object'
import { refineProps } from '../util/misc'

export type ViewClass = any

export interface ViewDefInputObject {
  type?: string
  class?: ViewClass
  [optionName: string]: any
}

export type ViewDefInput = ViewClass | ViewDefInputObject
export type ViewDefInputHash = { [viewType: string]: ViewDefInput }

export interface ViewDefParse {
  superType: string
  class: ViewClass | null
  options: any
}

export type ViewDefParseHash = { [viewType: string]: ViewDefParse }

export interface ViewDef {
  type: string
  class: ViewClass
  overrides: any
  defaults: any
}

export type ViewDefHash = { [viewType: string]: ViewDef }

export function parseViewDefInputs(inputs: ViewDefInputHash): ViewDefParseHash {
  return mapHash(inputs, parseViewDefInput)
}

export function compileViewDefs(defaults: ViewDefParseHash, overrides: ViewDefParseHash): ViewDefHash {
  let hash: ViewDefHash = {}
  let viewType: string

  for (viewType in defaults) {
    ensureViewDef(viewType, hash, defaults, overrides)
  }

  for (viewType in overrides) {
    ensureViewDef(viewType, hash, defaults, overrides)
  }

  return hash
}

const VIEW_DEF_PROPS = {
  type: String,
  class: null
}

function parseViewDefInput(input: ViewDefInput): ViewDefParse {
  if (typeof input === 'function') {
    input = { class: input }
  }

  let options = {}
  let props = refineProps(input, VIEW_DEF_PROPS, {}, options)

  return {
    superType: props.type,
    class: props.class,
    options
  }
}

function ensureViewDef(viewType: string, hash: ViewDefHash, defaults: ViewDefParseHash, overrides: ViewDefParseHash): ViewDef | null {
  if (hash[viewType]) {
    return hash[viewType]
  }

  let viewDef = buildViewDef(viewType, hash, defaults, overrides)

  if (viewDef) {
    hash[viewType] = viewDef
  }

  return viewDef
}

function buildViewDef(viewType: string, hash: ViewDefHash, defaults: ViewDefParseHash, overrides: ViewDefParseHash): ViewDef | null {
  let defaultParse = defaults[viewType]
  let overrideParse = overrides[viewType]

  let queryProp = function(name) {
    return (defaultParse && defaultParse[name] !== null) ? defaultParse[name] :
      ((overrideParse && overrideParse[name] !== null) ? overrideParse[name] : null)
  }

  let theClass = queryProp('class') as ViewClass
  let superType = queryProp('superType') as string

  if (!superType && theClass) {
    superType =
      findViewNameBySubclass(theClass, overrides) ||
      findViewNameBySubclass(theClass, defaults)
  }

  let superDef = superType ? ensureViewDef(superType, hash, defaults, overrides) : null

  if (!theClass && superDef) {
    theClass = superDef.class
  }

  if (!theClass) {
    return null // don't throw a warning, might be settings for a single-unit view
  }

  return {
    type: viewType,
    class: theClass,
    defaults: assignTo(
      {},
      superDef ? superDef.defaults : {},
      defaultParse ? defaultParse.options : {}
    ),
    overrides: assignTo(
      {},
      superDef ? superDef.overrides : {},
      overrideParse ? overrideParse.options : {}
    )
  }
}

function findViewNameBySubclass(viewSubclass: ViewClass, parseHash: ViewDefParseHash): string {
  for (let viewType in parseHash) {
    let parsed = parseHash[viewType]

    if (parsed.class && viewSubclass.prototype instanceof parsed.class) {
      return viewType
    }
  }

  return ''
}

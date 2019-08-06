import { ViewClass, ViewConfigHash } from './view-config'

/*
Represents information for an instantiatable View class along with settings
that are specific to that view. No other settings, like calendar-wide settings, are stored.
*/
export interface ViewDef {
  type: string
  class: ViewClass
  overrides: any
  defaults: any
}

export type ViewDefHash = { [viewType: string]: ViewDef }

export function compileViewDefs(defaultConfigs: ViewConfigHash, overrideConfigs: ViewConfigHash): ViewDefHash {
  let hash: ViewDefHash = {}
  let viewType: string

  for (viewType in defaultConfigs) {
    ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs)
  }

  for (viewType in overrideConfigs) {
    ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs)
  }

  return hash
}

function ensureViewDef(viewType: string, hash: ViewDefHash, defaultConfigs: ViewConfigHash, overrideConfigs: ViewConfigHash): ViewDef | null {
  if (hash[viewType]) {
    return hash[viewType]
  }

  let viewDef = buildViewDef(viewType, hash, defaultConfigs, overrideConfigs)

  if (viewDef) {
    hash[viewType] = viewDef
  }

  return viewDef
}

function buildViewDef(viewType: string, hash: ViewDefHash, defaultConfigs: ViewConfigHash, overrideConfigs: ViewConfigHash): ViewDef | null {
  let defaultConfig = defaultConfigs[viewType]
  let overrideConfig = overrideConfigs[viewType]

  let queryProp = function(name) {
    return (defaultConfig && defaultConfig[name] !== null) ? defaultConfig[name] :
      ((overrideConfig && overrideConfig[name] !== null) ? overrideConfig[name] : null)
  }

  let theClass = queryProp('class') as ViewClass
  let superType = queryProp('superType') as string

  if (!superType && theClass) {
    superType =
      findViewNameBySubclass(theClass, overrideConfigs) ||
      findViewNameBySubclass(theClass, defaultConfigs)
  }

  let superDef: ViewDef | null = null

  if (superType) {

    if (superType === viewType) {
      throw new Error('Can\'t have a custom view type that references itself')
    }

    superDef = ensureViewDef(superType, hash, defaultConfigs, overrideConfigs)
  }

  if (!theClass && superDef) {
    theClass = superDef.class
  }

  if (!theClass) {
    return null // don't throw a warning, might be settings for a single-unit view
  }

  return {
    type: viewType,
    class: theClass,
    defaults: {
      ...(superDef ? superDef.defaults : {}),
      ...(defaultConfig ? defaultConfig.options : {})
    },
    overrides: {
      ...(superDef ? superDef.overrides : {}),
      ...(overrideConfig ? overrideConfig.options : {})
    }
  }
}

function findViewNameBySubclass(viewSubclass: ViewClass, configs: ViewConfigHash): string {
  let superProto = Object.getPrototypeOf(viewSubclass.prototype)

  for (let viewType in configs) {
    let parsed = configs[viewType]

    // need DIRECT subclass, so instanceof won't do it
    if (parsed.class && parsed.class.prototype === superProto) {
      return viewType
    }
  }

  return ''
}

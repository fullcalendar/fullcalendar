import { ViewConfigHash, ViewComponentType } from './view-config'
import DateProfileGenerator from '../DateProfileGenerator'

/*
Represents information for an instantiatable View class along with settings
that are specific to that view. No other settings, like calendar-wide settings, are stored.
*/
export interface ViewDef {
  type: string
  component: ViewComponentType
  usesMinMaxTime: boolean
  dateProfileGeneratorClass: any
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

  let theComponent = queryProp('component') as ViewComponentType
  let superType = queryProp('superType') as string
  let superDef: ViewDef | null = null

  if (superType) {

    if (superType === viewType) {
      throw new Error('Can\'t have a custom view type that references itself')
    }

    superDef = ensureViewDef(superType, hash, defaultConfigs, overrideConfigs)
  }

  if (!theComponent && superDef) {
    theComponent = superDef.component
  }

  if (!theComponent) {
    return null // don't throw a warning, might be settings for a single-unit view
  }

  // TODO: better system
  let usesMinMaxTime = queryProp('usesMinMaxTime')
  if (usesMinMaxTime == null) {
    usesMinMaxTime = superDef ? superDef.usesMinMaxTime : false
  }

  // TODO: better system
  let dateProfileGeneratorClass = queryProp('dateProfileGeneratorClass')
  if (!dateProfileGeneratorClass) {
    dateProfileGeneratorClass = superDef ? superDef.dateProfileGeneratorClass : DateProfileGenerator
  }

  return {
    type: viewType,
    component: theComponent,
    usesMinMaxTime,
    dateProfileGeneratorClass,
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

import { ViewDef, compileViewDefs } from './view-def'
import { Duration, createDuration, greatestDurationDenominator, getWeeksFromInput } from '../datelib/duration'
import OptionsManager from '../OptionsManager'
import { assignTo, mapHash } from '../util/object'
import { globalDefaults } from '../options'
import { ViewConfigInputHash, parseViewConfigs, ViewConfigHash, ViewClass } from './view-config'

/*
Represents everything needed to instantiate a new view instance,
including options that have been compiled from view-specific and calendar-wide options,
as well as duration information.

Overall flow:
ViewConfig -> ViewDef -> ViewSpec
*/
export interface ViewSpec {
  type: string
  class: ViewClass
  duration: Duration
  durationUnit: string
  singleUnit: string
  options: any,
  buttonTextOverride: string
  buttonTextDefault: string
}

export type ViewSpecHash = { [viewType: string]: ViewSpec }

export function buildViewSpecs(defaultInputs: ViewConfigInputHash, optionsManager: OptionsManager): ViewSpecHash {
  let defaultConfigs = parseViewConfigs(defaultInputs)
  let overrideConfigs = parseViewConfigs(optionsManager.overrides.views)
  let viewDefs = compileViewDefs(defaultConfigs, overrideConfigs)

  return mapHash(viewDefs, function(viewDef) {
    return buildViewSpec(viewDef, overrideConfigs, optionsManager)
  })
}

function buildViewSpec(viewDef: ViewDef, overrideConfigs: ViewConfigHash, optionsManager: OptionsManager): ViewSpec {
  let durationInput =
    viewDef.overrides.duration ||
    viewDef.defaults.duration ||
    optionsManager.dynamicOverrides.duration ||
    optionsManager.overrides.duration

  let duration = null
  let durationUnit = ''
  let singleUnit = ''
  let singleUnitOverrides = {}

  if (durationInput) {
    duration = createDuration(durationInput)

    if (duration) { // valid?
      let denom = greatestDurationDenominator(
        duration,
        !getWeeksFromInput(durationInput)
      )

      durationUnit = denom.unit

      if (denom.value === 1) {
        singleUnit = durationUnit
        singleUnitOverrides = overrideConfigs[durationUnit] ? overrideConfigs[durationUnit].options : {}
      }
    }
  }

  let queryButtonText = function(options) {
    let buttonText = options.buttonText || {}

    if (buttonText[viewDef.type] != null) {
      return buttonText[viewDef.type]
    }
    if (buttonText[singleUnit] != null) {
      return buttonText[singleUnit]
    }
  }

  return {
    type: viewDef.type,
    class: viewDef.class,
    duration,
    durationUnit,
    singleUnit,

    options: assignTo(
      {},
      globalDefaults,
      viewDef.defaults,
      optionsManager.dirDefaults,
      optionsManager.localeDefaults,
      optionsManager.overrides,
      singleUnitOverrides,
      viewDef.overrides,
      optionsManager.dynamicOverrides
    ),

    buttonTextOverride:
      queryButtonText(optionsManager.dynamicOverrides) ||
      queryButtonText(optionsManager.overrides) || // constructor-specified buttonText lookup hash takes precedence
      viewDef.overrides.buttonText, // `buttonText` for view-specific options is a string

    buttonTextDefault:
      queryButtonText(optionsManager.localeDefaults) ||
      queryButtonText(optionsManager.dirDefaults) ||
      viewDef.defaults.buttonText || // a single string. from ViewSubclass.defaults
      queryButtonText(globalDefaults) ||
      viewDef.type // fall back to given view name
  }
}

import { ViewDef, compileViewDefs } from './view-def'
import { Duration, createDuration, greatestDurationDenominator, DurationInput } from '../datelib/duration'
import { mapHash } from '../util/object'
import { ViewOptions, CalendarOptions, BASE_OPTION_DEFAULTS } from '../options'
import { ViewConfigInputHash, parseViewConfigs, ViewConfigHash, ViewComponentType } from './view-config'

/*
Represents everything needed to instantiate a new view instance,
including options that have been compiled from view-specific and calendar-wide options,
as well as duration information.

Overall flow:
ViewConfig -> ViewDef -> ViewSpec
*/
export interface ViewSpec {
  type: string
  component: ViewComponentType
  duration: Duration
  durationUnit: string
  singleUnit: string
  optionDefaults: ViewOptions
  optionOverrides: ViewOptions
  buttonTextOverride: string
  buttonTextDefault: string
}

export type ViewSpecHash = { [viewType: string]: ViewSpec }

export function buildViewSpecs(
  defaultInputs: ViewConfigInputHash,
  optionOverrides: CalendarOptions,
  dynamicOptionOverrides: CalendarOptions,
  localeDefaults,
): ViewSpecHash {
  let defaultConfigs = parseViewConfigs(defaultInputs)
  let overrideConfigs = parseViewConfigs(optionOverrides.views)
  let viewDefs = compileViewDefs(defaultConfigs, overrideConfigs)

  return mapHash(viewDefs, (viewDef) => buildViewSpec(viewDef, overrideConfigs, optionOverrides, dynamicOptionOverrides, localeDefaults))
}

function buildViewSpec(
  viewDef: ViewDef,
  overrideConfigs: ViewConfigHash,
  optionOverrides: CalendarOptions,
  dynamicOptionOverrides: CalendarOptions,
  localeDefaults,
): ViewSpec {
  let durationInput =
    viewDef.overrides.duration ||
    viewDef.defaults.duration ||
    dynamicOptionOverrides.duration ||
    optionOverrides.duration

  let duration = null
  let durationUnit = ''
  let singleUnit = ''
  let singleUnitOverrides: ViewOptions = {}

  if (durationInput) {
    duration = createDurationCached(durationInput)

    if (duration) { // valid?
      let denom = greatestDurationDenominator(duration)
      durationUnit = denom.unit

      if (denom.value === 1) {
        singleUnit = durationUnit
        singleUnitOverrides = overrideConfigs[durationUnit] ? overrideConfigs[durationUnit].rawOptions : {}
      }
    }
  }

  let queryButtonText = (optionsSubset) => {
    let buttonTextMap = optionsSubset.buttonText || {}
    let buttonTextKey = viewDef.defaults.buttonTextKey as string

    if (buttonTextKey != null && buttonTextMap[buttonTextKey] != null) {
      return buttonTextMap[buttonTextKey]
    }

    if (buttonTextMap[viewDef.type] != null) {
      return buttonTextMap[viewDef.type]
    }

    if (buttonTextMap[singleUnit] != null) {
      return buttonTextMap[singleUnit]
    }

    return null
  }

  return {
    type: viewDef.type,
    component: viewDef.component,
    duration,
    durationUnit,
    singleUnit,
    optionDefaults: viewDef.defaults,
    optionOverrides: { ...singleUnitOverrides, ...viewDef.overrides },

    buttonTextOverride:
      queryButtonText(dynamicOptionOverrides) ||
      queryButtonText(optionOverrides) || // constructor-specified buttonText lookup hash takes precedence
      viewDef.overrides.buttonText, // `buttonText` for view-specific options is a string

    buttonTextDefault:
      queryButtonText(localeDefaults) ||
      viewDef.defaults.buttonText ||
      queryButtonText(BASE_OPTION_DEFAULTS) ||
      viewDef.type, // fall back to given view name
  }
}

// hack to get memoization working

let durationInputMap: { [json: string]: Duration } = {}

function createDurationCached(durationInput: DurationInput) {
  let json = JSON.stringify(durationInput)
  let res = durationInputMap[json]

  if (res === undefined) {
    res = createDuration(durationInput)
    durationInputMap[json] = res
  }

  return res
}

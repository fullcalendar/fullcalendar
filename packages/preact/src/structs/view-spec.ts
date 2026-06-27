import { ViewDef, compileViewDefs } from './view-def'
import { Duration, createDuration, greatestDurationDenominator, DurationInput } from '@full-ui/headless-calendar'
import { mapHash } from '../util/object'
import { ViewOptions, CalendarOptions } from '../options'
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
}

export type ViewSpecHash = { [viewType: string]: ViewSpec }

export function buildViewSpecs(
  defaultInputs: ViewConfigInputHash,
  optionOverrides: CalendarOptions,
  dynamicOptionOverrides: CalendarOptions,
): ViewSpecHash {
  let defaultConfigs = parseViewConfigs(defaultInputs)
  let overrideConfigs = parseViewConfigs(optionOverrides.views)
  let viewDefs = compileViewDefs(defaultConfigs, overrideConfigs)

  return mapHash(viewDefs, (viewDef) => buildViewSpec(viewDef, overrideConfigs, optionOverrides, dynamicOptionOverrides))
}

function buildViewSpec(
  viewDef: ViewDef,
  overrideConfigs: ViewConfigHash,
  optionOverrides: CalendarOptions,
  dynamicOptionOverrides: CalendarOptions,
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

  return {
    type: viewDef.type,
    component: viewDef.component,
    duration,
    durationUnit,
    singleUnit,
    optionDefaults: viewDef.defaults,
    optionOverrides: { ...singleUnitOverrides, ...viewDef.overrides },
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

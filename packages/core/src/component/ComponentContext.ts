import { Calendar } from '../Calendar'
import { ResizeHandler } from '../Calendar'
import { ViewApi } from '../ViewApi'
import { Theme } from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'
import { PluginHooks } from '../plugin-system'
import { createContext } from '../vdom'
import { ScrollResponder, ScrollRequestHandler } from '../ScrollResponder'
import { DateProfile, DateProfileGenerator } from '../DateProfileGenerator'
import { ViewSpec } from '../structs/view-spec'

export const ComponentContextType = createContext<ComponentContext>({} as any) // for Components

// TODO: rename file
// TODO: rename to ViewContext

export interface ComponentContext {
  viewSpec: ViewSpec
  viewApi: ViewApi
  options: any
  dateProfile: DateProfile
  dateProfileGenerator: DateProfileGenerator
  dateEnv: DateEnv
  pluginHooks: PluginHooks
  theme: Theme
  calendar: Calendar

  addResizeHandler: (handler: ResizeHandler) => void
  removeResizeHandler: (handler: ResizeHandler) => void
  createScrollResponder: (execFunc: ScrollRequestHandler) => ScrollResponder

  // computed from options...
  isRtl: boolean
  eventOrderSpecs: any
  nextDayThreshold: Duration
}


export function buildViewContext(
  viewSpec: ViewSpec,
  viewTitle: string,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  pluginHooks: PluginHooks,
  theme: Theme,
  calendar: Calendar,
): ComponentContext {
  return {
    viewSpec,
    viewApi: buildViewApi(viewSpec, viewTitle, dateProfile, dateEnv),
    options: viewSpec.options,
    dateProfile,
    dateProfileGenerator,
    dateEnv,
    pluginHooks,
    theme,
    calendar,
    addResizeHandler: calendar.addResizeHandler,
    removeResizeHandler: calendar.removeResizeHandler,
    createScrollResponder(execFunc: ScrollRequestHandler) {
      return new ScrollResponder(calendar, execFunc)
    },
    ...computeContextProps(viewSpec.options, theme, calendar)
  }
}


function buildViewApi(viewSpec: ViewSpec, viewTitle: string, dateProfile: DateProfile, dateEnv: DateEnv) {
  return {
    type: viewSpec.type,
    title: viewTitle,
    activeStart: dateEnv.toDate(dateProfile.activeRange.start),
    activeEnd: dateEnv.toDate(dateProfile.activeRange.end),
    currentStart: dateEnv.toDate(dateProfile.currentRange.start),
    currentEnd: dateEnv.toDate(dateProfile.currentRange.end)
  }
}


function computeContextProps(options: any, theme: Theme, calendar: Calendar) {
  let isRtl = options.direction === 'rtl'

  return {
    isRtl,
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold)
  }
}

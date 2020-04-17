import { Calendar } from '../Calendar'
import { ResizeHandler } from '../Calendar'
import { ViewApi } from '../ViewApi'
import { Theme } from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { PluginHooks } from '../plugin-system'
import { createContext } from '../vdom'
import { ScrollResponder, ScrollRequestHandler } from '../ScrollResponder'
import { DateProfile, DateProfileGenerator } from '../DateProfileGenerator'
import { ViewSpec } from '../structs/view-spec'
import { ReducerContext, buildComputedOptions } from '../reducers/ReducerContext'
import { Action } from '../reducers/types'
import { Emitter } from '../common/Emitter'


export const ComponentContextType = createContext<ComponentContext>({} as any) // for Components

// TODO: rename file
// TODO: rename to ViewContext

export interface ComponentContext extends ReducerContext {
  isRtl: boolean
  theme: Theme
  dateProfileGenerator: DateProfileGenerator
  dateProfile: DateProfile
  viewSpec: ViewSpec
  viewApi: ViewApi
  addResizeHandler: (handler: ResizeHandler) => void
  removeResizeHandler: (handler: ResizeHandler) => void
  createScrollResponder: (execFunc: ScrollRequestHandler) => ScrollResponder
}


export function buildViewContext(
  viewSpec: ViewSpec,
  viewTitle: string,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  theme: Theme,
  pluginHooks: PluginHooks,
  dispatch: (action: Action) => void,
  emitter: Emitter,
  calendar: Calendar
): ComponentContext {
  let { options } = viewSpec

  return {
    viewSpec,
    viewApi: buildViewApi(viewSpec, viewTitle, dateProfile, dateEnv),
    dateProfile,
    dateProfileGenerator,
    dateEnv,
    isRtl: options.direction === 'rtl',
    theme,
    options,
    computedOptions: buildComputedOptions(options),
    pluginHooks,
    dispatch,
    emitter,
    calendar,
    addResizeHandler: calendar.addResizeHandler,
    removeResizeHandler: calendar.removeResizeHandler,
    createScrollResponder(execFunc: ScrollRequestHandler) {
      return new ScrollResponder(calendar, execFunc)
    }
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

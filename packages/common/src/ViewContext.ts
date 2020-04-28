import { CalendarApi } from './CalendarApi'
import { ViewApi } from './ViewApi'
import { Theme } from './theme/Theme'
import { DateEnv } from './datelib/env'
import { PluginHooks } from './plugin-system-struct'
import { createContext } from './vdom'
import { ScrollResponder, ScrollRequestHandler } from './ScrollResponder'
import { DateProfileGenerator } from './DateProfileGenerator'
import { ViewSpec } from './structs/view-spec'
import { CalendarData } from './reducers/data-types'
import { Action } from './reducers/Action'
import { Emitter } from './common/Emitter'
import { InteractionSettingsInput } from './interactions/interaction'
import { DateComponent } from './component/DateComponent'
import { CalendarContext } from './CalendarContext'
import { createDuration } from './datelib/duration'

export const ViewContextType = createContext<ViewContext>({} as any) // for Components
export type ResizeHandler = (force: boolean) => void

export interface ViewContext extends CalendarContext {
  theme: Theme
  isRtl: boolean
  dateProfileGenerator: DateProfileGenerator
  viewSpec: ViewSpec
  viewApi: ViewApi
  addResizeHandler: (handler: ResizeHandler) => void
  removeResizeHandler: (handler: ResizeHandler) => void
  createScrollResponder: (execFunc: ScrollRequestHandler) => ScrollResponder
  registerInteractiveComponent: (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => void
  unregisterInteractiveComponent: (component: DateComponent<any>) => void
}

export function buildViewContext(
  viewSpec: ViewSpec,
  viewApi: ViewApi,
  viewOptions: any,
  computedViewOptions: any,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  theme: Theme,
  pluginHooks: PluginHooks,
  dispatch: (action: Action) => void,
  getCurrentData: () => CalendarData,
  emitter: Emitter,
  calendarApi: CalendarApi,
  registerInteractiveComponent: (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => void,
  unregisterInteractiveComponent: (component: DateComponent<any>) => void
): ViewContext {
  return {
    dateEnv,
    options: viewOptions,
    computedOptions: computedViewOptions,
    pluginHooks,
    emitter,
    dispatch,
    getCurrentData,
    calendarApi,
    viewSpec,
    viewApi,
    dateProfileGenerator,
    theme,
    isRtl: viewOptions.direction === 'rtl',
    addResizeHandler(handler: ResizeHandler) {
      emitter.on('_resize', handler)
    },
    removeResizeHandler(handler: ResizeHandler) {
      emitter.off('_resize', handler)
    },
    createScrollResponder(execFunc: ScrollRequestHandler) {
      return new ScrollResponder(
        execFunc,
        emitter,
        createDuration(viewOptions.scrollTime)
      )
    },
    registerInteractiveComponent,
    unregisterInteractiveComponent
  }
}

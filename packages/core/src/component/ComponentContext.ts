import { Calendar } from '../Calendar'
import { ViewApi } from '../ViewApi'
import { Theme } from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { PluginHooks } from '../plugin-system'
import { createContext } from '../vdom'
import { ScrollResponder, ScrollRequestHandler } from '../ScrollResponder'
import { DateProfileGenerator } from '../DateProfileGenerator'
import { ViewSpec } from '../structs/view-spec'
import { ReducerContext } from '../reducers/ReducerContext'
import { Action } from '../reducers/types'
import { Emitter } from '../common/Emitter'
import { CalendarState } from '../reducers/types'
import { InteractionSettingsInput } from '../interactions/interaction'
import { DateComponent } from './DateComponent'

export const ComponentContextType = createContext<ComponentContext>({} as any) // for Components
export type ResizeHandler = (force: boolean) => void

// TODO: rename file
// TODO: rename to ViewContext

export interface ComponentContext extends ReducerContext {
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
  options: any,
  computedOptions: any,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  theme: Theme,
  pluginHooks: PluginHooks,
  dispatch: (action: Action) => void,
  getCurrentState: () => CalendarState,
  emitter: Emitter,
  calendar: Calendar,
  registerInteractiveComponent: (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => void,
  unregisterInteractiveComponent: (component: DateComponent<any>) => void
): ComponentContext {
  let reducerContext: ReducerContext = {
    dateEnv,
    options,
    computedOptions,
    pluginHooks,
    emitter,
    dispatch,
    getCurrentState,
    calendar
  }

  return {
    ...reducerContext,
    viewSpec,
    viewApi,
    dateProfileGenerator,
    theme,
    isRtl: options.direction === 'rtl',
    addResizeHandler(handler: ResizeHandler) {
      emitter.on('_resize', handler)
    },
    removeResizeHandler(handler: ResizeHandler) {
      emitter.off('_resize', handler)
    },
    createScrollResponder(execFunc: ScrollRequestHandler) {
      return new ScrollResponder(execFunc, reducerContext)
    },
    registerInteractiveComponent,
    unregisterInteractiveComponent
  }
}

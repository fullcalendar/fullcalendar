import { CalendarImpl } from './api/CalendarImpl.js'
import { ViewImpl } from './api/ViewImpl.js'
import { Theme } from './theme/Theme.js'
import { DateEnv } from './datelib/env.js'
import { PluginHooks } from './plugin-system-struct.js'
import { createContext, Context } from './preact.js'
import { ScrollResponder, ScrollRequestHandler } from './ScrollResponder.js'
import { DateProfileGenerator } from './DateProfileGenerator.js'
import { ViewSpec } from './structs/view-spec.js'
import { CalendarData } from './reducers/data-types.js'
import { Action } from './reducers/Action.js'
import { Emitter } from './common/Emitter.js'
import { InteractionSettingsInput } from './interactions/interaction.js'
import { DateComponent } from './component/DateComponent.js'
import { CalendarContext } from './CalendarContext.js'
import { createDuration } from './datelib/duration.js'
import { ViewOptionsRefined, CalendarListeners } from './options.js'

export const ViewContextType: Context<any> = createContext<ViewContext>({} as any) // for Components
export type ResizeHandler = (force: boolean) => void

/*
it's important that ViewContext extends CalendarContext so that components that subscribe to ViewContext
can pass in their ViewContext to util functions that accept CalendarContext.
*/
export interface ViewContext extends CalendarContext {
  options: ViewOptionsRefined // more specific than BaseOptionsRefined
  theme: Theme
  isRtl: boolean
  dateProfileGenerator: DateProfileGenerator
  viewSpec: ViewSpec
  viewApi: ViewImpl
  addResizeHandler: (handler: ResizeHandler) => void
  removeResizeHandler: (handler: ResizeHandler) => void
  createScrollResponder: (execFunc: ScrollRequestHandler) => ScrollResponder
  registerInteractiveComponent: (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => void
  unregisterInteractiveComponent: (component: DateComponent<any>) => void
}

export function buildViewContext(
  viewSpec: ViewSpec,
  viewApi: ViewImpl,
  viewOptions: ViewOptionsRefined,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  theme: Theme,
  pluginHooks: PluginHooks,
  dispatch: (action: Action) => void,
  getCurrentData: () => CalendarData,
  emitter: Emitter<CalendarListeners>,
  calendarApi: CalendarImpl,
  registerInteractiveComponent: (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => void,
  unregisterInteractiveComponent: (component: DateComponent<any>) => void,
): ViewContext {
  return {
    dateEnv,
    options: viewOptions,
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
        createDuration(viewOptions.scrollTime),
        viewOptions.scrollTimeReset,
      )
    },
    registerInteractiveComponent,
    unregisterInteractiveComponent,
  }
}

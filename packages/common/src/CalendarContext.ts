import { DateEnv } from './datelib/env'
import { ComputedOptions } from './ComputedOptions'
import { PluginHooks } from './plugin-system-struct'
import { Emitter } from './common/Emitter'
import { Action } from './reducers/Action'
import { CalendarApi } from 'fullcalendar'
import { CalendarData } from './reducers/data-types'

export interface CalendarContext {
  dateEnv: DateEnv
  options: any
  computedOptions: ComputedOptions
  pluginHooks: PluginHooks
  emitter: Emitter
  dispatch(action: Action): void
  getCurrentData(): CalendarData
  calendarApi: CalendarApi
}

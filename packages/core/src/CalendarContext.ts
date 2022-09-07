import { DateEnv } from './datelib/env'
import { BaseOptionsRefined, CalendarListeners } from './options'
import { PluginHooks } from './plugin-system-struct'
import { Emitter } from './common/Emitter'
import { Action } from './reducers/Action'
import { CalendarApi } from './CalendarApi'
import { CalendarData } from './reducers/data-types'

export interface CalendarContext {
  dateEnv: DateEnv
  options: BaseOptionsRefined // does not have calendar-specific properties. aims to be compatible with ViewOptionsRefined
  pluginHooks: PluginHooks
  emitter: Emitter<CalendarListeners>
  dispatch(action: Action): void
  getCurrentData(): CalendarData
  calendarApi: CalendarApi
}

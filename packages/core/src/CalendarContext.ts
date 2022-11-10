import { DateEnv } from './datelib/env.js'
import { BaseOptionsRefined, CalendarListeners } from './options.js'
import { PluginHooks } from './plugin-system-struct.js'
import { Emitter } from './common/Emitter.js'
import { Action } from './reducers/Action.js'
import { CalendarImpl } from './api/CalendarImpl.js'
import { CalendarData } from './reducers/data-types.js'

export interface CalendarContext {
  dateEnv: DateEnv
  options: BaseOptionsRefined // does not have calendar-specific properties. aims to be compatible with ViewOptionsRefined
  pluginHooks: PluginHooks
  emitter: Emitter<CalendarListeners>
  dispatch(action: Action): void
  getCurrentData(): CalendarData
  calendarApi: CalendarImpl
}

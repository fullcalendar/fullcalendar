import { DateEnv } from '@full-ui/headless-calendar'
import { BaseOptionsRefined } from '@fullcalendar/core/protected-api'
import { CalendarListeners } from './options'
import { PluginHooks } from './plugin-system-struct'
import { Emitter } from './common/Emitter'
import { Action } from './reducers/Action'
import { CalendarApiImpl } from './api/CalendarApiImpl'
import { CalendarData } from './reducers/data-types'
import { CalendarNowManager } from './reducers/CalendarNowManager'

export interface CalendarContext {
  nowManager: CalendarNowManager
  dateEnv: DateEnv
  options: BaseOptionsRefined // does not have calendar-specific properties. aims to be compatible with ViewOptionsRefined
  pluginHooks: PluginHooks
  emitter: Emitter<Required<CalendarListeners>>
  dispatch(action: Action): void
  getCurrentData(): CalendarData
  calendarApi: CalendarApiImpl
}

import { PluginDef } from '@teamdiverst/fullcalendar-core'
import interactionPlugin from '@teamdiverst/fullcalendar-interaction'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'
import timeGridPlugin from '@teamdiverst/fullcalendar-timegrid'
import listPlugin from '@teamdiverst/fullcalendar-list'
import multiMonthPlugin from '@teamdiverst/fullcalendar-multimonth'

export const DEFAULT_PLUGINS: PluginDef[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
]

pushOptions({
  plugins: DEFAULT_PLUGINS,
})

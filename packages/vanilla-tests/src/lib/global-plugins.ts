import { PluginInput } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from './theme-for-tests' // "
import interactionPlugin from 'fullcalendar/interaction'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import listPlugin from 'fullcalendar/list'
import multiMonthPlugin from 'fullcalendar/multimonth'
import { pushOptions } from './global-utils'

export const DEFAULT_PLUGINS: PluginInput[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
  classicThemePlugin,
  themeForTestsPlugin,
]

pushOptions({
  plugins: DEFAULT_PLUGINS,
})

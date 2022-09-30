import { globalPlugins } from './index.js'
import { default as iCalendarPlugin } from '@fullcalendar/icalendar'

globalPlugins.push(
  iCalendarPlugin,
)

export * from '@fullcalendar/icalendar'

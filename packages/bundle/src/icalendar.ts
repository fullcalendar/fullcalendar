import { globalPlugins } from '@fullcalendar/core'
import { default as iCalendarPlugin } from '@fullcalendar/icalendar'

globalPlugins.push(
  iCalendarPlugin,
)

export * from '@fullcalendar/icalendar'

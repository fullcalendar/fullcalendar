import { globalPlugins } from '@fullcalendar/core'
import { default as googleCalendarPlugin } from '@fullcalendar/google-calendar'

globalPlugins.push(
  googleCalendarPlugin,
)

export * from '@fullcalendar/google-calendar'

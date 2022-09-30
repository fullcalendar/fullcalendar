import { globalPlugins } from './index.js'
import { default as googleCalendarPlugin } from '@fullcalendar/google-calendar'

globalPlugins.push(
  googleCalendarPlugin,
)

export * from '@fullcalendar/google-calendar'

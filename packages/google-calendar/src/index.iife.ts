import { globalPlugins } from '@fullcalendar/core'
import { default as googleCalendarPlugin } from './index.js'
export * from './index.js'

globalPlugins.push(googleCalendarPlugin)

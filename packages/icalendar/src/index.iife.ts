import { globalPlugins } from '@fullcalendar/core'
import { default as iCalendarPlugin } from './index.js'
export * from './index.js'

globalPlugins.push(iCalendarPlugin)

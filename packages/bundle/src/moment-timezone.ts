import { globalPlugins } from './index.js'
import { default as momentTimezonePlugin } from '@fullcalendar/moment-timezone'

globalPlugins.push(
  momentTimezonePlugin,
)

export * from '@fullcalendar/moment-timezone'

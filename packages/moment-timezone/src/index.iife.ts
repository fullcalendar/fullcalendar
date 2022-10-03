import { globalPlugins } from '@fullcalendar/core'
import { default as momentTimezonePlugin } from './index.js'
export * from './index.js'

globalPlugins.push(momentTimezonePlugin)

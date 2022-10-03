import { globalPlugins } from '@fullcalendar/core'
import { default as momentPlugin } from './index.js'
export * from './index.js'

globalPlugins.push(momentPlugin)

import { globalPlugins } from '@fullcalendar/core'
import { default as rrulePlugin } from './index.js'
export * from './index.js'

globalPlugins.push(rrulePlugin)


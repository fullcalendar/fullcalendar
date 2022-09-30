import { globalPlugins } from './index.js'
import { default as momentPlugin } from '@fullcalendar/moment'

globalPlugins.push(
  momentPlugin,
)

export * from '@fullcalendar/moment'

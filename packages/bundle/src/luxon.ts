import { globalPlugins } from './index.js'
import { default as luxonPlugin } from '@fullcalendar/luxon'

globalPlugins.push(
  luxonPlugin,
)

export * from '@fullcalendar/luxon'

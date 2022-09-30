import { globalPlugins } from './index.js'
import { default as luxonPlugin2 } from '@fullcalendar/luxon2'

globalPlugins.push(
  luxonPlugin2,
)

export * from '@fullcalendar/luxon2'

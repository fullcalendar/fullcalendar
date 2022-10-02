import { globalPlugins } from '@fullcalendar/core'
import { default as luxonPlugin } from '@fullcalendar/luxon'

globalPlugins.push(
  luxonPlugin,
)

export * from '@fullcalendar/luxon'

import { globalPlugins } from './index.js'
import { default as rrulePlugin } from '@fullcalendar/rrule'

globalPlugins.push(
  rrulePlugin,
)

export * from '@fullcalendar/rrule'

import { globalPlugins } from '@fullcalendar/core'
import { default as rrulePlugin } from '@fullcalendar/rrule'

globalPlugins.push(
  rrulePlugin,
)

export * from '@fullcalendar/rrule'

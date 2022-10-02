import { globalPlugins } from '@fullcalendar/core'
import { default as momentPlugin } from '@fullcalendar/moment'

globalPlugins.push(
  momentPlugin,
)

export * from '@fullcalendar/moment'

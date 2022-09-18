import { globalPlugins } from '@fullcalendar/core'
import { default as bootstrapPlugin } from '@fullcalendar/bootstrap'

globalPlugins.push(
  bootstrapPlugin,
)

export * from '@fullcalendar/bootstrap'

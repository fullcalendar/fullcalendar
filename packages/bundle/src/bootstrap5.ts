import { globalPlugins } from '@fullcalendar/core'
import { default as bootstrapPlugin } from '@fullcalendar/bootstrap5'

globalPlugins.push(
  bootstrapPlugin,
)

export * from '@fullcalendar/bootstrap5'

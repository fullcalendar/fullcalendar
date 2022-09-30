import { globalPlugins } from './index.js'
import { default as bootstrapPlugin } from '@fullcalendar/bootstrap'

globalPlugins.push(
  bootstrapPlugin,
)

export * from '@fullcalendar/bootstrap'

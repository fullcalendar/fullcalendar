import { globalPlugins } from '@fullcalendar/core'
import plugin from './index.js'

globalPlugins.push(plugin)

export { plugin as default }
export * from './index.js'

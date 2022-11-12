import { globalPlugins } from '@fullcalendar/core/internal'
import plugin from './index.js'

globalPlugins.push(plugin)

export { plugin as default }
export * from './index.js'

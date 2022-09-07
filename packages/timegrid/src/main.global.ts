import { globalPlugins } from '@fullcalendar/core'
import plugin from './main'

globalPlugins.push(plugin)

export default plugin
export * from './main'

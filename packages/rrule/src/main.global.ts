import { globalPlugins } from '@fullcalendar/common'
import plugin from './main'

globalPlugins.push(plugin)

export default plugin
export * from './main'

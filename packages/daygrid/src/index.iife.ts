import { globalPlugins } from '@fullcalendar/core/internal'
import plugin from './index.js'
import * as Internal from './internal.js'

globalPlugins.push(plugin)

export { Internal }

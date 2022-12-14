import { createPlugin, PluginDef } from '@fullcalendar/core'
import { LuxonNamedTimeZone } from './LuxonNamedTimeZone.js'
import { formatWithCmdStr } from './format.js'

export default createPlugin({
  name: '<%= pkgName %>',
  cmdFormatter: formatWithCmdStr,
  namedTimeZonedImpl: LuxonNamedTimeZone,
}) as PluginDef

export { toLuxonDateTime, toLuxonDuration } from './convert.js'

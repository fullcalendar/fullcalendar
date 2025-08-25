import { createPlugin, PluginDef } from '@teamdiverst/fullcalendar-core'
import { formatWithCmdStr } from './format.js'

export default createPlugin({
  name: '<%= pkgName %>',
  cmdFormatter: formatWithCmdStr,
}) as PluginDef

export { toMoment, toMomentDuration } from './convert.js'

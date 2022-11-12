import { createPlugin, PluginDef } from '@fullcalendar/core'
import { MomentNamedTimeZone } from './MomentNamedTimeZone.js'

export default createPlugin({
  name: '<%= pkgName %>',
  namedTimeZonedImpl: MomentNamedTimeZone,
}) as PluginDef

import { createPlugin, PluginDef } from '@fullcalendar/core'
import { eventSourceDef } from './event-source-def.js'

export default createPlugin({
  name: '<%= pkgName %>',
  eventSourceDefs: [eventSourceDef],
}) as PluginDef

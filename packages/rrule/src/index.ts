import { createPlugin, PluginDef } from '@fullcalendar/core'
import { recurringType } from './recurring-type.js'
import { RRULE_EVENT_REFINERS } from './event-refiners.js'
import './ambient.js'

export default createPlugin({
  name: '<%= pkgName %>',
  recurringTypes: [recurringType],
  eventRefiners: RRULE_EVENT_REFINERS,
}) as PluginDef

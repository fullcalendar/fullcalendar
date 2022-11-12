import { createPlugin } from '@fullcalendar/core/internal'
import { eventSourceDef } from './event-source-def.js'

export default createPlugin({
  name: '<%= pkgName %>',
  eventSourceDefs: [eventSourceDef],
})

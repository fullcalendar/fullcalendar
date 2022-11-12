import { createPlugin } from '@fullcalendar/core'
import { MomentNamedTimeZone } from './MomentNamedTimeZone.js'

export default createPlugin({
  name: '<%= pkgName %>',
  namedTimeZonedImpl: MomentNamedTimeZone,
})

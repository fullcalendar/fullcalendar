import { createPlugin } from '@fullcalendar/core/internal'
import { MomentNamedTimeZone } from './MomentNamedTimeZone.js'

export default createPlugin({
  name: '<%= pkgName %>',
  namedTimeZonedImpl: MomentNamedTimeZone,
})

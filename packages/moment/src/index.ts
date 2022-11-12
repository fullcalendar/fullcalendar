import { createPlugin } from '@fullcalendar/core/internal'
import { formatWithCmdStr } from './format.js'

export default createPlugin({
  name: '<%= pkgName %>',
  cmdFormatter: formatWithCmdStr,
})

export { toMoment, toMomentDuration } from './convert.js'

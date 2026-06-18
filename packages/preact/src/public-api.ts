
export { CalendarApi } from './api/CalendarApi'
export { CalendarController } from './CalendarController'
export { ViewApi } from './api/ViewApi'
export { EventSourceApi } from './api/EventSourceApi'
export { EventApi } from './api/EventApi'
export * from './api/structs'

export { FormatDateOptions, FormatRangeOptions } from './formatting-api'
export { formatDate, formatRange } from './formatting-api'
export { sliceEvents } from './component-util/View'
export { EventRenderRange } from './component-util/event-rendering' // for sliceEvents
export { JsonRequestError } from './util/requestJson'
export { joinClassNames } from './util/html'

export { globalLocales } from './global-locales'
export { globalPlugins } from './global-plugins'

export const version: string = '<%= pkgVersion %>'

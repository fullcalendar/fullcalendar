import './index.css'

export { Calendar } from './Calendar.js'
export { EventSourceApi } from './api/EventSourceApi.js'
export { EventApi, buildEventApis } from './api/EventApi.js'
export { CalendarApi } from './CalendarApi.js'
export { FormatDateOptions, FormatRangeOptions } from './formatting-api.js'
export { formatDate, formatRange } from './formatting-api.js'
export { ViewApi } from './ViewApi.js'
export * from './api-type-deps.js'

export const version = '<%= pkgVersion %>'

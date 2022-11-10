import './index.css'

export { Calendar } from './Calendar.js'

export { CalendarApi } from './api/CalendarApi.js'
export { ViewApi } from './api/ViewApi.js'
export { EventSourceApi } from './api/EventSourceApi.js'
export { EventApi } from './api/EventApi.js'
export * from './api/structs.js'

export { FormatDateOptions, FormatRangeOptions } from './formatting-api.js'
export { formatDate, formatRange } from './formatting-api.js'

export const version: string = '<%= pkgVersion %>'

import { globalPlugins } from '@fullcalendar/core'
import { default as interactionPlugin } from '@fullcalendar/interaction'
import { default as dayGridPlugin } from '@fullcalendar/daygrid'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { default as listPlugin } from '@fullcalendar/list'
import { default as bootstrapPlugin } from '@fullcalendar/bootstrap'
import { default as bootstrapPlugin5 } from '@fullcalendar/bootstrap5'
import { default as googleCalendarPlugin } from '@fullcalendar/google-calendar'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  bootstrapPlugin,
  bootstrapPlugin5,
  googleCalendarPlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction'
export * from '@fullcalendar/daygrid'
export * from '@fullcalendar/timegrid'
export * from '@fullcalendar/list'
export * from '@fullcalendar/bootstrap' // bootstrap5 not exported
export * from '@fullcalendar/google-calendar'

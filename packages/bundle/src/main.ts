import { globalPlugins } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import bootstrapPlugin from '@fullcalendar/bootstrap'
import googleCalendarPlugin from '@fullcalendar/google-calendar'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  bootstrapPlugin,
  googleCalendarPlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction'
export * from '@fullcalendar/daygrid'
export * from '@fullcalendar/timegrid'
export * from '@fullcalendar/list'
export * from '@fullcalendar/bootstrap'
export * from '@fullcalendar/google-calendar'

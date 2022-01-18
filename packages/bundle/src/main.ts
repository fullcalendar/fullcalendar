import { globalPlugins } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import bootstrapPlugin from '@fullcalendar/bootstrap'
import bootstrapPlugin5 from '@fullcalendar/bootstrap5'
// ^TODO: remove. also in package.json. also in packages-premium
import googleCalendarPlugin from '@fullcalendar/google-calendar'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  bootstrapPlugin,
  bootstrapPlugin5, // TODO: remove
  googleCalendarPlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction'
export * from '@fullcalendar/daygrid'
export * from '@fullcalendar/timegrid'
export * from '@fullcalendar/list'
export * from '@fullcalendar/bootstrap'
export * from '@fullcalendar/google-calendar'

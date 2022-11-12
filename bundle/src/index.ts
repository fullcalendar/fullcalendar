import { globalPlugins } from '@fullcalendar/core/internal'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction' // for Draggable

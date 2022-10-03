import { globalPlugins } from '@fullcalendar/core'
import { default as interactionPlugin } from '@fullcalendar/interaction'
import { default as dayGridPlugin } from '@fullcalendar/daygrid'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { default as listPlugin } from '@fullcalendar/list'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
)

export * from '@fullcalendar/core'
export * from '@fullcalendar/interaction' // for Draggable

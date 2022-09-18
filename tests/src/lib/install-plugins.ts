import { default as interactionPlugin } from '@fullcalendar/interaction'
import { default as dayGridPlugin } from '@fullcalendar/daygrid'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { default as listPlugin } from '@fullcalendar/list'

export const DEFAULT_PLUGINS = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
]

pushOptions({
  plugins: DEFAULT_PLUGINS,
})

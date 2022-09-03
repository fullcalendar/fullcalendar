import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

export const DEFAULT_PLUGINS = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
]

pushOptions({
  plugins: DEFAULT_PLUGINS,
})

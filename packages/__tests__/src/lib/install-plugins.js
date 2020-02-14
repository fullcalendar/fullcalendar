import InteractionPlugin from '@fullcalendar/interaction'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import ListPlugin from '@fullcalendar/list'

const plugins = [
  InteractionPlugin,
  DayGridPlugin,
  TimeGridPlugin,
  ListPlugin
]

pushOptions({
  plugins
})

export default plugins

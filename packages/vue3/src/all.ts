import { defineComponent, h } from 'vue'
import { PluginInput } from 'fullcalendar/public-api'
import interactionPlugin from 'fullcalendar/interaction'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import listPlugin from 'fullcalendar/list'
import multiMonthPlugin from 'fullcalendar/multimonth'
import FullCalendar from './FullCalendar'

export const plugins: PluginInput[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
]

export default defineComponent({
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    return () => h(FullCalendar, {
      options: {
        ...props.options,
        plugins: [
          ...plugins,
          ...(props.options.plugins || []),
        ]
      }
    })
  }
})

import { CalendarOptions, PluginInput } from '@fullcalendar/react/public-api'
import interactionPlugin from '@fullcalendar/react/interaction'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import listPlugin from '@fullcalendar/react/list'
import multiMonthPlugin from '@fullcalendar/react/multimonth'
import { Calendar as BareCalendar } from './Calendar'

export const plugins: PluginInput[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
]

export class Calendar extends BareCalendar {
  constructor(el: HTMLElement, optionOverrides: CalendarOptions = {}) {
    super(el, {
      ...optionOverrides,
      plugins: [
        ...plugins,
        ...(optionOverrides.plugins || []),
      ]
    })
  }
}

export default Calendar

import { CalendarOptions, PluginInput } from '@fullcalendar/preact/public-api'
import interactionPlugin from '@fullcalendar/preact/interaction'
import dayGridPlugin from '@fullcalendar/preact/daygrid'
import timeGridPlugin from '@fullcalendar/preact/timegrid'
import listPlugin from '@fullcalendar/preact/list'
import multiMonthPlugin from '@fullcalendar/preact/multimonth'
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

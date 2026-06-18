import { ReactNode } from 'react'
import { Calendar as BareCalendar } from './Calendar'
import { CalendarOptions } from './options'
import { PluginInput } from './plugin-system-struct'
import interactionPlugin from './interaction-plugin/index'
import dayGridPlugin from './daygrid/index'
import timeGridPlugin from './timegrid/index'
import listPlugin from './list/index'
import multiMonthPlugin from './multimonth/index'

export const plugins: PluginInput[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
]

export function Calendar(options: CalendarOptions = {}): ReactNode {
  return (
    <BareCalendar
      {...options}
      plugins={[
        ...plugins,
        ...(options.plugins || []),
      ]}
    />
  )
}

export default Calendar

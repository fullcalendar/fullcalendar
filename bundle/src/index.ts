import { globalPlugins } from '@teamdiverst/fullcalendar-core'
import interactionPlugin from '@teamdiverst/fullcalendar-interaction'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'
import timeGridPlugin from '@teamdiverst/fullcalendar-timegrid'
import listPlugin from '@teamdiverst/fullcalendar-list'
import multiMonthPlugin from '@teamdiverst/fullcalendar-multimonth'

globalPlugins.push(
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
)

export * from '@teamdiverst/fullcalendar-core'
export * from '@teamdiverst/fullcalendar-interaction' // for Draggable

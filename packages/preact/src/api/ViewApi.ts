import { DateTimeRangeFormatPartWithWeek } from '@full-ui/headless-calendar'
import { CalendarApi } from './CalendarApi'

export interface ViewApi {
  calendar: CalendarApi

  type: string
  title: string
  titleParts: DateTimeRangeFormatPartWithWeek[] // the title's Intl range parts, for styling them apart
  activeStart: Date
  activeEnd: Date
  currentStart: Date
  currentEnd: Date

  getOption(name: string): any
}

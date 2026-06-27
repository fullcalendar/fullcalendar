import { CalendarApi } from './CalendarApi'

export interface ViewApi {
  calendar: CalendarApi

  type: string
  title: string
  activeStart: Date
  activeEnd: Date
  currentStart: Date
  currentEnd: Date

  getOption(name: string): any
}

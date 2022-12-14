import { CalendarApi } from './CalendarApi.js'

export interface ViewApi {
  calendar: CalendarApi

  title: string
  activeStart: Date
  activeEnd: Date
  currentStart: Date
  currentEnd: Date

  getOption(name: string): any
}

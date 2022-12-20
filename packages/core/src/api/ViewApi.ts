import { CalendarApi } from './CalendarApi.js'

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

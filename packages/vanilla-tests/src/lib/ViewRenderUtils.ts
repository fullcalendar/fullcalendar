import type { Calendar } from 'fullcalendar'
import { addDays } from 'fullcalendar/protected-api'
import { formatIsoDay } from './datelib-utils'
import { CalendarWrapper } from './wrappers/CalendarWrapper'

export function expectDayRange(calendar: Calendar, start, end) {
  if (typeof start === 'string') {
    expect(start.indexOf('T')).toBe(-1)
    start = new Date(start)
  }

  if (typeof end === 'string') {
    expect(end.indexOf('T')).toBe(-1)
    end = new Date(end)
  }

  let dayBefore = addDays(start, -1)
  expectDay(calendar, dayBefore, false)

  let date = start
  while (date < end) { // eslint-disable-line
    expectDay(calendar, date, true)
    date = addDays(date, 1)
  }

  // `date` is now the first day after the range
  expectDay(calendar, date, false)
}

export function expectDay(calendar: Calendar, date, bool) {
  if (typeof date === 'string') {
    expect(date.indexOf('T')).toBe(-1)
    date = new Date(date)
  }

  let calendarWrapper = new CalendarWrapper(calendar)
  let dayEl = calendarWrapper.getDateCellEl(formatIsoDay(date))

  if (bool) {
    expect(dayEl).toBeTruthy()
  } else {
    expect(dayEl).toBeFalsy()
  }
}

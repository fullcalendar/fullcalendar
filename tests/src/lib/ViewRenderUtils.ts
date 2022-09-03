import { addDays } from '@fullcalendar/core'
import { formatIsoDay } from './datelib-utils'
import { CalendarWrapper } from './wrappers/CalendarWrapper'

export function expectDayRange(start, end) {
  if (typeof start === 'string') {
    expect(start.indexOf('T')).toBe(-1)
    start = new Date(start)
  }

  if (typeof end === 'string') {
    expect(end.indexOf('T')).toBe(-1)
    end = new Date(end)
  }

  let dayBefore = addDays(start, -1)
  expectDay(dayBefore, false)

  let date = start
  while (date < end) { // eslint-disable-line
    expectDay(date, true)
    date = addDays(date, 1)
  }

  // `date` is now the first day after the range
  expectDay(date, false)
}

export function expectDay(date, bool) {
  if (typeof date === 'string') {
    expect(date.indexOf('T')).toBe(-1)
    date = new Date(date)
  }

  let calendarWrapper = new CalendarWrapper(currentCalendar)
  let dayEl = calendarWrapper.getDateCellEl(formatIsoDay(date))

  if (bool) {
    expect(dayEl).toBeTruthy()
  } else {
    expect(dayEl).toBeFalsy()
  }
}

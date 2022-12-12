import { CalendarApi, Duration } from '@fullcalendar/core'
import { DateTime as LuxonDateTime, Duration as LuxonDuration } from 'luxon'
import { CalendarImpl } from '@fullcalendar/core/internal'

export function toLuxonDateTime(date: Date, calendar: CalendarApi): LuxonDateTime {
  if (!(calendar instanceof CalendarImpl)) {
    throw new Error('must supply a CalendarApi instance')
  }

  let { dateEnv } = calendar.getCurrentData()

  return LuxonDateTime.fromJSDate(date, {
    zone: dateEnv.timeZone,
    locale: dateEnv.locale.codes[0],
  })
}

export function toLuxonDuration(duration: Duration, calendar: CalendarApi): LuxonDuration {
  if (!(calendar instanceof CalendarImpl)) {
    throw new Error('must supply a CalendarApi instance')
  }

  let { dateEnv } = calendar.getCurrentData()

  return LuxonDuration.fromObject({
    ...duration,
    locale: dateEnv.locale.codes[0],
  })
}

// Internal Utils

export function luxonToArray(datetime: LuxonDateTime): number[] {
  return [
    datetime.year,
    datetime.month - 1, // convert 1-based to 0-based
    datetime.day,
    datetime.hour,
    datetime.minute,
    datetime.second,
    datetime.millisecond,
  ]
}

export function arrayToLuxon(arr: number[], timeZone: string, locale?: string): LuxonDateTime {
  return LuxonDateTime.fromObject({
    zone: timeZone,
    locale,
    year: arr[0],
    month: arr[1] + 1, // convert 0-based to 1-based
    day: arr[2],
    hour: arr[3],
    minute: arr[4],
    second: arr[5],
    millisecond: arr[6],
  })
}

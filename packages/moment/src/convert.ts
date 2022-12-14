import moment from 'moment'
import { CalendarApi, Duration } from '@fullcalendar/core'
import { CalendarImpl } from '@fullcalendar/core/internal'

export function toMoment(date: Date, calendar: CalendarApi): moment.Moment {
  if (!(calendar instanceof CalendarImpl)) {
    throw new Error('must supply a CalendarApi instance')
  }

  let { dateEnv } = calendar.getCurrentData()

  return convertToMoment(
    date,
    dateEnv.timeZone,
    null,
    dateEnv.locale.codes[0],
  )
}

export function toMomentDuration(fcDuration: Duration): moment.Duration {
  return moment.duration(fcDuration) // moment accepts all the props that fc.Duration already has!
}

// Internal Utils

export function convertToMoment(
  input: any,
  timeZone: string,
  timeZoneOffset: number | null,
  locale: string,
): moment.Moment {
  let mom: moment.Moment

  if (timeZone === 'local') {
    mom = moment(input)
  } else if (timeZone === 'UTC') {
    mom = moment.utc(input)
  } else if ((moment as any).tz) {
    mom = (moment as any).tz(input, timeZone)
  } else {
    mom = moment.utc(input)

    if (timeZoneOffset != null) {
      mom.utcOffset(timeZoneOffset)
    }
  }

  mom.locale(locale)

  return mom
}

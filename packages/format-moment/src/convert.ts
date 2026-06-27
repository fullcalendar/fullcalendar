import moment from 'moment'

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

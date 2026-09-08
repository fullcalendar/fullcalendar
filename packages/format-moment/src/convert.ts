import moment from 'moment'

// Internal Utils

// constructing from the exact instant (rather than wall-clock fields) keeps Moment from
// independently choosing an occurrence for wall-clocks repeated during a DST fold
export function convertToMoment(
  instantMs: number,
  timeZone: string,
  timeZoneOffset: number | null,
  locale: string,
): moment.Moment {
  let mom: moment.Moment

  if (timeZone === 'local') {
    mom = moment(instantMs)
  } else if (timeZone === 'UTC') {
    mom = moment.utc(instantMs)
  } else if ((moment as any).tz) {
    mom = (moment as any).tz(instantMs, timeZone)
  } else {
    mom = moment.utc(instantMs)

    if (timeZoneOffset != null) {
      mom.utcOffset(timeZoneOffset)
    }
  }

  mom.locale(locale)

  return mom
}

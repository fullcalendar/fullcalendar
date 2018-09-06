import * as moment from 'moment'
import * as fc from 'fullcalendar'

(fc as any).Moment = {

  toMoment: function(calendar: fc.Calendar, date: Date): moment.Moment {
    return convertToMoment(
      date,
      calendar.dateEnv.timeZone,
      null,
      calendar.dateEnv.locale.codes[0]
    )
  },

  toDuration: function(fcDuration: fc.Duration): moment.Duration {
    return moment.duration(fcDuration) // momment accepts all the props that fc.Duration already has!
  }

}

// TODO: what about range!!??

fc.registerCmdFormatter('moment', function(cmdStr: string, arg: fc.VerboseFormattingArg) {
  return convertToMoment(
    arg.date.array,
    arg.timeZone,
    arg.date.timeZoneOffset,
    arg.localeCodes[0]
  ).format(cmdStr)
})


function convertToMoment(input: any, timeZone: string, timeZoneOffset: number | null, locale: string): moment.Moment {
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

import * as moment from 'moment'
import * as fc from 'fullcalendar'


(fc as any).toMoment = function(calendar: fc.Calendar, date: Date): moment.Moment {
  let timeZone = calendar.dateEnv.timeZone
  let mom: moment.Moment

  if (timeZone === 'local') {
    mom = moment(date)
  } else if (timeZone === 'UTC' || !(moment as any).tz) {
    mom = moment.utc(date)
  } else {
    mom = (moment as any).tz(date, timeZone)
  }

  mom.locale(calendar.dateEnv.locale.codes[0])

  return mom
};


(fc as any).toDuration = function(fcDuration: fc.Duration): moment.Duration {
  return moment.duration(fcDuration) // i think all props are accepted?
}


// TODO: what about range!!??

fc.registerCmdFormatter('moment', function(cmdStr: string, arg: fc.VerboseFormattingArg) {
  let mom: moment.Moment

  if (arg.timeZone === 'local') {
    mom = moment(arg.date.array)
  } else if (arg.timeZone === 'UTC' || !(moment as any).tz) {
    mom = moment.utc(arg.date.array)
  } else {
    mom = (moment as any).tz(arg.date.array, arg.timeZone)
  }

  // what about accepting a forced timezone if .tz isn't present?

  mom.locale(arg.localeCodes[0])

  return mom.format(cmdStr)
})

import { DateTime, Duration } from 'luxon'
import * as fc from 'fullcalendar'

(fc as any).Luxon = {

  toDateTime: function(calendar: fc.Calendar, date: Date): DateTime {
    return DateTime.fromJSDate(date, {
      zone: calendar.dateEnv.timeZone,
      locale: calendar.dateEnv.locale.codes[0]
    })
  },

  toDuration: function(calendar: fc.Calendar, duration: fc.Duration): Duration {
    return Duration.fromObject(
      fc.assignTo({}, duration, {
        locale: calendar.dateEnv.locale.codes[0]
      })
    )
  }

}


class LuxonNamedTimeZone extends fc.NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return arrayToLuxon(a, this.name).offset
  }

  timestampToArray(ms: number): number[] {
    return luxonToArray(
      DateTime.fromMillis(ms, {
        zone: this.name
      })
    )
  }

}


fc.registerNamedTimeZoneImpl('luxon', LuxonNamedTimeZone)



// TODO: what about range!!??

fc.registerCmdFormatter('luxon', function(cmdStr: string, arg: fc.VerboseFormattingArg) {
  return arrayToLuxon(
    arg.date.array,
    arg.timeZone,
    arg.localeCodes[0]
  ).toFormat(cmdStr)
})


function luxonToArray(datetime: DateTime): number[] {
  return [
    datetime.year,
    datetime.month - 1, // convert 1-based to 0-based
    datetime.day,
    datetime.hour,
    datetime.minute,
    datetime.second,
    datetime.millisecond
  ]
}

function arrayToLuxon(arr: number[], timeZone: string, locale?: string): DateTime {
  return DateTime.fromObject({
    zone: timeZone,
    locale: locale,
    year: arr[0],
    month: arr[1] + 1, // convert 0-based to 1-based
    day: arr[2],
    hour: arr[3],
    minute: arr[4],
    second: arr[5],
    millisecond: arr[6]
  })
}

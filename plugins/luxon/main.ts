import { DateTime, Duration } from 'luxon'
import * as fc from 'fullcalendar'

(fc as any).Luxon = {

  toDateTime: function(calendar: fc.Calendar, date: Date): DateTime {
    return DateTime.fromJSDate(date, {
      zone: calendar.dateEnv.timeZone,
      locale: calendar.dateEnv.locale.codes[0]
    })
  },

  toDuration: function(duration: fc.Duration): Duration {
    return Duration.fromObject(duration)
  }

}


class LuxonNamedTimeZone extends fc.NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    // use negative to convert the "real" offset to the "inverse" offset,
    // which is what builtin JS objects return with Date::getTimezoneOffset
    // TODO: rethink about doing this internally too
    return -DateTime.fromObject({
      zone: this.name,
      year: a[0],
      month: a[1] + 1, // convert 0-based to 1-based
      day: a[2],
      hour: a[3],
      minute: a[4],
      second: a[5],
      millisecond: a[6]
    }).offset
  }

  timestampToArray(ms: number): number[] {
    let obj = DateTime.fromMillis(ms, {
      zone: this.name
    })
    return [
      obj.year,
      obj.month - 1, // convert 1-based to 0-based
      obj.day,
      obj.hour,
      obj.minute,
      obj.second,
      obj.millisecond
    ]
  }

}


fc.registerNamedTimeZoneImpl('luxon', LuxonNamedTimeZone)

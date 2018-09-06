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

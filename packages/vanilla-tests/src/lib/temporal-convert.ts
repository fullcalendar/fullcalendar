import * as PlainDateFns from 'temporal-polyfill/fns/PlainDate'
import * as PlainDateTimeFns from 'temporal-polyfill/fns/PlainDateTime'
import * as ZonedDateTimeFns from 'temporal-polyfill/fns/ZonedDateTime'
import * as CalendarFns from 'temporal-polyfill/fns/Calendar'

export function plainAndZoneToString(dateStr: string, timeZone: string): string {
  return ZonedDateTimeFns.toString(
    plainAndZone(dateStr, timeZone)
  ).replace(/\[[^\]]*\]$/, '') // remove timezone part
}

export function plainAndZoneToDate(dateStr: string, timeZone: string): Date {
  return new Date(plainAndZone(dateStr, timeZone).epochMilliseconds)
}

function plainAndZone(dateStr: string, timeZone: string): ZonedDateTimeFns.Record {
  if (dateStr.includes('T')) {
    return PlainDateTimeFns.toZonedDateTime(
      PlainDateTimeFns.fromString(dateStr, CalendarFns.getBasic),
      timeZone,
    )
  } else {
    return PlainDateFns.toZonedDateTime(
      PlainDateFns.fromString(dateStr, CalendarFns.getBasic),
      timeZone,
    )
  }
}

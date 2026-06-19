import * as PlainDateFns from 'temporal-polyfill/fns/PlainDate'
import * as PlainDateTimeFns from 'temporal-polyfill/fns/PlainDateTime'
import * as ZonedDateTimeFns from 'temporal-polyfill/fns/ZonedDateTime'

export function plainAndZoneToString(dateStr: string, timeZone: string): string {
  return ZonedDateTimeFns.toString(
    plainAndZone(dateStr, timeZone)
  ).replace(/\[[^\]]*\]$/, '') // remove timezone part
}

export function plainAndZoneToDate(dateStr: string, timeZone: string): Date {
  return new Date(
    ZonedDateTimeFns.epochMilliseconds(
      plainAndZone(dateStr, timeZone),
    ),
  )
}

function plainAndZone(dateStr: string, timeZone: string): ZonedDateTimeFns.Record {
  if (dateStr.includes('T')) {
    return PlainDateTimeFns.toZonedDateTime(PlainDateTimeFns.fromString(dateStr), timeZone)
  } else {
    return PlainDateFns.toZonedDateTime(PlainDateFns.fromString(dateStr), timeZone)
  }
}

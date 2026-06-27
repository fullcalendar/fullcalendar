import { DateMarker } from './marker'
import { CalendarSystem } from './calendar-system'

export interface ZonedMarker {
  marker: DateMarker,
  timeZoneOffset: number
}

export interface ExpandedZonedMarker extends ZonedMarker {
  array: number[],
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
}

export function expandZonedMarker(dateInfo: ZonedMarker, calendarSystem: CalendarSystem): ExpandedZonedMarker {
  let a = calendarSystem.markerToArray(dateInfo.marker)

  return {
    marker: dateInfo.marker,
    timeZoneOffset: dateInfo.timeZoneOffset,
    array: a,
    year: a[0],
    month: a[1],
    day: a[2],
    hour: a[3],
    minute: a[4],
    second: a[5],
    millisecond: a[6],
  }
}

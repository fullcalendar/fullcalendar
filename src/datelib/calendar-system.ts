import { DateMarker, arrayToUtcDate, dateToUtcArray } from './marker'

export interface CalendarSystem {
  getMarkerYear(d: DateMarker): number
  getMarkerMonth(d: DateMarker): number
  getMarkerDay(d: DateMarker): number
  arrayToMarker(arr: number[]): DateMarker
  markerToArray(d: DateMarker): number[]
}


let calendarSystemClassMap = {}

export function registerCalendarSystem(name, theClass) {
  calendarSystemClassMap[name] = theClass
}

export function createCalendarSystem(name) {
  return new calendarSystemClassMap[name]()
}


class GregorianCalendarSystem implements CalendarSystem {

  getMarkerYear(d: DateMarker) {
    return d.getUTCFullYear()
  }

  getMarkerMonth(d: DateMarker) {
    return d.getUTCMonth()
  }

  getMarkerDay(d: DateMarker) {
    return d.getUTCDate()
  }

  arrayToMarker(arr) {
    return arrayToUtcDate(arr)
  }

  markerToArray(marker) {
    return dateToUtcArray(marker)
  }

}

registerCalendarSystem('gregory', GregorianCalendarSystem)

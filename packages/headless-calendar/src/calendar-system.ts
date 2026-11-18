import { DateMarker, arrayToUtcDate, dateToUtcArray } from './marker'
import { markerToJalaliDate, jalaliDateToMarker } from './jalali'

export interface CalendarSystem {
  /*
  The calendar an Intl formatter must use to print this system's dates. Without it a
  formatter would fall back to whatever calendar the locale prefers, and a locale like
  'fa' prefers the Persian one, which would label the cells of a Gregorian grid with
  Jalali day numbers.
  */
  intlCalendar: string

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
  intlCalendar = 'gregory'

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

class JalaliCalendarSystem implements CalendarSystem {
  intlCalendar = 'persian'

  getMarkerYear(d: DateMarker) {
    return markerToJalaliDate(d).year
  }

  getMarkerMonth(d: DateMarker) {
    return markerToJalaliDate(d).month
  }

  getMarkerDay(d: DateMarker) {
    return markerToJalaliDate(d).day
  }

  arrayToMarker(arr) {
    // only the year is always present, and the month and day can be out of range,
    // because DateEnv does its date math by offsetting them
    let dayStart = jalaliDateToMarker(
      arr[0],
      arr[1] || 0,
      arr[2] == null ? 1 : arr[2],
    )

    // the Gregorian path handles the time fields, which can be out of range too
    return arrayToUtcDate([
      dayStart.getUTCFullYear(),
      dayStart.getUTCMonth(),
      dayStart.getUTCDate(),
      arr[3] || 0,
      arr[4] || 0,
      arr[5] || 0,
      arr[6] || 0,
    ])
  }

  markerToArray(marker) {
    let jalaliDate = markerToJalaliDate(marker)

    return [
      jalaliDate.year,
      jalaliDate.month,
      jalaliDate.day,
      marker.getUTCHours(),
      marker.getUTCMinutes(),
      marker.getUTCSeconds(),
      marker.getUTCMilliseconds(),
    ]
  }
}

// 'persian' is what Intl and CLDR call it, 'jalali' is what most people call it
registerCalendarSystem('jalali', JalaliCalendarSystem)
registerCalendarSystem('persian', JalaliCalendarSystem)

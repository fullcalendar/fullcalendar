import { DateMarker, arrayToUtcDate, dateToUtcArray, arrayToLocalDate, dateToLocalArray, startOfHour, startOfMinute, startOfSecond, addMs  } from './util'
import { CalendarSystem, createCalendarSystem } from './calendar-system'
import { namedTimeZoneOffsetGenerator, getNamedTimeZoneOffsetGenerator } from './timezone'
import { getLocale } from './locale'
import { Duration } from './duration'
import { DateFormatter, buildIsoString } from './formatting'
import { parse } from './parsing'
import { assignTo } from '../util/object'

export interface DateEnvSettings {
  timeZone: string
  timeZoneImpl?: string
  calendarSystem: string
  locale: string // TODO: accept a list
  weekNumberCalculation?: any
  firstDay?: any
}



export type DateInput = Date | number[] | number | string


const MS_IN_DAY = 864e5

// TODO: locale: 'auto'
// TODO: separate locale object from dateenv. but keep separate from locale name


export class DateEnv {

  timeZone: string
  namedTimeZoneOffsetGenerator: namedTimeZoneOffsetGenerator
  calendarSystem: CalendarSystem
  locale: string
  weekMeta: any
  weekNumberFunc: any
  simpleNumberFormat: Intl.NumberFormat

  constructor(settings: DateEnvSettings) {
    this.timeZone = settings.timeZone
    this.namedTimeZoneOffsetGenerator = getNamedTimeZoneOffsetGenerator(settings.timeZoneImpl)
    this.calendarSystem = createCalendarSystem(settings.calendarSystem)
    this.locale = settings.locale
    this.weekMeta = assignTo({}, getLocale(settings.locale).week)

    this.simpleNumberFormat = new Intl.NumberFormat(settings.locale)

    if (settings.weekNumberCalculation === 'ISO') {
      this.weekMeta.dow = 1
      this.weekMeta.doy = 4
    } else if (typeof settings.firstDay === 'number') {
      this.weekMeta.dow = settings.firstDay
    }

    if (typeof settings.weekNumberCalculation === 'function') {
      this.weekNumberFunc = settings.weekNumberCalculation
    }
  }

  add(marker: DateMarker, dur: Duration): DateMarker {
    let { calendarSystem } = this

    return calendarSystem.arrayToMarker([
      calendarSystem.getMarkerYear(marker) + dur.year,
      calendarSystem.getMarkerMonth(marker) + dur.month,
      calendarSystem.getMarkerDay(marker) + dur.day,
      marker.getUTCHours(),
      marker.getUTCMinutes(),
      marker.getUTCSeconds(),
      marker.getUTCMilliseconds() + dur.time
    ])
  }

  getMonth(marker: DateMarker): number {
   return this.calendarSystem.getMarkerMonth(marker)
  }

  subtract(marker: DateMarker, dur: Duration): DateMarker {
    let { calendarSystem } = this

    return calendarSystem.arrayToMarker([
      calendarSystem.getMarkerYear(marker) - dur.year,
      calendarSystem.getMarkerMonth(marker) - dur.month,
      calendarSystem.getMarkerDay(marker) - dur.day,
      marker.getUTCHours(),
      marker.getUTCMinutes(),
      marker.getUTCSeconds(),
      marker.getUTCMilliseconds() - dur.time
    ])
  }

  addYears(marker: DateMarker, n: number): DateMarker {
    let { calendarSystem } = this

    return calendarSystem.arrayToMarker([
      calendarSystem.getMarkerYear(marker) + n,
      calendarSystem.getMarkerMonth(marker),
      calendarSystem.getMarkerDay(marker),
      marker.getUTCHours(),
      marker.getUTCMinutes(),
      marker.getUTCSeconds(),
      marker.getUTCMilliseconds()
    ])
  }

  startOf(marker: DateMarker, unit: string) {
    if (unit === 'year') {
      return this.startOfYear(marker)
    } else if (unit === 'month') {
      return this.startOfMonth(marker)
    } else if (unit === 'week') {
      return this.startOfWeek(marker)
    } else if (unit === 'day') {
      return this.startOfDay(marker)
    } else if (unit === 'hour') {
      return startOfHour(marker)
    } else if (unit === 'minute') {
      return startOfMinute(marker)
    } else if (unit === 'second') {
      return startOfSecond(marker)
    }
  }

  startOfYear(marker: DateMarker): DateMarker {
    let { calendarSystem } = this

    return calendarSystem.arrayToMarker([
      calendarSystem.getMarkerYear(marker) // might not work, might go to ms
    ])
  }

  startOfMonth(marker: DateMarker): DateMarker {
    let { calendarSystem } = this

    return calendarSystem.arrayToMarker([
      calendarSystem.getMarkerYear(marker),
      calendarSystem.getMarkerMonth(marker)
    ])
  }

  startOfWeek(marker: DateMarker): DateMarker {
    return arrayToUtcDate([
      marker.getUTCFullYear(),
      marker.getUTCMonth(),
      marker.getUTCDate() - (marker.getUTCDay() - this.weekMeta.dow + 7) % 7
    ])
  }

  computeWeekNumber(marker: DateMarker): number {
    if (this.weekNumberFunc) {
      return this.weekNumberFunc(this.toDate(marker))
    } else {
      let { dow, doy } = this.weekMeta
      return weekOfYear(marker, dow, doy)
    }
  }

  // TODO: make i18n friendly
  // use weekNumberTitle?
  formatWeek(marker: DateMarker, includeLabel: boolean = false): string {
    let w = this.computeWeekNumber(marker)
    let s = this.simpleNumberFormat.format(w)

    if (includeLabel) {
      s = 'Wk ' + s
    }

    return s
  }

  toDate(marker: DateMarker): Date {
    if (this.timeZone === 'UTC' || !this.canComputeTimeZoneOffset()) {
      return new Date(marker.valueOf())
    } else {
      let arr = dateToUtcArray(marker)

      if (this.timeZone === 'local') {
        return arrayToLocalDate(arr)
      } else {
        return new Date(
          marker.valueOf() -
          this.namedTimeZoneOffsetGenerator(this.timeZone, arr)
        )
      }
    }
  }

  canComputeTimeZoneOffset() {
    return this.timeZone === 'UTC' || this.timeZone === 'local' || this.namedTimeZoneOffsetGenerator
  }

  // will return undefined if cant compute it
  computeTimeZoneOffset(marker: DateMarker) {
    if (this.timeZone === 'UTC') {
      return 0
    } else {
      let arr = dateToUtcArray(marker)

      if (this.timeZone === 'local') {
        return arrayToLocalDate(arr).getTimezoneOffset()
      } else if (this.namedTimeZoneOffsetGenerator) {
        return this.namedTimeZoneOffsetGenerator(this.timeZone, arr)
      }
    }
  }

  toRangeFormat(start: DateMarker, end: DateMarker, formatter: DateFormatter, dateOptions: any = {}) {

    // yuck
    if (dateOptions.isExclusive) {
      end = addMs(end, -1)
    }

    return formatter.format(
      {
        marker: start,
        timeZoneOffset: dateOptions.forcedStartTimeZoneOffset != null ?
          dateOptions.forcedStartTimeZoneOffset :
          this.computeTimeZoneOffset(start)
      },
      {
        marker: end,
        timeZoneOffset: dateOptions.forcedEndTimeZoneOffset != null ?
          dateOptions.forcedEndTimeZoneOffset :
          this.computeTimeZoneOffset(end)
      },
      this // yuck
    )
  }

  toFormat(marker: DateMarker, formatter: DateFormatter, extraOptions: any = {}) {
    return formatter.format(
      {
        marker: marker,
        timeZoneOffset: extraOptions.forcedTimeZoneOffset != null ?
          extraOptions.forcedTimeZoneOffset :
          this.computeTimeZoneOffset(marker)
      },
      null,
      this
    )
  }

  toIso(marker: DateMarker, extraOptions: any = {}) {
    return buildIsoString(
      marker,
      extraOptions.forcedTimeZoneOffset != null ?
        extraOptions.forcedTimeZoneOffset :
        this.computeTimeZoneOffset(marker),
      extraOptions.omitTime
    )
  }

  createMarker(input: DateInput) {
    return this.createMarkerMeta(input).marker
  }

  // returns an object that wraps the marker!
  createMarkerMeta(input: DateInput) {
    if (typeof input === 'string') {
      return this.parse(input)
    } else if (typeof input === 'number') {
      return { marker: this.timestampToMarker(input), isTimeUnspecified: false, forcedTimeZoneOffset: null }
    } else if (isNativeDate(input)) {
      return { marker: this.dateToMarker(input as Date), isTimeUnspecified: false, forcedTimeZoneOffset: null }
    } else if (Array.isArray(input)) {
      return { marker: arrayToUtcDate(input), isTimeUnspecified: false, forcedTimeZoneOffset: null }
    }
    return null
  }

  parse(str: string) {
    let parts = parse(str)
    let marker = parts.marker
    let forcedTimeZoneOffset = null

    if (parts.timeZoneOffset != null) {
      if (this.canComputeTimeZoneOffset()) { // can get rid of this now?
        marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1000)
      } else {
        forcedTimeZoneOffset = parts.timeZoneOffset
      }
    }

    return { marker, isTimeUnspecified: parts.isTimeUnspecified, forcedTimeZoneOffset }
  }

  dateToMarker(date: Date) {
    return this.timestampToMarker(date.valueOf())
  }

  timestampToMarker(ms: number) {
    if (this.timeZone === 'UTC') {
      return new Date(ms)
    } else if (this.timeZone === 'local') {
      return arrayToUtcDate(dateToLocalArray(new Date(ms)))
    } else {
      throw 'need tz system!!!'
    }
  }

  computeGreatestDenominator(m0: DateMarker, m1: DateMarker) {
    let n = this.diffWholeYears(m0, m1)

    if (n !== null) {
      return { unit: 'year', value: n }
    }

    n = this.diffWholeMonths(m0, m1)

    if (n !== null) {
      return { unit: 'month', value: n }
    }

    n = this.diffWholeWeeks(m0, m1)

    if (n !== null) {
      return { unit: 'week', value: n / 7 }
    }

    n = this.diffWholeDays(m0, m1)

    if (n !== null) {
      return { unit: 'day', value: n }
    }

    n = diffHours(m0, m1)

    if (n !== null) {
      return { unit: 'hour', value: n }
    }

    n = diffMinutes(m0, m1)

    if (n !== null) {
      return  { unit: 'minute', value: n }
    }

    n = diffSeconds(m0, m1)

    if (n !== null) {
      return { unit: 'second', value: n }
    }

    return { unit: 'millisecond', value: m1.valueOf() - m0.valueOf() }
  }

  divideRangeByWholeDuration(m0: DateMarker, m1: DateMarker, d: Duration) {
    let cnt = 0

    while (m0 < m1) { // not optimal
      m0 = this.add(m0, d)
      cnt++
    }

    return cnt
  }

  diffWholeYears(m0: DateMarker, m1: DateMarker): number {
    let { calendarSystem } = this

    if (
      m0.getUTCMilliseconds() === m1.getUTCMilliseconds() && // TODO: util for time
      m0.getUTCSeconds() === m1.getUTCSeconds() &&
      m0.getUTCMinutes() === m1.getUTCMinutes() &&
      m0.getUTCHours() === m1.getUTCHours() &&
      calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1) &&
      calendarSystem.getMarkerMonth(m0) === calendarSystem.getMarkerMonth(m1)
    ) {
      return calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)
    }
    return null
  }

  diffWholeMonths(m0: DateMarker, m1: DateMarker): number {
    let { calendarSystem } = this

    if (
      m0.getUTCMilliseconds() === m1.getUTCMilliseconds() &&
      m0.getUTCSeconds() === m1.getUTCSeconds() &&
      m0.getUTCMinutes() === m1.getUTCMinutes() &&
      m0.getUTCHours() === m1.getUTCHours() &&
      calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)
    ) {
      return (calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0)) +
          (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12
    }
    return null
  }

  diffWholeWeeks(m0: DateMarker, m1: DateMarker): number {
    let d = this.diffWholeDays(m0, m1)

    if (d !== null && d % 7 === 0) {
      return d / 7
    }

    return null
  }

  diffWholeDays(m0: DateMarker, m1: DateMarker): number {
    if (
      m0.getUTCMilliseconds() === m1.getUTCMilliseconds() &&
      m0.getUTCSeconds() === m1.getUTCSeconds() &&
      m0.getUTCMinutes() === m1.getUTCMinutes() &&
      m0.getUTCHours() === m1.getUTCHours()
    ) {
      return Math.round(diffDays(m0, m1))
    }
    return null
  }

  diffDayAndTime(m0: DateMarker, m1: DateMarker): Duration {
    let m0day = this.startOfDay(m0)
    let m1day = this.startOfDay(m1)

    return {
      year: 0,
      month: 0,
      day: Math.round((m1day.valueOf() - m0day.valueOf()) / MS_IN_DAY),
      time: (m1.valueOf() - m1day.valueOf()) - (m0.valueOf() - m0day.valueOf())
    }
  }

  startOfDay: (marker: DateMarker) => DateMarker

}

DateEnv.prototype.startOfDay = startOfDay


function weekOfYear(marker, dow, doy) {
  let y = marker.getUTCFullYear()
  let w = weekOfGivenYear(marker, y, dow, doy)

  if (w < 1) {
    return weekOfGivenYear(marker, y - 1, dow, doy)
  }

  let nextW = weekOfGivenYear(marker, y + 1, dow, doy)
  if (nextW >= 1) {
    return Math.min(w, nextW)
  }

  return w
}


function weekOfGivenYear(marker, year, dow, doy) {
  let firstWeekStart = arrayToUtcDate([ year, 0, 1 + firstWeekOffset(year, dow, doy) ])
  let dayStart = startOfDay(marker)
  let days = Math.round(diffDays(firstWeekStart, dayStart))

  return Math.floor(days / 7) + 1 // zero-indexed
}


function startOfDay(marker: DateMarker): DateMarker {
  return arrayToUtcDate([
    marker.getUTCFullYear(),
    marker.getUTCMonth(),
    marker.getUTCDate()
  ])
}


export function diffDays(m0, m1) { // will give float
  return (m1.valueOf() - m0.valueOf()) / MS_IN_DAY
}

export function diffWeeks(m0, m1) { // will give float
  return Math.round(diffDays(m0, m1)) / 7
}


// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
  var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
      fwd = 7 + dow - doy,
      // first-week day local weekday -- which local weekday is fwd
      fwdlw = (7 + arrayToUtcDate([ year, 0, fwd ]).getUTCDay() - dow) % 7;
  return -fwdlw + fwd - 1;
}


function isNativeDate(input) {
  return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date
}



const MS_IN_HOUR = 1000 * 60 * 60
const MS_IN_MINUTE = 1000 * 60


function diffHours(m0, m1) {
  let ms = m1.valueOf() - m0.valueOf()

  if (ms % MS_IN_HOUR === 0) {
    return ms / MS_IN_HOUR
  }

  return null
}


function diffMinutes(m0, m1) {
  let ms = m1.valueOf() - m0.valueOf()

  if (ms % MS_IN_MINUTE === 0) {
    return ms / MS_IN_MINUTE
  }

  return null
}


function diffSeconds(m0, m1) {
  let ms = m1.valueOf() - m0.valueOf()

  if (ms % 1000 === 0) {
    return ms / 1000
  }

  return null
}

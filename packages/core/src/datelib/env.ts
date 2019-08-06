import {
  DateMarker, addMs,
  diffHours, diffMinutes, diffSeconds, diffWholeWeeks, diffWholeDays,
  startOfDay, startOfHour, startOfMinute, startOfSecond,
  weekOfYear, arrayToUtcDate, dateToUtcArray, dateToLocalArray, arrayToLocalDate, timeAsMs, isValidDate
} from './marker'
import { CalendarSystem, createCalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { NamedTimeZoneImpl, NamedTimeZoneImplClass } from './timezone'
import { Duration, asRoughYears, asRoughMonths, asRoughDays, asRoughMs } from './duration'
import { DateFormatter, buildIsoString } from './formatting'
import { parse } from './parsing'
import { isInt } from '../util/misc'
import { CmdFormatterFunc } from './formatting-cmd'

export interface DateEnvSettings {
  timeZone: string
  namedTimeZoneImpl?: NamedTimeZoneImplClass
  calendarSystem: string
  locale: Locale
  weekNumberCalculation?: any
  firstDay?: any,
  weekLabel?: string,
  cmdFormatter?: CmdFormatterFunc
}

export type DateInput = Date | string | number | number[]

export interface DateMarkerMeta {
  marker: DateMarker
  isTimeUnspecified: boolean
  forcedTzo: number | null
}


export class DateEnv {

  timeZone: string
  namedTimeZoneImpl: NamedTimeZoneImpl
  canComputeOffset: boolean

  calendarSystem: CalendarSystem
  locale: Locale
  weekDow: number // which day begins the week
  weekDoy: number // which day must be within the year, for computing the first week number
  weekNumberFunc: any
  weekLabel: string // DON'T LIKE how options are confused with local
  cmdFormatter?: CmdFormatterFunc


  constructor(settings: DateEnvSettings) {
    let timeZone = this.timeZone = settings.timeZone
    let isNamedTimeZone = timeZone !== 'local' && timeZone !== 'UTC'

    if (settings.namedTimeZoneImpl && isNamedTimeZone) {
      this.namedTimeZoneImpl = new settings.namedTimeZoneImpl(timeZone)
    }

    this.canComputeOffset = Boolean(!isNamedTimeZone || this.namedTimeZoneImpl)

    this.calendarSystem = createCalendarSystem(settings.calendarSystem)
    this.locale = settings.locale
    this.weekDow = settings.locale.week.dow
    this.weekDoy = settings.locale.week.doy

    if (settings.weekNumberCalculation === 'ISO') {
      this.weekDow = 1
      this.weekDoy = 4
    }

    if (typeof settings.firstDay === 'number') {
      this.weekDow = settings.firstDay
    }

    if (typeof settings.weekNumberCalculation === 'function') {
      this.weekNumberFunc = settings.weekNumberCalculation
    }

    this.weekLabel = settings.weekLabel != null ? settings.weekLabel : settings.locale.options.weekLabel

    this.cmdFormatter = settings.cmdFormatter
  }


  // Creating / Parsing

  createMarker(input: DateInput): DateMarker {
    let meta = this.createMarkerMeta(input)
    if (meta === null) {
      return null
    }
    return meta.marker
  }

  createNowMarker(): DateMarker {
    if (this.canComputeOffset) {
      return this.timestampToMarker(new Date().valueOf())
    } else {
      // if we can't compute the current date val for a timezone,
      // better to give the current local date vals than UTC
      return arrayToUtcDate(dateToLocalArray(new Date()))
    }
  }

  createMarkerMeta(input: DateInput): DateMarkerMeta {

    if (typeof input === 'string') {
      return this.parse(input)
    }

    let marker = null

    if (typeof input === 'number') {
      marker = this.timestampToMarker(input)
    } else if (input instanceof Date) {
      input = input.valueOf()

      if (!isNaN(input)) {
        marker = this.timestampToMarker(input)
      }
    } else if (Array.isArray(input)) {
      marker = arrayToUtcDate(input)
    }

    if (marker === null || !isValidDate(marker)) {
      return null
    }

    return { marker, isTimeUnspecified: false, forcedTzo: null }
  }

  parse(s: string) {
    let parts = parse(s)
    if (parts === null) {
      return null
    }

    let marker = parts.marker
    let forcedTzo = null

    if (parts.timeZoneOffset !== null) {
      if (this.canComputeOffset) {
        marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1000)
      } else {
        forcedTzo = parts.timeZoneOffset
      }
    }

    return { marker, isTimeUnspecified: parts.isTimeUnspecified, forcedTzo }
  }


  // Accessors

  getYear(marker: DateMarker): number {
    return this.calendarSystem.getMarkerYear(marker)
  }

  getMonth(marker: DateMarker): number {
    return this.calendarSystem.getMarkerMonth(marker)
  }


  // Adding / Subtracting

  add(marker: DateMarker, dur: Duration): DateMarker {
    let a = this.calendarSystem.markerToArray(marker)
    a[0] += dur.years
    a[1] += dur.months
    a[2] += dur.days
    a[6] += dur.milliseconds
    return this.calendarSystem.arrayToMarker(a)
  }

  subtract(marker: DateMarker, dur: Duration): DateMarker {
    let a = this.calendarSystem.markerToArray(marker)
    a[0] -= dur.years
    a[1] -= dur.months
    a[2] -= dur.days
    a[6] -= dur.milliseconds
    return this.calendarSystem.arrayToMarker(a)
  }

  addYears(marker: DateMarker, n: number) {
    let a = this.calendarSystem.markerToArray(marker)
    a[0] += n
    return this.calendarSystem.arrayToMarker(a)
  }

  addMonths(marker: DateMarker, n: number) {
    let a = this.calendarSystem.markerToArray(marker)
    a[1] += n
    return this.calendarSystem.arrayToMarker(a)
  }


  // Diffing Whole Units

  diffWholeYears(m0: DateMarker, m1: DateMarker): number {
    let { calendarSystem } = this

    if (
      timeAsMs(m0) === timeAsMs(m1) &&
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
      timeAsMs(m0) === timeAsMs(m1) &&
      calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)
    ) {
      return (calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0)) +
          (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12
    }
    return null
  }


  // Range / Duration

  greatestWholeUnit(m0: DateMarker, m1: DateMarker) {
    let n = this.diffWholeYears(m0, m1)

    if (n !== null) {
      return { unit: 'year', value: n }
    }

    n = this.diffWholeMonths(m0, m1)

    if (n !== null) {
      return { unit: 'month', value: n }
    }

    n = diffWholeWeeks(m0, m1)

    if (n !== null) {
      return { unit: 'week', value: n }
    }

    n = diffWholeDays(m0, m1)

    if (n !== null) {
      return { unit: 'day', value: n }
    }

    n = diffHours(m0, m1)

    if (isInt(n)) {
      return { unit: 'hour', value: n }
    }

    n = diffMinutes(m0, m1)

    if (isInt(n)) {
      return { unit: 'minute', value: n }
    }

    n = diffSeconds(m0, m1)

    if (isInt(n)) {
      return { unit: 'second', value: n }
    }

    return { unit: 'millisecond', value: m1.valueOf() - m0.valueOf() }
  }

  countDurationsBetween(m0: DateMarker, m1: DateMarker, d: Duration) {
    // TODO: can use greatestWholeUnit
    let diff

    if (d.years) {
      diff = this.diffWholeYears(m0, m1)
      if (diff !== null) {
        return diff / asRoughYears(d)
      }
    }

    if (d.months) {
      diff = this.diffWholeMonths(m0, m1)
      if (diff !== null) {
        return diff / asRoughMonths(d)
      }
    }

    if (d.days) {
      diff = diffWholeDays(m0, m1)
      if (diff !== null) {
        return diff / asRoughDays(d)
      }
    }

    return (m1.valueOf() - m0.valueOf()) / asRoughMs(d)
  }


  // Start-Of

  startOf(m: DateMarker, unit: string) {
    if (unit === 'year') {
      return this.startOfYear(m)
    } else if (unit === 'month') {
      return this.startOfMonth(m)
    } else if (unit === 'week') {
      return this.startOfWeek(m)
    } else if (unit === 'day') {
      return startOfDay(m)
    } else if (unit === 'hour') {
      return startOfHour(m)
    } else if (unit === 'minute') {
      return startOfMinute(m)
    } else if (unit === 'second') {
      return startOfSecond(m)
    }
  }

  startOfYear(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m)
    ])
  }

  startOfMonth(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m)
    ])
  }

  startOfWeek(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m),
      m.getUTCDate() - ((m.getUTCDay() - this.weekDow + 7) % 7)
    ])
  }


  // Week Number

  computeWeekNumber(marker: DateMarker): number {
    if (this.weekNumberFunc) {
      return this.weekNumberFunc(this.toDate(marker))
    } else {
      return weekOfYear(marker, this.weekDow, this.weekDoy)
    }
  }

  // TODO: choke on timeZoneName: long
  format(marker: DateMarker, formatter: DateFormatter, dateOptions: { forcedTzo?: number } = {}) {
    return formatter.format(
      {
        marker: marker,
        timeZoneOffset: dateOptions.forcedTzo != null ?
          dateOptions.forcedTzo :
          this.offsetForMarker(marker)
      },
      this
    )
  }

  formatRange(start: DateMarker, end: DateMarker, formatter: DateFormatter, dateOptions: { forcedStartTzo?: number, forcedEndTzo?: number, isEndExclusive?: boolean } = {}) {

    if (dateOptions.isEndExclusive) {
      end = addMs(end, -1)
    }

    return formatter.formatRange(
      {
        marker: start,
        timeZoneOffset: dateOptions.forcedStartTzo != null ?
          dateOptions.forcedStartTzo :
          this.offsetForMarker(start)
      },
      {
        marker: end,
        timeZoneOffset: dateOptions.forcedEndTzo != null ?
          dateOptions.forcedEndTzo :
          this.offsetForMarker(end)
      },
      this
    )
  }

  formatIso(marker: DateMarker, extraOptions: any = {}) {
    let timeZoneOffset = null

    if (!extraOptions.omitTimeZoneOffset) {
      if (extraOptions.forcedTzo != null) {
        timeZoneOffset = extraOptions.forcedTzo
      } else {
        timeZoneOffset = this.offsetForMarker(marker)
      }
    }

    return buildIsoString(marker, timeZoneOffset, extraOptions.omitTime)
  }


  // TimeZone

  timestampToMarker(ms: number) {
    if (this.timeZone === 'local') {
      return arrayToUtcDate(dateToLocalArray(new Date(ms)))
    } else if (this.timeZone === 'UTC' || !this.namedTimeZoneImpl) {
      return new Date(ms)
    } else {
      return arrayToUtcDate(this.namedTimeZoneImpl.timestampToArray(ms))
    }
  }

  offsetForMarker(m: DateMarker) {
    if (this.timeZone === 'local') {
      return -arrayToLocalDate(dateToUtcArray(m)).getTimezoneOffset() // convert "inverse" offset to "normal" offset
    } else if (this.timeZone === 'UTC') {
      return 0
    } else if (this.namedTimeZoneImpl) {
      return this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m))
    }
    return null
  }


  // Conversion

  toDate(m: DateMarker, forcedTzo?: number): Date {
    if (this.timeZone === 'local') {
      return arrayToLocalDate(dateToUtcArray(m))
    } else if (this.timeZone === 'UTC') {
      return new Date(m.valueOf()) // make sure it's a copy
    } else if (!this.namedTimeZoneImpl) {
      return new Date(m.valueOf() - (forcedTzo || 0))
    } else {
      return new Date(
        m.valueOf() -
        this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m)) * 1000 * 60 // convert minutes -> ms
      )
    }
  }

}

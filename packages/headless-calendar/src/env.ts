import * as ZonedDateTimeFns from 'temporal-polyfill/fns/zoneddatetime'
import * as PlainDateTimeFns from 'temporal-polyfill/fns/plaindatetime'
import * as InstantFns from 'temporal-polyfill/fns/instant'
import {
  DateMarker, addMs,
  diffHours, diffMinutes, diffSeconds, diffWholeWeeks, diffWholeDays,
  startOfDay, startOfHour, startOfMinute, startOfSecond,
  weekOfYear, arrayToUtcDate, dateToUtcArray, dateToLocalArray, arrayToLocalDate, timeAsMs, isValidDate,
} from './marker'
import { CalendarSystem, createCalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { Duration, asRoughYears, asRoughMonths, asRoughDays, asRoughMs } from './duration'
import {
  DateFormatter,
  CmdDateFormatterFunc,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
} from './formatting-interface'
import { buildIsoString } from './formatting-utils'
import { parse } from './parsing'
import { isInt } from './utils'

export type WeekNumberCalculation = 'local' | 'ISO' | ((m: Date) => number)

export interface DateEnvSettings {
  timeZone: string
  calendarSystem: string
  locale: Locale
  weekNumberCalculation?: WeekNumberCalculation
  firstDay?: number, // will override what the locale wants
  weekTextLong?: string,
  weekTextShort?: string
  cmdFormatter?: CmdDateFormatterFunc
}

export type DateInput = Date | string | number | number[]

export interface DateMarkerMeta {
  marker: DateMarker
  isTimeUnspecified: boolean
}

export class DateEnv {
  timeZone: string
  calendarSystem: CalendarSystem
  locale: Locale
  weekDow: number // which day begins the week
  weekDoy: number // which day must be within the year, for computing the first week number
  weekNumberFunc: any
  weekTextLong: string // DON'T LIKE how options are confused with local
  weekTextShort: string
  cmdFormatter?: CmdDateFormatterFunc

  constructor(settings: DateEnvSettings) {
    this.timeZone = settings.timeZone
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

    this.weekTextLong = settings.weekTextLong
    this.weekTextShort = settings.weekTextShort ?? settings.weekTextLong

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
    return this.timestampToMarker(new Date().valueOf())
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

    return { marker, isTimeUnspecified: false }
  }

  parse(s: string) {
    let parts = parse(s)
    if (parts === null) {
      return null
    }

    let { marker } = parts

    if (parts.timeZoneOffset !== null) {
      marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1000)
    }

    return { marker, isTimeUnspecified: parts.isTimeUnspecified }
  }

  // Accessors

  getYear(marker: DateMarker): number {
    return this.calendarSystem.getMarkerYear(marker)
  }

  getMonth(marker: DateMarker): number {
    return this.calendarSystem.getMarkerMonth(marker)
  }

  getDay(marker: DateMarker): number {
    return this.calendarSystem.getMarkerDay(marker)
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
  // these DON'T return zoned-dates. only UTC start-of dates

  startOf(m: DateMarker, unit: string) {
    if (unit === 'year') {
      return this.startOfYear(m)
    }
    if (unit === 'month') {
      return this.startOfMonth(m)
    }
    if (unit === 'week') {
      return this.startOfWeek(m)
    }
    if (unit === 'day') {
      return startOfDay(m)
    }
    if (unit === 'hour') {
      return startOfHour(m)
    }
    if (unit === 'minute') {
      return startOfMinute(m)
    }
    if (unit === 'second') {
      return startOfSecond(m)
    }
    return null
  }

  startOfYear(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
    ])
  }

  startOfMonth(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m),
    ])
  }

  startOfWeek(m: DateMarker): DateMarker {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m),
      m.getUTCDate() - ((m.getUTCDay() - this.weekDow + 7) % 7),
    ])
  }

  // Week Number

  computeWeekNumber(marker: DateMarker): number {
    if (this.weekNumberFunc) {
      return this.weekNumberFunc(this.toDate(marker))
    }
    return weekOfYear(marker, this.weekDow, this.weekDoy)
  }

  formatToParts(
    marker: DateMarker,
    formatter: DateFormatter,
  ): DateTimeFormatPartWithWeek[] {
    return formatter.formatToParts(
      {
        marker,
        timeZoneOffset: this.offsetForMarker(marker),
      },
      this,
    )
  }

  formatRangeToParts(
    start: DateMarker,
    end: DateMarker,
    formatter: DateFormatter,
    dateOptions: { isEndExclusive?: boolean } = {},
  ): DateTimeRangeFormatPartWithWeek[] {
    if (dateOptions.isEndExclusive) {
      end = addMs(end, -1)
    }

    return formatter.formatRangeToParts(
      {
        marker: start,
        timeZoneOffset: this.offsetForMarker(start),
      },
      {
        marker: end,
        timeZoneOffset: this.offsetForMarker(end),
      },
      this,
    )
  }

  /*
  DUMB: the omitTime arg is dumb. if we omit the time, we want to omit the timezone offset. and if we do that,
  might as well use buildIsoString or some other util directly
  */
  formatIso(marker: DateMarker, extraOptions: any = {}): string {
    let timeZoneOffset = null

    if (!extraOptions.omitTimeZoneOffset) {
      timeZoneOffset = this.offsetForMarker(marker)
    }

    return buildIsoString(marker, timeZoneOffset, extraOptions.omitTime)
  }

  // TimeZone

  timestampToMarker(ms: number) {
    if (this.timeZone === 'local') {
      return arrayToUtcDate(dateToLocalArray(new Date(ms)))
    }
    if (this.timeZone === 'UTC') {
      return new Date(ms)
    }

    const zdtFields = ZonedDateTimeFns.getFields(
      InstantFns.toZonedDateTimeISO(InstantFns.fromEpochMilliseconds(ms), this.timeZone),
    )

    return new Date( // a "Date Marker", which is like PlainDateTime
      Date.UTC(
        zdtFields.year,
        zdtFields.month - 1,
        zdtFields.day,
        zdtFields.hour,
        zdtFields.minute,
        zdtFields.second,
        zdtFields.millisecond,
      ),
    )
  }

  offsetForMarker(m: DateMarker) {
    if (this.timeZone === 'local') {
      return -arrayToLocalDate(dateToUtcArray(m)).getTimezoneOffset() // convert "inverse" offset to "normal" offset
    }
    if (this.timeZone === 'UTC') {
      return 0
    }

    return ZonedDateTimeFns.offsetNanoseconds(
      PlainDateTimeFns.toZonedDateTime(
        PlainDateTimeFns.create(
          m.getUTCFullYear(),
          m.getUTCMonth() + 1,
          m.getUTCDate(),
          m.getUTCHours(),
          m.getUTCMinutes(),
          m.getUTCSeconds(),
          m.getUTCMilliseconds(),
        ),
        this.timeZone,
      ),
    ) / (1000000000 * 60)
  }

  // Conversion

  toDate(m: DateMarker): Date {
    if (this.timeZone === 'local') {
      return arrayToLocalDate(dateToUtcArray(m))
    }
    if (this.timeZone === 'UTC') {
      return new Date(m.valueOf()) // make sure it's a copy
    }

    return new Date(
      ZonedDateTimeFns.epochMilliseconds(
        PlainDateTimeFns.toZonedDateTime(
          PlainDateTimeFns.create(
            m.getUTCFullYear(),
            m.getUTCMonth() + 1,
            m.getUTCDate(),
            m.getUTCHours(),
            m.getUTCMinutes(),
            m.getUTCSeconds(),
            m.getUTCMilliseconds(),
          ),
          this.timeZone,
        ),
      ),
    )
  }
}

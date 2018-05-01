import { DateMarker, arrayToUtcDate, weekOfYear, dayOfYearFromWeeks, dateToUtcArray, arrayToLocalDate, dateToLocalArray  } from './util'
import { CalendarSystem, createCalendarSystem } from './calendar-system'
import { namedTimeZoneOffsetGenerator, getNamedTimeZoneOffsetGenerator } from './timezone'
import { getLocale } from './locale'
import { Duration } from './duration'
import { DateFormatter, buildIsoString } from './formatting'
import { parse } from './parsing'

export interface DateEnvSettings {
  timeZone: string
  timeZoneImpl?: string
  calendarSystem: string
  locale: string
}

export class DateEnv {

  timeZone: string
  namedTimeZoneOffsetGenerator: namedTimeZoneOffsetGenerator
  calendarSystem: CalendarSystem
  locale: string
  weekMeta: any

  constructor(settings: DateEnvSettings) {
    this.timeZone = settings.timeZone
    this.namedTimeZoneOffsetGenerator = getNamedTimeZoneOffsetGenerator(settings.timeZoneImpl)
    this.calendarSystem = createCalendarSystem(settings.calendarSystem)
    this.locale = settings.locale
    this.weekMeta = getLocale(settings.locale).week
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
    let { dow, doy } = this.weekMeta
    let weekInfo = weekOfYear(marker, dow, doy)
    let dayOfYear = dayOfYearFromWeeks(weekInfo.year, weekInfo.week, 0, dow, doy)

    return arrayToUtcDate([ dayOfYear.year, 0, dayOfYear.dayOfYear ]) // weeks are always in gregorian, i think
  }

  startOfDay(marker: DateMarker): DateMarker {
    return arrayToUtcDate([
      marker.getUTCFullYear(),
      marker.getUTCMonth(),
      marker.getUTCDate()
    ])
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

  toRangeFormat(start: DateMarker, end: DateMarker, formatter: DateFormatter, extraOptions: any = {}) {
    return formatter.format(
      {
        marker: start,
        timeZoneOffset: extraOptions.forcedStartTimeZoneOffset != null ?
          extraOptions.forcedStartTimeZoneOffset :
          this.computeTimeZoneOffset(start)
      },
      {
        marker: end,
        timeZoneOffset: extraOptions.forcedEndTimeZoneOffset != null ?
          extraOptions.forcedEndTimeZoneOffset :
          this.computeTimeZoneOffset(end)
      },
      this
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
        this.computeTimeZoneOffset(marker)
    )
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

    return { marker, hasTime: parts.hasTime, forcedTimeZoneOffset } // TODO: timeNotSpecified
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
      return calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0) +
       (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12
    }
    return null
  }

  diffWholeWeeks(m0: DateMarker, m1: DateMarker): number {
    let days = this.diffWholeDays(m0, m1)

    if (days !== null && days % 7 === 0) {
      return days / 7
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
      return Math.round((m1.valueOf() - m0.valueOf()) / 864e5)
    }
    return null
  }

  diffDayAndTime(m0: DateMarker, m1: DateMarker): Duration {
    let m0day = this.startOfDay(m0)
    let m1day = this.startOfDay(m1)

    return {
      year: 0,
      month: 0,
      day: Math.round((m1day.valueOf() - m0day.valueOf()) / 864e5),
      time: (m1.valueOf() - m1day.valueOf()) - (m0.valueOf() - m0day.valueOf())
    }
  }

}

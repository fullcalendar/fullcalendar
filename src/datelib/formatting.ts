import { padStart } from '../util/misc'
import { DateMarker } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { NativeFormatter } from './formatting-native'
import { CmdFormatter } from './formatting-cmd'
import { FuncFormatter, FuncFormatterFunc } from './formatting-func'

export interface ZonedMarker {
  marker: DateMarker,
  timeZoneOffset: number
}

export interface ExpandedZoneMarker extends ZonedMarker {
  array: number[],
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
}

export interface VerboseFormattingArg {
  date: ExpandedZoneMarker
  start: ExpandedZoneMarker
  end?: ExpandedZoneMarker
  timeZone: string
  localeCodes: string[]
}

export interface DateFormattingContext {
  timeZone: string,
  locale: Locale,
  calendarSystem: CalendarSystem
  computeWeekNumber: (d: DateMarker) => number
  weekLabel: string
}

export interface DateFormatter {
  format(date: ZonedMarker, context: DateFormattingContext)
  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext)
}

// TODO: use Intl.DateTimeFormatOptions
export type FormatterInput = object | string | FuncFormatterFunc


// Formatter Object Creation

export function createFormatter(input: FormatterInput): DateFormatter {
  if (typeof input === 'object') {
    return new NativeFormatter(input)
  }
  else if (typeof input === 'string') {
    return new CmdFormatter(input)
  }
  else if (typeof input === 'function') {
    return new FuncFormatter(input)
  }
}


// String Utils

export function buildIsoString(marker: DateMarker, timeZoneOffset?: number, stripZeroTime: boolean = false) {
  let s = marker.toISOString()

  s = s.replace('.000', '')

  if (stripZeroTime) {
    s = s.replace('T00:00:00Z', '')
  }

  if (s.length > 10) { // time part wasn't stripped, can add timezone info
    if (timeZoneOffset == null) {
      s = s.replace('Z', '')
    } else if (timeZoneOffset !== 0) {
      s = s.replace('Z', formatTimeZoneOffset(timeZoneOffset, true))
    }
    // otherwise, its UTC-0 and we want to keep the Z
  }

  return s
}

export function formatIsoTimeString(marker: DateMarker) {
  return padStart(marker.getUTCHours(), 2) + ':' +
    padStart(marker.getUTCMinutes(), 2) + ':' +
    padStart(marker.getUTCSeconds(), 2)
}

export function formatTimeZoneOffset(minutes: number, doIso = false) {
  let sign = minutes < 0 ? '+' : '-' // whaaa
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  if (doIso) {
    return sign + padStart(hours, 2) + ':' + padStart(mins, 2)
  } else {
    return 'GMT' + sign + hours + (mins ? ':' + padStart(mins, 2) : '')
  }
}


// Arg Utils

export function createVerboseFormattingArg(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
  let startInfo = expandZonedMarker(start, context.calendarSystem)
  let endInfo = end ? expandZonedMarker(end, context.calendarSystem) : null

  return {
    date: startInfo,
    start: startInfo,
    end: endInfo,
    timeZone: context.timeZone,
    localeCodes: context.locale.codes
  }
}

function expandZonedMarker(dateInfo: ZonedMarker, calendarSystem: CalendarSystem): ExpandedZoneMarker {
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
    millisecond: a[6]
  }
}

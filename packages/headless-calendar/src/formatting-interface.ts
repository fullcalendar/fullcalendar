import { DateMarker } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'

/*
One point in time, expressed both ways formatters need it:
- instantMs: the real epoch instant, suitable for Intl formatters constructed with the
  calendar's actual time zone
- marker: the wall-clock reading of that instant in the calendar's zone (UTC-field
  encoding), for wall-clock-derived output like week numbers and calendar-system arrays
*/
export interface ZonedInstant {
  marker: DateMarker
  instantMs: number
}

export interface ExpandedZonedInstant extends ZonedInstant {
  timeZoneOffset: number
  array: number[]
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

export function expandZonedInstant(
  dateInfo: ZonedInstant,
  calendarSystem: CalendarSystem,
): ExpandedZonedInstant {
  let a = calendarSystem.markerToArray(dateInfo.marker)

  return {
    marker: dateInfo.marker,
    instantMs: dateInfo.instantMs,
    timeZoneOffset: (dateInfo.marker.valueOf() - dateInfo.instantMs) / 60000,
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

export interface VerboseFormattingData {
  date: ExpandedZonedInstant
  start: ExpandedZonedInstant
  end?: ExpandedZonedInstant | null
  timeZone: string
  localeCodes: string[]
}

export interface DateFormattingContext {
  timeZone: string
  locale: Locale
  calendarSystem: CalendarSystem
  computeWeekNumber: (d: DateMarker) => number
  weekTextLong: string
  weekTextShort: string
  cmdFormatter?: CmdDateFormatterFunc
}

export function createVerboseFormattingArg(
  start: ZonedInstant,
  end: ZonedInstant | null,
  context: DateFormattingContext,
): VerboseFormattingData {
  let startInfo = expandZonedInstant(start, context.calendarSystem)
  let endInfo = end ? expandZonedInstant(end, context.calendarSystem) : null

  return {
    date: startInfo,
    start: startInfo,
    end: endInfo,
    timeZone: context.timeZone,
    localeCodes: context.locale.codes,
  }
}

export type DateTimeFormatPartWithWeek = Omit<Intl.DateTimeFormatPart, 'type'> & {
  type: Intl.DateTimeFormatPart['type'] | 'week'
}

export type DateTimeRangeFormatPartWithWeek = Omit<Intl.DateTimeRangeFormatPart, 'type'> & {
  type: Intl.DateTimeRangeFormatPart['type'] | 'week'
}

export type CmdDateFormatterFunc = (
  cmd: string,
  data: VerboseFormattingData,
) => string | DateTimeFormatPartWithWeek[]

export interface DateFormatter {
  formatToParts(date: ZonedInstant, context: DateFormattingContext): DateTimeFormatPartWithWeek[]
  formatRangeToParts(
    start: ZonedInstant,
    end: ZonedInstant,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[]
}

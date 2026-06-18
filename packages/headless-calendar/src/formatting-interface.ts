import { DateMarker } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { ZonedMarker, ExpandedZonedMarker, expandZonedMarker } from './zoned-marker'

export interface VerboseFormattingData {
  date: ExpandedZonedMarker
  start: ExpandedZonedMarker
  end?: ExpandedZonedMarker | null
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
  start: ZonedMarker,
  end: ZonedMarker | null,
  context: DateFormattingContext,
): VerboseFormattingData {
  let startInfo = expandZonedMarker(start, context.calendarSystem)
  let endInfo = end ? expandZonedMarker(end, context.calendarSystem) : null

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
  formatToParts(date: ZonedMarker, context: DateFormattingContext): DateTimeFormatPartWithWeek[]
  formatRangeToParts(
    start: ZonedMarker,
    end: ZonedMarker,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[]
}

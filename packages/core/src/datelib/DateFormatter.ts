import { DateMarker } from './marker.js'
import { CalendarSystem } from './calendar-system.js'
import { Locale } from './locale.js'
import { ZonedMarker, ExpandedZonedMarker, expandZonedMarker } from './zoned-marker.js'

export interface VerboseFormattingArg {
  date: ExpandedZonedMarker
  start: ExpandedZonedMarker
  end?: ExpandedZonedMarker
  timeZone: string
  localeCodes: string[],
  defaultSeparator: string
}

export function createVerboseFormattingArg(
  start: ZonedMarker,
  end: ZonedMarker,
  context: DateFormattingContext,
  betterDefaultSeparator?: string,
): VerboseFormattingArg {
  let startInfo = expandZonedMarker(start, context.calendarSystem)
  let endInfo = end ? expandZonedMarker(end, context.calendarSystem) : null

  return {
    date: startInfo,
    start: startInfo,
    end: endInfo,
    timeZone: context.timeZone,
    localeCodes: context.locale.codes,
    defaultSeparator: betterDefaultSeparator || context.defaultSeparator,
  }
}

export type CmdFormatterFunc = (cmd: string, arg: VerboseFormattingArg) => string

export interface DateFormattingContext {
  timeZone: string,
  locale: Locale,
  calendarSystem: CalendarSystem
  computeWeekNumber: (d: DateMarker) => number
  weekText: string
  weekTextLong: string
  cmdFormatter?: CmdFormatterFunc
  defaultSeparator: string
}

export interface DateFormatter {
  format(date: ZonedMarker, context: DateFormattingContext): string
  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string): string
}

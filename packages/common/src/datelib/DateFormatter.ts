import { DateMarker } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { ZonedMarker, ExpandedZonedMarker, expandZonedMarker } from './zoned-marker'

export interface VerboseFormattingArg { // TODO: kill this
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
  cmdFormatter?: CmdFormatterFunc
  defaultSeparator: string
}

export interface DateFormatter {
  format(date: ZonedMarker, context: DateFormattingContext): string
  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string): string
}

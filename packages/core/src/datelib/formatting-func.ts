import { DateFormatter, DateFormattingContext, createVerboseFormattingArg, VerboseFormattingArg } from './DateFormatter.js'
import { ZonedMarker } from './zoned-marker.js'

export type FuncFormatterFunc = (arg: VerboseFormattingArg) => string

export class FuncFormatter implements DateFormatter {
  func: FuncFormatterFunc

  constructor(func: FuncFormatterFunc) {
    this.func = func
  }

  format(date: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string) {
    return this.func(createVerboseFormattingArg(date, null, context, betterDefaultSeparator))
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string) {
    return this.func(createVerboseFormattingArg(start, end, context, betterDefaultSeparator))
  }
}

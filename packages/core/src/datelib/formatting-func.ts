import {
  DateFormatter, DateFormattingContext, ZonedMarker,
  VerboseFormattingArg, createVerboseFormattingArg
} from './formatting'

export type FuncFormatterFunc = (arg: VerboseFormattingArg) => string


export class FuncFormatter implements DateFormatter {

  func: FuncFormatterFunc

  constructor(func: FuncFormatterFunc) {
    this.func = func
  }

  format(date: ZonedMarker, context: DateFormattingContext) {
    return this.func(createVerboseFormattingArg(date, null, context))
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
    return this.func(createVerboseFormattingArg(start, end, context))
  }

}

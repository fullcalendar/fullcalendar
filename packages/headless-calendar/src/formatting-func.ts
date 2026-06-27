import {
  DateFormatter,
  DateFormattingContext,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
  VerboseFormattingData,
  createVerboseFormattingArg,
} from './formatting-interface'
import { ZonedMarker } from './zoned-marker'

export type FuncDateFormatterFunc = (info: VerboseFormattingData) => string

export class FuncDateFormatter implements DateFormatter {
  func: FuncDateFormatterFunc

  constructor(func: FuncDateFormatterFunc) {
    this.func = func
  }

  formatToParts(
    date: ZonedMarker,
    context: DateFormattingContext,
  ): DateTimeFormatPartWithWeek[] {
    const str = this.func(createVerboseFormattingArg(date, null, context))
    return [{ type: 'literal', value: str }]
  }

  formatRangeToParts(
    start: ZonedMarker,
    end: ZonedMarker,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[] {
    const str = this.func(createVerboseFormattingArg(start, end, context))
    return [{ source: 'shared', type: 'literal', value: str }]
  }
}

import {
  DateFormatter,
  DateFormattingContext,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
  VerboseFormattingData,
  createVerboseFormattingArg,
  ZonedInstant,
} from './formatting-interface'

export type FuncDateFormatterFunc = (info: VerboseFormattingData) => string

export class FuncDateFormatter implements DateFormatter {
  func: FuncDateFormatterFunc

  constructor(func: FuncDateFormatterFunc) {
    this.func = func
  }

  formatToParts(
    date: ZonedInstant,
    context: DateFormattingContext,
  ): DateTimeFormatPartWithWeek[] {
    const str = this.func(createVerboseFormattingArg(date, null, context))
    return [{ type: 'literal', value: str }]
  }

  formatRangeToParts(
    start: ZonedInstant,
    end: ZonedInstant,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[] {
    const str = this.func(createVerboseFormattingArg(start, end, context))
    return [{ source: 'shared', type: 'literal', value: str }]
  }
}

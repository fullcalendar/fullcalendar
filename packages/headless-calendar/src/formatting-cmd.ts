import {
  DateFormatter,
  DateFormattingContext,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
  createVerboseFormattingArg,
  ZonedInstant,
} from './formatting-interface'

export class CmdDateFormatter implements DateFormatter {
  cmdStr: string

  constructor(cmdStr: string) {
    this.cmdStr = cmdStr
  }

  formatToParts(
    date: ZonedInstant,
    context: DateFormattingContext,
  ): DateTimeFormatPartWithWeek[] {
    const res = context.cmdFormatter!(
      this.cmdStr,
      createVerboseFormattingArg(date, null, context),
    )

    if (Array.isArray(res)) {
      return res
    }

    return [{ type: 'literal', value: res }]
  }

  formatRangeToParts(
    start: ZonedInstant,
    end: ZonedInstant,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[] {
    const res = context.cmdFormatter!(
      this.cmdStr,
      createVerboseFormattingArg(start, end, context),
    )

    if (Array.isArray(res)) {
      return res.map((part) => ({
        source: 'shared',
        ...part,
      }))
    }

    return [{ source: 'shared', type: 'literal', value: res }]
  }
}

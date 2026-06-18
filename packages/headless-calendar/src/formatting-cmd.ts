import {
  DateFormatter,
  DateFormattingContext,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
  createVerboseFormattingArg,
} from './formatting-interface'
import { ZonedMarker } from './zoned-marker'

export class CmdDateFormatter implements DateFormatter {
  cmdStr: string

  constructor(cmdStr: string) {
    this.cmdStr = cmdStr
  }

  formatToParts(
    date: ZonedMarker,
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
    start: ZonedMarker,
    end: ZonedMarker,
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

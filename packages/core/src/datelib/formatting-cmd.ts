import { DateFormatter, DateFormattingContext, createVerboseFormattingArg } from './DateFormatter'
import { ZonedMarker } from './zoned-marker'

/*
TODO: fix the terminology of "formatter" vs "formatting func"
*/

/*
At the time of instantiation, this object does not know which cmd-formatting system it will use.
It receives this at the time of formatting, as a setting.
*/
export class CmdFormatter implements DateFormatter {
  cmdStr: string

  constructor(cmdStr: string) {
    this.cmdStr = cmdStr
  }

  format(date: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string) {
    return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(date, null, context, betterDefaultSeparator))
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext, betterDefaultSeparator?: string) {
    return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(start, end, context, betterDefaultSeparator))
  }
}

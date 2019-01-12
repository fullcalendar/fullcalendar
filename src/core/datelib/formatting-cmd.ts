import {
  DateFormatter, DateFormattingContext, ZonedMarker,
  VerboseFormattingArg, createVerboseFormattingArg
} from './formatting'

export type CmdFormatterFunc = (cmd: string, arg: VerboseFormattingArg) => string


let cmdFormatters: { [name: string]: CmdFormatterFunc } = {}

export function registerCmdFormatter(name, input: CmdFormatterFunc) {
  cmdFormatters[name] = input
}

export function getCmdFormatter(name: string): CmdFormatterFunc | null {
  return cmdFormatters[name]
}

/*
TODO: fix the terminology of "formatter" vs "formatting func"
*/

/*
At the time of instantiation, this object does not know which cmd-formatting system it will use.
It receives this at the time of formatting, as a setting.
*/
export class CmdFormatter implements DateFormatter {

  cmdStr: string
  separator: string

  constructor(cmdStr: string, separator?: string) {
    this.cmdStr = cmdStr
    this.separator = separator
  }

  format(date: ZonedMarker, context: DateFormattingContext) {
    return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(date, null, context, this.separator))
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
    return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(start, end, context, this.separator))
  }

}

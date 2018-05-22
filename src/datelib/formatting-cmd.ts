import {
  DateFormatter, DateFormattingContext, ZonedMarker,
  VerboseFormattingArg, createVerboseFormattingArg
} from './formatting'

export type CmdFormatterFunc = (cmd: string, arg: VerboseFormattingArg) => string


let soleCmdFunc: CmdFormatterFunc = null

export function registerCmdFormatter(name, input: CmdFormatterFunc) {
  if (!soleCmdFunc) {
    soleCmdFunc = input
  }
}


export class CmdFormatter implements DateFormatter {

  cmdStr: string

  constructor(cmdStr: string) {
    this.cmdStr = cmdStr
  }

  format(date: ZonedMarker, context: DateFormattingContext) {
    return soleCmdFunc(this.cmdStr, createVerboseFormattingArg(date, null, context))
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
    return soleCmdFunc(this.cmdStr, createVerboseFormattingArg(start, end, context))
  }

}

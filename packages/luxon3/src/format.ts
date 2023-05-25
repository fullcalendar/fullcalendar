import { VerboseFormattingArg } from '@fullcalendar/core/internal'
import { arrayToLuxon } from './convert.js'

export function formatWithCmdStr(cmdStr: string, arg: VerboseFormattingArg): string {
  let cmd = parseCmdStr(cmdStr)

  if (arg.end) {
    let start = arrayToLuxon(
      arg.start.array,
      arg.timeZone,
      arg.localeCodes[0],
    )
    let end = arrayToLuxon(
      arg.end.array,
      arg.timeZone,
      arg.localeCodes[0],
    )
    return formatRange(
      cmd,
      start.toFormat.bind(start),
      end.toFormat.bind(end),
      arg.defaultSeparator,
    )
  }

  return arrayToLuxon(
    arg.date.array,
    arg.timeZone,
    arg.localeCodes[0],
  ).toFormat(cmd.whole)
}

/* Range Formatting (duplicate code as other date plugins)
----------------------------------------------------------------------------------------------------*/

interface CmdParts {
  head: string | null
  middle: CmdParts | null
  tail: string | null
  whole: string
}

function parseCmdStr(cmdStr: string): CmdParts {
  let parts = cmdStr.match(/^(.*?)\{(.*)\}(.*)$/) // TODO: lookbehinds for escape characters

  if (parts) {
    let middle = parseCmdStr(parts[2])

    return {
      head: parts[1],
      middle,
      tail: parts[3],
      whole: parts[1] + middle.whole + parts[3],
    }
  }

  return {
    head: null,
    middle: null,
    tail: null,
    whole: cmdStr,
  }
}

function formatRange(
  cmd: CmdParts,
  formatStart: (cmdStr: string) => string,
  formatEnd: (cmdStr: string) => string,
  separator: string,
): string {
  if (cmd.middle) {
    let startHead = formatStart(cmd.head)
    let startMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator)
    let startTail = formatStart(cmd.tail)

    let endHead = formatEnd(cmd.head)
    let endMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator)
    let endTail = formatEnd(cmd.tail)

    if (startHead === endHead && startTail === endTail) {
      return startHead +
        (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle) +
        startTail
    }
  }

  let startWhole = formatStart(cmd.whole)
  let endWhole = formatEnd(cmd.whole)

  if (startWhole === endWhole) {
    return startWhole
  }

  return startWhole + separator + endWhole
}

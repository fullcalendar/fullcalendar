import { VerboseFormattingData } from '@full-ui/headless-calendar'
import { arrayToLuxon } from './convert'

// what Intl.DateTimeFormat::formatRangeToParts produces for en-US
const DEFAULT_RANGE_SEPARATOR = ' – '

export function formatWithCmdStr(
  cmdStr: string,
  data: VerboseFormattingData,
): string | Intl.DateTimeFormatPart[] {
  let cmd = parseCmdStr(cmdStr)

  if (data.end) {
    let start = arrayToLuxon(
      data.start.array,
      data.timeZone,
      data.localeCodes[0],
    )
    let end = arrayToLuxon(
      data.end.array,
      data.timeZone,
      data.localeCodes[0],
    )
    return formatRange(
      cmd,
      start.toFormat.bind(start),
      end.toFormat.bind(end),
      DEFAULT_RANGE_SEPARATOR,
    )
  }

  const lux = arrayToLuxon(
    data.date.array,
    data.timeZone,
    data.localeCodes[0],
  )
  const singleCmdStr = cmd.whole
  const singleOutStr = lux.toFormat(singleCmdStr)

  return emulateParts(singleCmdStr, singleOutStr) || singleOutStr
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

function emulateParts(cmdStr: string, outStr: string): Intl.DateTimeFormatPart[] | undefined {
  const numParts = getSingleNumberParts(outStr)

  if (numParts) {
    const numType = getSingleNumberType(cmdStr)

    if (numType) {
      const [head, numStr, tail] = numParts
      const parts: Intl.DateTimeFormatPart[] = []

      if (head) {
        parts.push({ type: 'literal', value: head })
      }

      parts.push({ type: numType, value: numStr })

      if (tail) {
        parts.push({ type: 'literal', value: tail })
      }

      return parts
    }
  }
}

function getSingleNumberParts(
  outStr: string
): [head: string, numStr: string, tail: string] | undefined {
  const parts = outStr.split(/(\d+)/) // capture group keeps match within parts

  if (parts.length === 3) {
    return parts as [head: string, middle: string, tail: string]
  }
}

function getSingleNumberType(cmdStr: string): 'day' | undefined {
  const m = cmdStr.match(/d+/) // d/dd -- day-of-month

  if (m) {
    return 'day'
  }
}

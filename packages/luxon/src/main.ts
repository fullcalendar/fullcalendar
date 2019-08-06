import { DateTime as LuxonDateTime, Duration as LuxonDuration } from 'luxon'
import { Calendar, Duration, NamedTimeZoneImpl, VerboseFormattingArg, createPlugin } from '@fullcalendar/core'

export function toDateTime(date: Date, calendar: Calendar): LuxonDateTime {

  if (!(calendar instanceof Calendar)) {
    throw new Error('must supply a Calendar instance')
  }

  return LuxonDateTime.fromJSDate(date, {
    zone: calendar.dateEnv.timeZone,
    locale: calendar.dateEnv.locale.codes[0]
  })
}

export function toDuration(duration: Duration, calendar: Calendar): LuxonDuration {

  if (!(calendar instanceof Calendar)) {
    throw new Error('must supply a Calendar instance')
  }

  return LuxonDuration.fromObject({
    ...duration,
    locale: calendar.dateEnv.locale.codes[0]
  })
}


class LuxonNamedTimeZone extends NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return arrayToLuxon(a, this.timeZoneName).offset
  }

  timestampToArray(ms: number): number[] {
    return luxonToArray(
      LuxonDateTime.fromMillis(ms, {
        zone: this.timeZoneName
      })
    )
  }

}

function formatWithCmdStr(cmdStr: string, arg: VerboseFormattingArg) {
  let cmd = parseCmdStr(cmdStr)

  if (arg.end) {
    let start = arrayToLuxon(
      arg.start.array,
      arg.timeZone,
      arg.localeCodes[0]
    )
    let end = arrayToLuxon(
      arg.end.array,
      arg.timeZone,
      arg.localeCodes[0]
    )
    return formatRange(
      cmd,
      start.toFormat.bind(start),
      end.toFormat.bind(end),
      arg.separator
    )
  }

  return arrayToLuxon(
    arg.date.array,
    arg.timeZone,
    arg.localeCodes[0]
  ).toFormat(cmd.whole)
}

export default createPlugin({
  cmdFormatter: formatWithCmdStr,
  namedTimeZonedImpl: LuxonNamedTimeZone
})


function luxonToArray(datetime: LuxonDateTime): number[] {
  return [
    datetime.year,
    datetime.month - 1, // convert 1-based to 0-based
    datetime.day,
    datetime.hour,
    datetime.minute,
    datetime.second,
    datetime.millisecond
  ]
}

function arrayToLuxon(arr: number[], timeZone: string, locale?: string): LuxonDateTime {
  return LuxonDateTime.fromObject({
    zone: timeZone,
    locale: locale,
    year: arr[0],
    month: arr[1] + 1, // convert 0-based to 1-based
    day: arr[2],
    hour: arr[3],
    minute: arr[4],
    second: arr[5],
    millisecond: arr[6]
  })
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
      whole: parts[1] + middle.whole + parts[3]
    }
  } else {
    return {
      head: null,
      middle: null,
      tail: null,
      whole: cmdStr
    }
  }
}

function formatRange(
  cmd: CmdParts,
  formatStart: (cmdStr: string) => string,
  formatEnd: (cmdStr: string) => string,
  separator: string
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
  } else {
    return startWhole + separator + endWhole
  }
}

import { DateTime, Duration } from 'luxon'
import * as fc from 'fullcalendar'


export function toDateTime(date: Date, calendar: fc.Calendar): DateTime {

  if (!(calendar instanceof fc.Calendar)) {
    throw new Error('must supply a Calendar instance')
  }

  return DateTime.fromJSDate(date, {
    zone: calendar.dateEnv.timeZone,
    locale: calendar.dateEnv.locale.codes[0]
  })
}

export function toDuration(duration: fc.Duration, calendar: fc.Calendar): Duration {

  if (!(calendar instanceof fc.Calendar)) {
    throw new Error('must supply a Calendar instance')
  }

  return Duration.fromObject({
    ...duration,
    locale: calendar.dateEnv.locale.codes[0]
  })
}

// for browser globals. TODO: better solution
(fc as any).Luxon = {
  toDateTime,
  toDuration
}


class LuxonNamedTimeZone extends fc.NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return arrayToLuxon(a, this.name).offset
  }

  timestampToArray(ms: number): number[] {
    return luxonToArray(
      DateTime.fromMillis(ms, {
        zone: this.name
      })
    )
  }

}

fc.registerNamedTimeZoneImpl('luxon', LuxonNamedTimeZone)
fc.globalDefaults.timeZoneImpl = 'luxon'


fc.registerCmdFormatter('luxon', function(cmdStr: string, arg: fc.VerboseFormattingArg) {
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
})
fc.globalDefaults.cmdFormatter = 'luxon'


function luxonToArray(datetime: DateTime): number[] {
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

function arrayToLuxon(arr: number[], timeZone: string, locale?: string): DateTime {
  return DateTime.fromObject({
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

function formatRange(cmd: CmdParts, formatStart: (cmdStr: string) => string, formatEnd: (cmdStr: string) => string, separator: string): string {
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

  return formatStart(cmd.whole) + separator + formatEnd(cmd.whole)
}

import * as momentNs from 'moment'
const moment = momentNs as any // the directly callable function
import { Calendar, Duration, VerboseFormattingArg, createPlugin } from '@fullcalendar/core'


export function toMoment(date: Date, calendar: Calendar): momentNs.Moment {

  if (!(calendar instanceof Calendar)) {
    throw new Error('must supply a Calendar instance')
  }

  return convertToMoment(
    date,
    calendar.dateEnv.timeZone,
    null,
    calendar.dateEnv.locale.codes[0]
  )
}

export function toDuration(fcDuration: Duration): momentNs.Duration {
  return moment.duration(fcDuration) // moment accepts all the props that fc.Duration already has!
}


function formatWithCmdStr(cmdStr: string, arg: VerboseFormattingArg) {
  let cmd = parseCmdStr(cmdStr)

  if (arg.end) {
    let startMom = convertToMoment(
      arg.start.array,
      arg.timeZone,
      arg.start.timeZoneOffset,
      arg.localeCodes[0]
    )
    let endMom = convertToMoment(
      arg.end.array,
      arg.timeZone,
      arg.end.timeZoneOffset,
      arg.localeCodes[0]
    )
    return formatRange(
      cmd,
      createMomentFormatFunc(startMom),
      createMomentFormatFunc(endMom),
      arg.separator
    )
  }

  return convertToMoment(
    arg.date.array,
    arg.timeZone,
    arg.date.timeZoneOffset,
    arg.localeCodes[0]
  ).format(cmd.whole) // TODO: test for this
}

export default createPlugin({
  cmdFormatter: formatWithCmdStr
})


function createMomentFormatFunc(mom: momentNs.Moment) {
  return function(cmdStr) {
    return cmdStr ? mom.format(cmdStr) : '' // because calling with blank string results in ISO8601 :(
  }
}

function convertToMoment(input: any, timeZone: string, timeZoneOffset: number | null, locale: string): momentNs.Moment {
  let mom: momentNs.Moment

  if (timeZone === 'local') {
    mom = moment(input)

  } else if (timeZone === 'UTC') {
    mom = moment.utc(input)

  } else if (moment.tz) {
    mom = moment.tz(input, timeZone)

  } else {
    mom = moment.utc(input)

    if (timeZoneOffset != null) {
      mom.utcOffset(timeZoneOffset)
    }
  }

  mom.locale(locale)

  return mom
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

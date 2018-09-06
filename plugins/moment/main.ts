import * as moment from 'moment'
import * as fc from 'fullcalendar'

(fc as any).Moment = {

  toMoment: function(calendar: fc.Calendar, date: Date): moment.Moment {
    return convertToMoment(
      date,
      calendar.dateEnv.timeZone,
      null,
      calendar.dateEnv.locale.codes[0]
    )
  },

  toDuration: function(fcDuration: fc.Duration): moment.Duration {
    return moment.duration(fcDuration) // momment accepts all the props that fc.Duration already has!
  }

}

fc.registerCmdFormatter('moment', function(cmdStr: string, arg: fc.VerboseFormattingArg) {
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
      startMom.format.bind(startMom),
      endMom.format.bind(endMom),
      arg.separator // TODO: test separator
    )
  }

  return convertToMoment(
    arg.date.array,
    arg.timeZone,
    arg.date.timeZoneOffset,
    arg.localeCodes[0]
  ).format(cmd.whole) // TODO: test for this
})

function convertToMoment(input: any, timeZone: string, timeZoneOffset: number | null, locale: string): moment.Moment {
  let mom: moment.Moment

  if (timeZone === 'local') {
    mom = moment(input)

  } else if (timeZone === 'UTC') {
    mom = moment.utc(input)

  } else if ((moment as any).tz) {
    mom = (moment as any).tz(input, timeZone)

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
  middle: string | null
  tail: string | null
  whole: string
}

function parseCmdStr(cmdStr: string): CmdParts {
  let parts = cmdStr.match(/^(.*?)\{(.*?)\}(.*)$/)

  if (parts) {
    return {
      head: parts[1],
      middle: parts[2],
      tail: parts[3],
      whole: parts[1] + parts[2] + parts[3]
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
  if (cmd.head) {
    let startHead = formatStart(cmd.head)
    let startMiddle = formatStart(cmd.middle)
    let startTail = formatStart(cmd.tail)

    let endHead = formatEnd(cmd.head)
    let endMiddle = formatEnd(cmd.middle)
    let endTail = formatEnd(cmd.tail)

    if (startHead === endHead && startTail === endTail) {
      return startHead +
        (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle) +
        startTail
    }
  }

  return formatStart(cmd.whole) + separator + formatEnd(cmd.whole)
}

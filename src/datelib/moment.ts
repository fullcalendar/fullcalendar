import * as moment from 'moment'
import { VerboseFormattingArg } from './formatting'
import { registerCmdFormatter } from './formatting-cmd'

// TODO: what about range!!??

registerCmdFormatter('moment', function(cmdStr: string, arg: VerboseFormattingArg) {
  let mom: moment.Moment

  if (arg.timeZone === 'local') {
    mom = moment(arg.date.array)
  } else if (arg.timeZone === 'UTC' || !(moment as any).tz) {
    mom = moment.utc(arg.date.array)
  } else {
    mom = (moment as any).tz(arg.date.array, arg.timeZone)
  }

  // what about accepting a forced timezone if .tz isn't present?

  mom.locale(arg.localeCodes[0])

  return mom.format(cmdStr)
})

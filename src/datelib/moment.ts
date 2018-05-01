import * as moment from 'moment'
import { registerCmdStrProcessor } from './formatting'

registerCmdStrProcessor('moment', function(cmdStr: string, marker, params) {
  let mom: moment.Moment
  let arr = params.calendarSystem.markerToArray(marker)

  if (params.timeZone === 'local') {
    mom = moment(arr)
  } else if (params.timeZone === 'UTC' || !(moment as any).tz) {
    mom = moment.utc(arr)
  } else {
    mom = (moment as any).tz(arr, params.timeZone)
  }

  mom.locale(params.locale)

  return mom.format(cmdStr)
})

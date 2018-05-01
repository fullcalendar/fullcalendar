import * as moment from 'moment'
import 'moment-timezone'
import { registerNamedTimeZoneOffsetGenerator } from './timezone'

registerNamedTimeZoneOffsetGenerator('moment-timezone', function(timeZoneName: string, array: number[]) {
  // TODO: need to return ms!!!
  return -(moment as any).tz(array, timeZoneName).utcOffset() // need negative!
})

import * as momentNs from 'moment'
const moment = momentNs as any // the directly callable function

// can't simply import 'moment-timezone' because it attempts to load a JSON file,
// which the end-programmer might not have a loader setup for.
// the file we are importing is pre-built to have the lib + timezone data.
import 'moment-timezone/builds/moment-timezone-with-data'

import { NamedTimeZoneImpl, createPlugin } from '@fullcalendar/core'


class MomentNamedTimeZone extends NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return moment.tz(a, this.timeZoneName).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return moment.tz(ms, this.timeZoneName).toArray()
  }

}

export default createPlugin({
  namedTimeZonedImpl: MomentNamedTimeZone
})

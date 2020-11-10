import moment from 'moment'
import 'moment-timezone'
import { NamedTimeZoneImpl, createPlugin } from '@fullcalendar/common'

class MomentNamedTimeZone extends NamedTimeZoneImpl {
  offsetForArray(a: number[]): number {
    return (moment as any).tz(a, this.timeZoneName).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return (moment as any).tz(ms, this.timeZoneName).toArray()
  }
}

export default createPlugin({
  namedTimeZonedImpl: MomentNamedTimeZone,
})

import moment from 'moment-timezone'
import { NamedTimeZoneImpl } from '@fullcalendar/core/internal'

export class MomentNamedTimeZone extends NamedTimeZoneImpl {
  offsetForArray(a: number[]): number {
    return moment.tz(a, this.timeZoneName).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return moment.tz(ms, this.timeZoneName).toArray()
  }
}

import * as moment from 'moment'
import 'moment-timezone'
import { NamedTimeZoneImpl, registerNamedTimeZoneImpl } from 'fullcalendar'


class MomentNamedTimeZone extends NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return (moment as any).tz(a, this.name).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return (moment as any).tz(ms, this.name).toArray()
  }

}


registerNamedTimeZoneImpl('moment-timezone', MomentNamedTimeZone)

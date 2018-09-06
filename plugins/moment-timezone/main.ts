import * as moment from 'moment'
import 'moment-timezone'
import { NamedTimeZoneImpl, registerNamedTimeZoneImpl } from 'fullcalendar'


class MomentNamedTimeZone extends NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    // use negative to convert the "real" offset to the "inverse" offset,
    // which is what builtin JS objects return with Date::getTimezoneOffset
    return -(moment as any).tz(a, this.name).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return (moment as any).tz(ms, this.name).toArray()
  }

}


registerNamedTimeZoneImpl('moment-timezone', MomentNamedTimeZone)

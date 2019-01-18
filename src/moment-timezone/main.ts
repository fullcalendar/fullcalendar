import moment from 'moment'
// import 'moment-timezone' // rollup includes weird require() markup
import { NamedTimeZoneImpl, registerNamedTimeZoneImpl, globalDefaults } from 'fullcalendar'


class MomentNamedTimeZone extends NamedTimeZoneImpl {

  offsetForArray(a: number[]): number {
    return (moment as any).tz(a, this.name).utcOffset()
  }

  timestampToArray(ms: number): number[] {
    return (moment as any).tz(ms, this.name).toArray()
  }

}


registerNamedTimeZoneImpl('moment-timezone', MomentNamedTimeZone)
globalDefaults.timeZoneImpl = 'moment-timezone'

export default {
  warning: 'TODO: convert fullcalendar-moment-timezone to real plugin. will still work though.'
}

import * as $ from 'jquery'
import * as moment from 'moment'
import EventDef from './EventDef'
import EventInstance from './EventInstance'
import EventDateProfile from './EventDateProfile'


export default class RecurringEventDef extends EventDef {

  startTime: any // duration
  endTime: any // duration, or null
  dowHash: any // object hash, or null


  isAllDay() {
    return !this.startTime && !this.endTime
  }


  buildInstances(unzonedRange) {
    let calendar = this.source.calendar
    let unzonedDate = unzonedRange.getStart()
    let unzonedEnd = unzonedRange.getEnd()
    let zonedDayStart
    let instanceStart
    let instanceEnd
    let instances = []

    while (unzonedDate.isBefore(unzonedEnd)) {

      // if everyday, or this particular day-of-week
      if (!this.dowHash || this.dowHash[unzonedDate.day()]) {

        zonedDayStart = calendar.applyTimezone(unzonedDate)
        instanceStart = zonedDayStart.clone()
        instanceEnd = null

        if (this.startTime) {
          instanceStart.time(this.startTime)
        } else {
          instanceStart.stripTime()
        }

        if (this.endTime) {
          instanceEnd = zonedDayStart.clone().time(this.endTime)
        }

        instances.push(
          new EventInstance(
            this, // definition
            new EventDateProfile(instanceStart, instanceEnd, calendar)
          )
        )
      }

      unzonedDate.add(1, 'days')
    }

    return instances
  }


  setDow(dowNumbers) {

    if (!this.dowHash) {
      this.dowHash = {}
    }

    for (let i = 0; i < dowNumbers.length; i++) {
      this.dowHash[dowNumbers[i]] = true
    }
  }


  clone() {
    let def = super.clone()

    if (def.startTime) {
      def.startTime = moment.duration(this.startTime)
    }

    if (def.endTime) {
      def.endTime = moment.duration(this.endTime)
    }

    if (this.dowHash) {
      def.dowHash = $.extend({}, this.dowHash)
    }

    return def
  }

}


/*
HACK to work with TypeScript mixins
NOTE: if super-method fails, should still attempt to apply
*/
RecurringEventDef.prototype.applyProps = function(rawProps) {
  let superSuccess = EventDef.prototype.applyProps.call(this, rawProps)

  if (rawProps.start) {
    this.startTime = moment.duration(rawProps.start)
  }

  if (rawProps.end) {
    this.endTime = moment.duration(rawProps.end)
  }

  if (rawProps.dow) {
    this.setDow(rawProps.dow)
  }

  return superSuccess
}


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


RecurringEventDef.defineStandardProps({ // false = manually process
  start: false,
  end: false,
  dow: false
})

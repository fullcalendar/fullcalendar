import { assignTo } from '../../util/object'
import EventDef from './EventDef'
import EventInstance from './EventInstance'
import EventDateProfile from './EventDateProfile'
import { createDuration, Duration } from '../../datelib/duration'
import { DateMarker, startOfDay } from '../../datelib/marker'

const ONE_DAY = createDuration({ days: 1 })

export default class RecurringEventDef extends EventDef {

  startTime: Duration // duration
  endTime: Duration // duration, or null
  dowHash: any // object hash, or null


  isAllDay() {
    return !this.startTime && !this.endTime
  }


  buildInstances(unzonedRange) {
    let calendar = this.source.calendar
    const dateEnv = calendar.dateEnv
    let dateMarker: DateMarker = startOfDay(unzonedRange.start)
    let endMarker: DateMarker = unzonedRange.end
    let instanceStart: DateMarker
    let instanceEnd: DateMarker
    let instances = []

    while (dateMarker < endMarker) {

      // if everyday, or this particular day-of-week
      if (!this.dowHash || this.dowHash[dateMarker.getUTCDay()]) {

        if (this.startTime) {
          instanceStart = dateEnv.add(dateMarker, this.startTime)
        } else {
          instanceStart = null
        }

        if (this.endTime) {
          instanceEnd = dateEnv.add(dateMarker, this.endTime)
        } else {
          instanceEnd = null
        }

        instances.push(
          new EventInstance(
            this, // definition
            new EventDateProfile(instanceStart, instanceEnd, !(this.startTime || this.endTime), calendar)
          )
        )
      }

      dateMarker = dateEnv.add(dateMarker, ONE_DAY) // wish we didnt have to recreate each time
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
      def.startTime = createDuration(this.startTime)
    }

    if (def.endTime) {
      def.endTime = createDuration(this.endTime)
    }

    if (this.dowHash) {
      def.dowHash = assignTo({}, this.dowHash)
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
    this.startTime = createDuration(rawProps.start)
  }

  if (rawProps.end) {
    this.endTime = createDuration(rawProps.end)
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

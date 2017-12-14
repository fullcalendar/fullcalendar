import UnzonedRange from '../UnzonedRange'
import { eventInstanceToEventRange, eventInstanceToUnzonedRange } from './util'
import EventRange from './EventRange'

/*
It's expected that there will be at least one EventInstance,
OR that an explicitEventDef is assigned.
*/
export default class EventInstanceGroup {

  eventInstances: any
  explicitEventDef: any // optional


  constructor(eventInstances?) {
    this.eventInstances = eventInstances || []
  }


  getAllEventRanges(constraintRange) {
    if (constraintRange) {
      return this.sliceNormalRenderRanges(constraintRange)
    } else {
      return this.eventInstances.map(eventInstanceToEventRange)
    }
  }


  sliceRenderRanges(constraintRange) {
    if (this.isInverse()) {
      return this.sliceInverseRenderRanges(constraintRange)
    } else {
      return this.sliceNormalRenderRanges(constraintRange)
    }
  }


  sliceNormalRenderRanges(constraintRange) {
    let eventInstances = this.eventInstances
    let i
    let eventInstance
    let slicedRange
    let slicedEventRanges = []

    for (i = 0; i < eventInstances.length; i++) {
      eventInstance = eventInstances[i]

      slicedRange = eventInstance.dateProfile.unzonedRange.intersect(constraintRange)

      if (slicedRange) {
        slicedEventRanges.push(
          new EventRange(
            slicedRange,
            eventInstance.def,
            eventInstance
          )
        )
      }
    }

    return slicedEventRanges
  }


  sliceInverseRenderRanges(constraintRange) {
    let unzonedRanges = this.eventInstances.map(eventInstanceToUnzonedRange)
    let ownerDef = this.getEventDef()

    unzonedRanges = UnzonedRange.invertRanges(unzonedRanges, constraintRange)

    return unzonedRanges.map(function(unzonedRange) {
      return new EventRange(unzonedRange, ownerDef) // don't give an EventInstance
    })
  }


  isInverse() {
    return this.getEventDef().hasInverseRendering()
  }


  getEventDef() {
    return this.explicitEventDef || this.eventInstances[0].def
  }

}

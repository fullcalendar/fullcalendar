import EventRange from './EventRange'
import EventFootprint from './EventFootprint'
import ComponentFootprint from '../ComponentFootprint'


export function eventDefsToEventInstances(eventDefs, unzonedRange) {
  let eventInstances = []
  let i

  for (i = 0; i < eventDefs.length; i++) {
    eventInstances.push.apply(eventInstances, // append
      eventDefs[i].buildInstances(unzonedRange)
    )
  }

  return eventInstances
}


export function eventInstanceToEventRange(eventInstance) {
  return new EventRange(
    eventInstance.dateProfile.unzonedRange,
    eventInstance.def,
    eventInstance
  )
}


export function eventRangeToEventFootprint(eventRange) {
  return new EventFootprint(
    new ComponentFootprint(
      eventRange.unzonedRange,
      eventRange.eventDef.isAllDay()
    ),
    eventRange.eventDef,
    eventRange.eventInstance // might not exist
  )
}


export function eventInstanceToUnzonedRange(eventInstance) {
  return eventInstance.dateProfile.unzonedRange
}


export function eventFootprintToComponentFootprint(eventFootprint) {
  return eventFootprint.componentFootprint
}

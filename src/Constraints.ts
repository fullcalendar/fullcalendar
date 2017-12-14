import UnzonedRange from './models/UnzonedRange'
import ComponentFootprint from './models/ComponentFootprint'
import EventFootprint from './models/event/EventFootprint'
import EventDefParser from './models/event/EventDefParser'
import EventSource from './models/event-source/EventSource'
import {
  eventInstanceToEventRange,
  eventFootprintToComponentFootprint,
  eventRangeToEventFootprint
} from './models/event/util'


export default class Constraints {

  eventManager: any
  _calendar: any // discourage


  constructor(eventManager, _calendar) {
    this.eventManager = eventManager
    this._calendar = _calendar
  }


  opt(name) {
    return this._calendar.opt(name)
  }


  /*
  determines if eventInstanceGroup is allowed,
  in relation to other EVENTS and business hours.
  */
  isEventInstanceGroupAllowed(eventInstanceGroup) {
    let eventDef = eventInstanceGroup.getEventDef()
    let eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges())
    let i

    let peerEventInstances = this.getPeerEventInstances(eventDef)
    let peerEventRanges = peerEventInstances.map(eventInstanceToEventRange)
    let peerEventFootprints = this.eventRangesToEventFootprints(peerEventRanges)

    let constraintVal = eventDef.getConstraint()
    let overlapVal = eventDef.getOverlap()

    let eventAllowFunc = this.opt('eventAllow')

    for (i = 0; i < eventFootprints.length; i++) {
      if (
        !this.isFootprintAllowed(
          eventFootprints[i].componentFootprint,
          peerEventFootprints,
          constraintVal,
          overlapVal,
          eventFootprints[i].eventInstance
        )
      ) {
        return false
      }
    }

    if (eventAllowFunc) {
      for (i = 0; i < eventFootprints.length; i++) {
        if (
          eventAllowFunc(
            eventFootprints[i].componentFootprint.toLegacy(this._calendar),
            eventFootprints[i].getEventLegacy()
          ) === false
        ) {
          return false
        }
      }
    }

    return true
  }


  getPeerEventInstances(eventDef) {
    return this.eventManager.getEventInstancesWithoutId(eventDef.id)
  }


  isSelectionFootprintAllowed(componentFootprint) {
    let peerEventInstances = this.eventManager.getEventInstances()
    let peerEventRanges = peerEventInstances.map(eventInstanceToEventRange)
    let peerEventFootprints = this.eventRangesToEventFootprints(peerEventRanges)

    let selectAllowFunc

    if (
      this.isFootprintAllowed(
        componentFootprint,
        peerEventFootprints,
        this.opt('selectConstraint'),
        this.opt('selectOverlap')
      )
    ) {
      selectAllowFunc = this.opt('selectAllow')

      if (selectAllowFunc) {
        return selectAllowFunc(componentFootprint.toLegacy(this._calendar)) !== false
      } else {
        return true
      }
    }

    return false
  }


  isFootprintAllowed(
    componentFootprint,
    peerEventFootprints,
    constraintVal,
    overlapVal,
    subjectEventInstance? // optional
  ) {
    let constraintFootprints // ComponentFootprint[]
    let overlapEventFootprints // EventFootprint[]

    if (constraintVal != null) {
      constraintFootprints = this.constraintValToFootprints(constraintVal, componentFootprint.isAllDay)

      if (!this.isFootprintWithinConstraints(componentFootprint, constraintFootprints)) {
        return false
      }
    }

    overlapEventFootprints = this.collectOverlapEventFootprints(peerEventFootprints, componentFootprint)

    if (overlapVal === false) {
      if (overlapEventFootprints.length) {
        return false
      }
    } else if (typeof overlapVal === 'function') {
      if (!isOverlapsAllowedByFunc(overlapEventFootprints, overlapVal, subjectEventInstance)) {
        return false
      }
    }

    if (subjectEventInstance) {
      if (!isOverlapEventInstancesAllowed(overlapEventFootprints, subjectEventInstance)) {
        return false
      }
    }

    return true
  }


  // Constraint
  // ------------------------------------------------------------------------------------------------


  isFootprintWithinConstraints(componentFootprint, constraintFootprints) {
    let i

    for (i = 0; i < constraintFootprints.length; i++) {
      if (this.footprintContainsFootprint(constraintFootprints[i], componentFootprint)) {
        return true
      }
    }

    return false
  }


  constraintValToFootprints(constraintVal, isAllDay) {
    let eventInstances

    if (constraintVal === 'businessHours') {
      return this.buildCurrentBusinessFootprints(isAllDay)
    } else if (typeof constraintVal === 'object') {
      eventInstances = this.parseEventDefToInstances(constraintVal) // handles recurring events

      if (!eventInstances) { // invalid input. fallback to parsing footprint directly
        return this.parseFootprints(constraintVal)
      } else {
        return this.eventInstancesToFootprints(eventInstances)
      }
    } else if (constraintVal != null) { // an ID
      eventInstances = this.eventManager.getEventInstancesWithId(constraintVal)

      return this.eventInstancesToFootprints(eventInstances)
    }
  }


  // returns ComponentFootprint[]
  // uses current view's range
  buildCurrentBusinessFootprints(isAllDay) {
    let view = this._calendar.view
    let businessHourGenerator = view.get('businessHourGenerator')
    let unzonedRange = view.dateProfile.activeUnzonedRange
    let eventInstanceGroup = businessHourGenerator.buildEventInstanceGroup(isAllDay, unzonedRange)

    if (eventInstanceGroup) {
      return this.eventInstancesToFootprints(eventInstanceGroup.eventInstances)
    } else {
      return []
    }
  }


  // conversion util
  eventInstancesToFootprints(eventInstances) {
    let eventRanges = eventInstances.map(eventInstanceToEventRange)
    let eventFootprints = this.eventRangesToEventFootprints(eventRanges)

    return eventFootprints.map(eventFootprintToComponentFootprint)
  }


  // Overlap
  // ------------------------------------------------------------------------------------------------


  collectOverlapEventFootprints(peerEventFootprints, targetFootprint) {
    let overlapEventFootprints = []
    let i

    for (i = 0; i < peerEventFootprints.length; i++) {
      if (
        this.footprintsIntersect(
          targetFootprint,
          peerEventFootprints[i].componentFootprint
        )
      ) {
        overlapEventFootprints.push(peerEventFootprints[i])
      }
    }

    return overlapEventFootprints
  }


  // Conversion: eventDefs -> eventInstances -> eventRanges -> eventFootprints -> componentFootprints
  // ------------------------------------------------------------------------------------------------
  // NOTE: this might seem like repetitive code with the Grid class, however, this code is related to
  // constraints whereas the Grid code is related to rendering. Each approach might want to convert
  // eventRanges -> eventFootprints in a different way. Regardless, there are opportunities to make
  // this more DRY.


  /*
  Returns false on invalid input.
  */
  parseEventDefToInstances(eventInput) {
    let eventManager = this.eventManager
    let eventDef = EventDefParser.parse(eventInput, new EventSource(this._calendar))

    if (!eventDef) { // invalid
      return false
    }

    return eventDef.buildInstances(eventManager.currentPeriod.unzonedRange)
  }


  eventRangesToEventFootprints(eventRanges) {
    let i
    let eventFootprints = []

    for (i = 0; i < eventRanges.length; i++) {
      eventFootprints.push.apply( // footprints
        eventFootprints,
        this.eventRangeToEventFootprints(eventRanges[i])
      )
    }

    return eventFootprints
  }


  eventRangeToEventFootprints(eventRange): EventFootprint[] {
    return [ eventRangeToEventFootprint(eventRange) ]
  }


  /*
  Parses footprints directly.
  Very similar to EventDateProfile::parse :(
  */
  parseFootprints(rawInput) {
    let start
    let end

    if (rawInput.start) {
      start = this._calendar.moment(rawInput.start)

      if (!start.isValid()) {
        start = null
      }
    }

    if (rawInput.end) {
      end = this._calendar.moment(rawInput.end)

      if (!end.isValid()) {
        end = null
      }
    }

    return [
      new ComponentFootprint(
        new UnzonedRange(start, end),
        (start && !start.hasTime()) || (end && !end.hasTime()) // isAllDay
      )
    ]
  }


  // Footprint Utils
  // ----------------------------------------------------------------------------------------


  footprintContainsFootprint(outerFootprint, innerFootprint) {
    return outerFootprint.unzonedRange.containsRange(innerFootprint.unzonedRange)
  }


  footprintsIntersect(footprint0, footprint1) {
    return footprint0.unzonedRange.intersectsWith(footprint1.unzonedRange)
  }

}


// optional subjectEventInstance
function isOverlapsAllowedByFunc(overlapEventFootprints, overlapFunc, subjectEventInstance) {
  let i

  for (i = 0; i < overlapEventFootprints.length; i++) {
    if (
      !overlapFunc(
        overlapEventFootprints[i].eventInstance.toLegacy(),
        subjectEventInstance ? subjectEventInstance.toLegacy() : null
      )
    ) {
      return false
    }
  }

  return true
}


function isOverlapEventInstancesAllowed(overlapEventFootprints, subjectEventInstance) {
  let subjectLegacyInstance = subjectEventInstance.toLegacy()
  let i
  let overlapEventInstance
  let overlapEventDef
  let overlapVal

  for (i = 0; i < overlapEventFootprints.length; i++) {
    overlapEventInstance = overlapEventFootprints[i].eventInstance
    overlapEventDef = overlapEventInstance.def

    // don't need to pass in calendar, because don't want to consider global eventOverlap property,
    // because we already considered that earlier in the process.
    overlapVal = overlapEventDef.getOverlap()

    if (overlapVal === false) {
      return false
    } else if (typeof overlapVal === 'function') {
      if (
        !overlapVal(
          overlapEventInstance.toLegacy(),
          subjectLegacyInstance
        )
      ) {
        return false
      }
    }
  }

  return true
}


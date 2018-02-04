import { isArraysEqual } from '../../util'
import EventDateProfile from './EventDateProfile'
import EventDef from './EventDef'
import EventDefDateMutation from './EventDefDateMutation'
import SingleEventDef from './SingleEventDef'


export default class EventDefMutation {

  // won't ever be empty. will be null instead.
  // callers should use setDateMutation for setting.
  dateMutation: any

  // hacks to get updateEvent/createFromRawProps to work.
  // not undo-able and not considered in isEmpty.
  eventDefId: any // standard manual props
  className: any // "
  verbatimStandardProps: any
  miscProps: any


  static createFromRawProps(eventInstance, rawProps, largeUnit) {
    let eventDef = eventInstance.def
    let dateProps: any = {}
    let standardProps: any = {}
    let miscProps: any = {}
    let verbatimStandardProps: any = {}
    let eventDefId = null
    let className = null
    let propName
    let dateProfile
    let dateMutation
    let defMutation

    for (propName in rawProps) {
      if (EventDateProfile.isStandardProp(propName)) {
        dateProps[propName] = rawProps[propName]
      } else if (eventDef.isStandardProp(propName)) {
        standardProps[propName] = rawProps[propName]
      } else if (eventDef.miscProps[propName] !== rawProps[propName]) { // only if changed
        miscProps[propName] = rawProps[propName]
      }
    }

    dateProfile = EventDateProfile.parse(dateProps, eventDef.source)

    if (dateProfile) { // no failure?
      dateMutation = EventDefDateMutation.createFromDiff(
        eventInstance.dateProfile,
        dateProfile,
        largeUnit
      )
    }

    if (standardProps.id !== eventDef.id) {
      eventDefId = standardProps.id // only apply if there's a change
    }

    if (!isArraysEqual(standardProps.className, eventDef.className)) {
      className = standardProps.className // only apply if there's a change
    }

    EventDef.copyVerbatimStandardProps(
      standardProps, // src
      verbatimStandardProps // dest
    )

    defMutation = new EventDefMutation()
    defMutation.eventDefId = eventDefId
    defMutation.className = className
    defMutation.verbatimStandardProps = verbatimStandardProps
    defMutation.miscProps = miscProps

    if (dateMutation) {
      defMutation.dateMutation = dateMutation
    }

    return defMutation
  }


  /*
  eventDef assumed to be a SingleEventDef.
  returns an undo function.
  */
  mutateSingle(eventDef) {
    let origDateProfile

    if (this.dateMutation) {
      origDateProfile = eventDef.dateProfile

      eventDef.dateProfile = this.dateMutation.buildNewDateProfile(
        origDateProfile,
        eventDef.source.calendar
      )
    }

    // can't undo
    // TODO: more DRY with EventDef::applyManualStandardProps
    if (this.eventDefId != null) {
      eventDef.id = EventDef.normalizeId((eventDef.rawId = this.eventDefId))
    }

    // can't undo
    // TODO: more DRY with EventDef::applyManualStandardProps
    if (this.className) {
      eventDef.className = this.className
    }

    // can't undo
    if (this.verbatimStandardProps) {
      SingleEventDef.copyVerbatimStandardProps(
        this.verbatimStandardProps, // src
        eventDef // dest
      )
    }

    // can't undo
    if (this.miscProps) {
      eventDef.applyMiscProps(this.miscProps)
    }

    if (origDateProfile) {
      return function() {
        eventDef.dateProfile = origDateProfile
      }
    } else {
      return function() { /* nothing to undo */ }
    }
  }


  setDateMutation(dateMutation) {
    if (dateMutation && !dateMutation.isEmpty()) {
      this.dateMutation = dateMutation
    } else {
      this.dateMutation = null
    }
  }


  isEmpty() {
    return !this.dateMutation
  }

}

import * as $ from 'jquery'
import { removeMatching } from '../../util'
import Promise from '../../common/Promise'
import EventSource from './EventSource'
import SingleEventDef from '../event/SingleEventDef'


export default class ArrayEventSource extends EventSource {

  rawEventDefs: any // unparsed
  eventDefs: any
  currentTimezone: any


  constructor(calendar) {
    super(calendar)
    this.eventDefs = [] // for if setRawEventDefs is never called
  }


  static parse(rawInput, calendar) {
    let rawProps

    // normalize raw input
    if ($.isArray(rawInput.events)) { // extended form
      rawProps = rawInput
    } else if ($.isArray(rawInput)) { // short form
      rawProps = { events: rawInput }
    }

    if (rawProps) {
      return EventSource.parse.call(this, rawProps, calendar)
    }

    return false
  }


  setRawEventDefs(rawEventDefs) {
    this.rawEventDefs = rawEventDefs
    this.eventDefs = this.parseEventDefs(rawEventDefs)
  }


  fetch(start, end, timezone) {
    let eventDefs = this.eventDefs
    let i

    if (
      this.currentTimezone != null &&
      this.currentTimezone !== timezone
    ) {
      for (i = 0; i < eventDefs.length; i++) {
        if (eventDefs[i] instanceof SingleEventDef) {
          eventDefs[i].rezone()
        }
      }
    }

    this.currentTimezone = timezone

    return Promise.resolve(eventDefs)
  }


  addEventDef(eventDef) {
    this.eventDefs.push(eventDef)
  }


  /*
  eventDefId already normalized to a string
  */
  removeEventDefsById(eventDefId) {
    return removeMatching(this.eventDefs, function(eventDef) {
      return eventDef.id === eventDefId
    })
  }


  removeAllEventDefs() {
    this.eventDefs = []
  }


  getPrimitive() {
    return this.rawEventDefs
  }


  applyManualStandardProps(rawProps) {
    let superSuccess = super.applyManualStandardProps(rawProps)

    this.setRawEventDefs(rawProps.events)

    return superSuccess
  }

}


ArrayEventSource.defineStandardProps({
  events: false // don't automatically transfer
})

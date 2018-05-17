import { removeMatching } from '../../util/array'
import EventSource from './EventSource'


export default class ArrayEventSource extends EventSource {

  rawEventDefs: any // unparsed
  eventDefs: any


  constructor(calendar) {
    super(calendar)
    this.eventDefs = [] // for if setRawEventDefs is never called
  }


  static parse(rawInput, calendar) {
    let rawProps

    // normalize raw input
    if (Array.isArray(rawInput.events)) { // extended form
      rawProps = rawInput
    } else if (Array.isArray(rawInput)) { // short form
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


  fetch(start, end, dateEnv, onSuccess, onFailure) {
    onSuccess(this.eventDefs)
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

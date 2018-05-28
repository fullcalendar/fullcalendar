import { removeMatching } from '../../util/array'
import EventSource from './EventSource'


export default class ArrayEventSource extends EventSource {

  rawEventDefs: any = [] // unparsed. initialized here in the case of no parsing
  dynamicEventDefs: any = [] // parsed
  eventDefs: any
  currentDateEnv: any


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


  fetch(start, end, dateEnv, onSuccess, onFailure) {

    if (
      !this.eventDefs || // first time
      this.currentDateEnv !== dateEnv
    ) {
      this.eventDefs = this.parseEventDefs(this.rawEventDefs).concat(this.dynamicEventDefs)
      this.currentDateEnv = dateEnv
    }

    onSuccess(this.eventDefs)
  }


  addEventDef(eventDef) {
    this.dynamicEventDefs.push(eventDef)

    if (this.eventDefs) {
      this.eventDefs.push(eventDef)
    }
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

    this.rawEventDefs = rawProps.events

    return superSuccess
  }

}


ArrayEventSource.defineStandardProps({
  events: false // don't automatically transfer
})

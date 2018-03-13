import { unpromisify } from '../../util/promise'
import EventSource from './EventSource'


export default class FuncEventSource extends EventSource {

  func: any


  static parse(rawInput, calendar) {
    let rawProps

    // normalize raw input
    if (typeof rawInput.events === 'function') { // extended form
      rawProps = rawInput
    } else if (typeof rawInput === 'function') { // short form
      rawProps = { events: rawInput }
    }

    if (rawProps) {
      return EventSource.parse.call(this, rawProps, calendar)
    }

    return false
  }


  fetch(start, end, timezone, onSuccess, onFailure) {
    this.calendar.pushLoading()

    unpromisify( // allow the func to return a promise
      this.func.bind(this.calendar, start.clone(), end.clone(), timezone),
      (rawEventDefs) => {
        this.calendar.popLoading()
        onSuccess(this.parseEventDefs(rawEventDefs))
      },
      () => {
        this.calendar.popLoading()
        onFailure()
      }
    )
  }


  getPrimitive() {
    return this.func
  }


  applyManualStandardProps(rawProps) {
    let superSuccess = super.applyManualStandardProps(rawProps)

    this.func = rawProps.events

    return superSuccess
  }

}

FuncEventSource.defineStandardProps({
  events: false // don't automatically transfer
})

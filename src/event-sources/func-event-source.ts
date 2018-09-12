import { unpromisify } from '../util/promise'
import { registerEventSourceDef } from '../structs/event-source'
import { EventInput } from '../structs/event'

export type EventSourceFunc = (
  arg: {
    start: Date
    end: Date
    timeZone: string
  },
  successCallback: (events: EventInput[]) => void,
  failureCallback: (errorObj: any) => void
) => any // a promise-like object, or nothing

registerEventSourceDef({

  parseMeta(raw: any): EventSourceFunc {
    if (typeof raw === 'function') { // short form
      return raw
    } else if (typeof raw.events === 'function') {
      return raw.events
    }
    return null
  },

  fetch(arg, success, failure) {
    let dateEnv = arg.calendar.dateEnv
    let func = arg.eventSource.meta as EventSourceFunc

    unpromisify(
      func.bind(null, { // the function returned from parseMeta
        start: dateEnv.toDate(arg.range.start),
        end: dateEnv.toDate(arg.range.end),
        startStr: dateEnv.formatIso(arg.range.start),
        endStr: dateEnv.formatIso(arg.range.end),
        timeZone: dateEnv.timeZone
      }),
      function(rawEvents) { // success
        success({ rawEvents }) // needs an object response
      },
      failure // send errorObj directly to failure callback
    )
  }

})

import { unpromisify } from '../util/promise.js'
import { EventSourceDef } from '../structs/event-source-def.js'
import { EventSourceError } from '../structs/event-source.js'
import { EventInput } from '../structs/event-parse.js'
import { createPlugin } from '../plugin-system.js'
import { buildRangeApiWithTimeZone } from '../structs/date-span.js'

export type EventSourceFunc = (
  arg: {
    start: Date
    end: Date
    startStr: string
    endStr: string
    timeZone: string
  },
  successCallback: (events: EventInput[]) => void,
  failureCallback: (error: EventSourceError) => void
) => (void | PromiseLike<EventInput[]>)

let eventSourceDef: EventSourceDef<EventSourceFunc> = {

  parseMeta(refined) {
    if (typeof refined.events === 'function') {
      return refined.events
    }
    return null
  },

  fetch(arg, success, failure) {
    let { dateEnv } = arg.context
    let func = arg.eventSource.meta

    unpromisify(
      func.bind(null, buildRangeApiWithTimeZone(arg.range, dateEnv)),
      (rawEvents) => { // success
        success({ rawEvents }) // needs an object response
      },
      failure, // send errorObj directly to failure callback
    )
  },

}

export const funcEventSourcePlugin = createPlugin({
  eventSourceDefs: [eventSourceDef],
})

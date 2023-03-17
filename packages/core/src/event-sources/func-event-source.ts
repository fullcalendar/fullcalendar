import { EventSourceDef } from '../structs/event-source-def.js'
import { EventInput } from '../structs/event-parse.js'
import { createPlugin } from '../plugin-system.js'
import { buildRangeApiWithTimeZone } from '../structs/date-span.js'
import { unpromisify } from '../util/promise.js'

export type EventSourceFuncArg = {
  start: Date
  end: Date
  startStr: string
  endStr: string
  timeZone: string
}

export type EventSourceFunc =
  ((
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void,
  ) => void) |
  ((arg: EventSourceFuncArg) => Promise<EventInput[]>)

let eventSourceDef: EventSourceDef<EventSourceFunc> = {

  parseMeta(refined) {
    if (typeof refined.events === 'function') {
      return refined.events
    }
    return null
  },

  fetch(arg, successCallback, errorCallback) {
    const { dateEnv } = arg.context
    const func = arg.eventSource.meta

    unpromisify(
      func.bind(null, buildRangeApiWithTimeZone(arg.range, dateEnv)),
      (rawEvents) => successCallback({ rawEvents }),
      errorCallback,
    )
  },

}

export const funcEventSourcePlugin = createPlugin({
  name: 'func-event-source',
  eventSourceDefs: [eventSourceDef],
})

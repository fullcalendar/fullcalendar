import { EventSourceDef } from '../structs/event-source-def.js'
import { EventInput } from '../structs/event-parse.js'
import { createPlugin } from '../plugin-system.js'
import { buildRangeApiWithTimeZone } from '../structs/date-span.js'

export type EventSourceFuncArg = {
  start: Date
  end: Date
  startStr: string
  endStr: string
  timeZone: string
}

export type EventSourceFunc =
  ((arg: EventSourceFuncArg, callback: (eventInputs: EventInput[]) => void) => void) |
  ((arg: EventSourceFuncArg) => Promise<EventInput[]>)

let eventSourceDef: EventSourceDef<EventSourceFunc> = {

  parseMeta(refined) {
    if (typeof refined.events === 'function') {
      return refined.events
    }
    return null
  },

  fetch(arg) {
    let { dateEnv } = arg.context
    let func = arg.eventSource.meta

    return new Promise<EventInput[]>((resolve) => {
      return func(buildRangeApiWithTimeZone(arg.range, dateEnv), resolve)
    }).then(
      (rawEvents) => ({ rawEvents }),
    )
  },

}

export const funcEventSourcePlugin = createPlugin({
  name: 'func-event-source',
  eventSourceDefs: [eventSourceDef],
})

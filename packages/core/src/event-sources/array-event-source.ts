import { createPlugin } from '../plugin-system.js'
import { EventSourceDef } from '../structs/event-source-def.js'
import { EventInput } from '../structs/event-parse.js'

let eventSourceDef: EventSourceDef<EventInput[]> = {
  ignoreRange: true,

  parseMeta(refined) {
    if (Array.isArray(refined.events)) {
      return refined.events
    }
    return null
  },

  fetch(arg, successCallback) {
    successCallback({
      rawEvents: arg.eventSource.meta,
    })
  },
}

export const arrayEventSourcePlugin = createPlugin({
  name: 'array-event-source',
  eventSourceDefs: [eventSourceDef],
})

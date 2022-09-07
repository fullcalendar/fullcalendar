import { createPlugin } from '../plugin-system'
import { EventSourceDef } from '../structs/event-source-def'
import { EventInput } from '../structs/event-parse'

let eventSourceDef: EventSourceDef<EventInput[]> = {
  ignoreRange: true,

  parseMeta(refined) {
    if (Array.isArray(refined.events)) {
      return refined.events
    }
    return null
  },

  fetch(arg, success) {
    success({
      rawEvents: arg.eventSource.meta,
    })
  },
}

export const arrayEventSourcePlugin = createPlugin({
  eventSourceDefs: [eventSourceDef],
})

import { createPlugin } from '../plugin-system'
import { EventSourceDef } from '../structs/event-source'
import { EventInput } from '../structs/event'

let eventSourceDef: EventSourceDef = {
  ignoreRange: true,

  parseMeta(raw: any): EventInput[] | null {
    if (Array.isArray(raw)) { // short form
      return raw
    } else if (Array.isArray(raw.events)) {
      return raw.events
    }
    return null
  },

  fetch(arg, success) {
    success({
      rawEvents: arg.eventSource.meta as EventInput[]
    })
  }
}

export default createPlugin({
  eventSourceDefs: [ eventSourceDef ]
})

import { registerEventSourceDef } from '../structs/event-source'
import { EventInput } from '../structs/event'

registerEventSourceDef({

  singleFetch: true, // can we please NOT store the raw events internally then???

  parseMeta(raw: any): EventInput[] | null {
    if (Array.isArray(raw)) { // short form
      return raw
    } else if (Array.isArray(raw.events)) {
      return raw.events
    }
    return null
  },

  fetch(arg, success) {
    success(arg.eventSource.meta as EventInput[])
  }

})

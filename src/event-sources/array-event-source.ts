import { registerSourceType } from '../structs/event-source'
import { EventInput } from '../structs/event'

registerSourceType('array', {

  parseMeta(raw: any): EventInput[] {
    if (Array.isArray(raw)) { // short form
      return raw
    } else if (Array.isArray(raw.events)) {
      return raw.events
    }
  },

  fetch(arg, success) {
    success(arg.eventSource.sourceTypeMeta as EventInput[])
  }

})

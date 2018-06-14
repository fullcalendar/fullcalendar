import { registerSourceType } from './event-sources'
import { EventInput } from './event-store'

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

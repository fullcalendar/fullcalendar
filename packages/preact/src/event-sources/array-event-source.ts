import { PluginInput } from '../plugin-system-struct'
import { EventInput } from '../structs/event-parse'
import { EventSourceDef } from '../structs/event-source-def'

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

export const arrayEventSourcePlugin = {
  name: 'array-event-source',
  eventSourceDefs: [eventSourceDef],
} as PluginInput

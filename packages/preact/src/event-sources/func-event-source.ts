import { PluginInput } from '../plugin-system-struct'
import { buildRangeApiWithTimeZone } from '../structs/date-span'
import { EventInput } from '../structs/event-parse'
import { EventSourceDef } from '../structs/event-source-def'
import { unpromisify } from '../util/promise'

export type EventSourceFuncInfo = {
  start: Date
  end: Date
  startStr: string
  endStr: string
  timeZone: string
}

export type EventSourceFunc =
  ((
    info: EventSourceFuncInfo,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void,
  ) => void) |
  ((info: EventSourceFuncInfo) => Promise<EventInput[]>)

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

export const funcEventSourcePlugin = {
  name: 'func-event-source',
  eventSourceDefs: [eventSourceDef],
} as PluginInput

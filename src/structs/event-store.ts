import UnzonedRange from '../models/UnzonedRange'
import { EventInput, EventDef, EventInstance, parseDef, parseDateInfo, createInstance } from './event'
import { expandRecurring } from './recurring-event'
import Calendar from '../Calendar'

// need these?
export type EventInstanceHash = { [instanceId: string]: EventInstance }
export type EventDefHash = { [defId: string]: EventDef }

export interface EventStore {
  defs: EventDefHash
  instances: EventInstanceHash
}

export function addRawEvents(eventStore: EventStore, sourceId: string, fetchRange: UnzonedRange, rawEvents: any, calendar: Calendar) {
  rawEvents.forEach(function(rawEvent: EventInput) {
    let leftoverProps = {}
    let recurringDateInfo = expandRecurring(rawEvent, fetchRange, calendar, leftoverProps)

    if (recurringDateInfo) {
      let def = parseDef(leftoverProps, sourceId, recurringDateInfo.isAllDay, recurringDateInfo.hasEnd)
      eventStore.defs[def.defId] = def

      for (let range of recurringDateInfo.ranges) {
        let instance = createInstance(def.defId, range)
        eventStore.instances[instance.instanceId] = instance
      }

    } else {
      let dateInfo = parseDateInfo(rawEvent, sourceId, calendar, leftoverProps)

      if (dateInfo) {
        let def = parseDef(leftoverProps, sourceId, dateInfo.isAllDay, dateInfo.hasEnd)
        let instance = createInstance(def.defId, dateInfo.range, dateInfo.forcedStartTzo, dateInfo.forcedEndTzo)

        eventStore.defs[def.defId] = def
        eventStore.instances[instance.instanceId] = instance
      }
    }
  })
}

export function createEmptyEventStore(): EventStore {
  return { defs: {}, instances: {} }
}

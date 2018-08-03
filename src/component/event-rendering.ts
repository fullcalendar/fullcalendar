import { EventDef, EventInstance } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges } from '../datelib/date-range'

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance?: EventInstance
  range: DateRange
}


/*
Does not slice ranges via framingRange into new ranges, but instead,
keeps fg event ranges intact but more importantly slices inverse-BG events.
*/
export function sliceEventStore(eventStore: EventStore, framingRange: DateRange) {
  let inverseBgByGroupId: { [groupId: string]: DateRange[] } = {}
  let inverseBgByDefId: { [defId: string]: DateRange[] } = {}
  let defByGroupId: { [groupId: string]: EventDef } = {}
  let renderRanges: EventRenderRange[] = []

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]

    if (def.rendering === 'inverse-background') {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId] = []

        if (!defByGroupId[def.groupId]) {
          defByGroupId[def.groupId] = def
        }
      } else {
        inverseBgByDefId[defId] = []
      }
    }
  }

  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId]
    let def = eventStore.defs[instance.defId]

    if (def.rendering === 'inverse-background') {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId].push(instance.range)
      } else {
        inverseBgByDefId[instance.defId].push(instance.range)
      }
    } else {
      renderRanges.push({
        eventDef: def,
        eventInstance: instance,
        range: instance.range
      })
    }
  }

  for (let groupId in inverseBgByGroupId) {
    let ranges = inverseBgByGroupId[groupId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId]

      renderRanges.push({
        eventDef: def,
        range: invertedRange
      })
    }
  }

  for (let defId in inverseBgByDefId) {
    let ranges = inverseBgByDefId[defId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      renderRanges.push({
        eventDef: eventStore.defs[defId],
        range: invertedRange
      })
    }
  }

  return renderRanges
}

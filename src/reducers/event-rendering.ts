import UnzonedRange from '../models/UnzonedRange'
import { EventStore, EventDef, EventInstance } from './event-store'

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance?: EventInstance
  range: UnzonedRange
}


export function sliceEventStore(eventStore: EventStore, windowRange: UnzonedRange) {
  let inverseBgByGroupId: { [groupId: string]: UnzonedRange[] } = {}
  let inverseBgByDefId: { [defId: string]: UnzonedRange[] } = {}
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
    let invertedRanges = UnzonedRange.invertRanges(ranges, windowRange)

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
    let invertedRanges = UnzonedRange.invertRanges(ranges, windowRange)

    for (let invertedRange of invertedRanges) {
      renderRanges.push({
        eventDef: eventStore.defs[defId],
        range: invertedRange
      })
    }
  }

  return renderRanges
}

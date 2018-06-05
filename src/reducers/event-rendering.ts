import UnzonedRange from '../models/UnzonedRange'
import { EventInstanceHash, EventStore, EventDef, EventInstance } from './event-store'

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance: EventInstance
  range: UnzonedRange
}

export function sliceEventRanges(instances: EventInstanceHash, store: EventStore, sliceRange: UnzonedRange): EventRenderRange[] {
  let groupedInverseBg = {}
  let ungroupedInverseBg: EventInstance[] = []
  let normal: EventInstance[] = []
  let segs: EventRenderRange[] = []

  for (let instanceId in instances) {
    let instance = instances[instanceId]
    let def = store.defs[instance.defId]
    let groupId = def.groupId

    if (def.rendering === 'inverse-background') {
      if (groupId) {
        (groupedInverseBg[groupId] || (groupedInverseBg[groupId] = []))
          .push(instance)
      } else {
        ungroupedInverseBg.push(instance)
      }
    } else {
      normal.push(instance)
    }
  }

  for (let groupId in groupedInverseBg) {
    let inverseBgInstances = groupedInverseBg[groupId]
    let ranges = inverseBgInstances.map(getInstanceRange)
    let invertedRanges = UnzonedRange.invertRanges(ranges, sliceRange)

    for (let range of invertedRanges) {
      segs.push({
        eventDef: store.defs[inverseBgInstances[0].defId],
        eventInstance: inverseBgInstances[0],
        range
      })
    }
  }

  for (let instance of ungroupedInverseBg) {
    let invertedRanges = UnzonedRange.invertRanges([ instance.range ], sliceRange)

    for (let range of invertedRanges) {
      segs.push({
        eventDef: store.defs[instance.defId],
        eventInstance: instance,
        range
      })
    }
  }

  for (let instance of normal) {
    let slicedRange = instance.range.intersect(sliceRange)

    if (slicedRange) {
      segs.push({
        eventDef: store.defs[instance.defId],
        eventInstance: instance,
        range: slicedRange
      })
    }
  }

  return segs
}

function getInstanceRange(eventInstance: EventInstance) {
  return eventInstance.range
}

export function furtherSliceEventSegments(segs: EventRenderRange[], sliceRange: UnzonedRange): EventRenderRange[] {
  let newSegs: EventRenderRange[] = []

  for (let seg of segs) {
    let newRange = seg.range.intersect(sliceRange)

    if (newRange) {
      newSegs.push({
        eventDef: seg.eventDef,
        eventInstance: seg.eventInstance,
        range: newRange
      })
    }
  }

  return newSegs
}

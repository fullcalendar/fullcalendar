import UnzonedRange from '../models/UnzonedRange'
import { EventDef, EventInstance } from './event-store'

export interface EventRenderRange {
  eventDef: EventDef
  eventInstance: EventInstance
  range: UnzonedRange
}


export function sliceEventRanges(origRanges: EventRenderRange[], windowRange: UnzonedRange): EventRenderRange[] {
  let renderRanges: EventRenderRange[] = []
  let inverseBgGroups: { [groupId: string]: EventRenderRange[] } = {}

  for (let origRange of origRanges) {
    let { eventDef, eventInstance } = origRange

    if (eventDef.rendering === 'inverse-background') {
      let groupId = eventDef.groupId

      if (groupId) {
        (inverseBgGroups[groupId] || (inverseBgGroups[groupId] = []))
          .push(origRange)

      } else {
        let invertedRanges = UnzonedRange.invertRanges([ eventInstance.range ], windowRange)

        for (let invertedRange of invertedRanges) {
          renderRanges.push({
            eventDef,
            eventInstance,
            range: invertedRange
          })
        }
      }
    } else {
      let range = eventInstance.range.intersect(windowRange)

      if (range) {
        renderRanges.push({
          eventDef,
          eventInstance,
          range
        })
      }
    }
  }

  for (let groupId in inverseBgGroups) {
    let inverseBgGroup = inverseBgGroups[groupId]
    let { eventDef, eventInstance } = inverseBgGroup[0]
    let origRanges = inverseBgGroup.map(getRange)
    let invertedRanges = UnzonedRange.invertRanges(origRanges, windowRange)

    for (let invertedRange of invertedRanges) {
      renderRanges.push({
        eventDef,
        eventInstance,
        range: invertedRange
      })
    }
  }

  return renderRanges
}


function getRange(eventRange: EventRenderRange) {
  return eventRange.range
}

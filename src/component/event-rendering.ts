import { EventDef, EventTuple } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges, intersectRanges } from '../datelib/date-range'
import { Duration } from '../datelib/duration'
import { computeVisibleDayRange } from '../util/misc'
import { Seg } from './DateComponent'
import View from '../View'
import EventApi from '../api/EventApi'
import { EventUi, EventUiHash } from './event-ui'

export interface EventRenderRange extends EventTuple {
  ui: EventUi
  range: DateRange
  isStart: boolean
  isEnd: boolean
}

/*
Specifying nextDayThreshold signals that all-day ranges should be sliced.
*/
export function sliceEventStore(eventStore: EventStore, eventUis: EventUiHash, framingRange: DateRange, nextDayThreshold?: Duration) {
  let inverseBgByGroupId: { [groupId: string]: DateRange[] } = {}
  let inverseBgByDefId: { [defId: string]: DateRange[] } = {}
  let defByGroupId: { [groupId: string]: EventDef } = {}
  let bgRanges: EventRenderRange[] = []
  let fgRanges: EventRenderRange[] = []

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
    let ui = eventUis[def.defId]
    let origRange = instance.range
    let slicedRange = intersectRanges(origRange, framingRange)
    let visibleRange

    if (slicedRange) {

      visibleRange = (!def.allDay && nextDayThreshold) ?
        computeVisibleDayRange(slicedRange, nextDayThreshold) :
        slicedRange

      if (def.rendering === 'inverse-background') {
        if (def.groupId) {
          inverseBgByGroupId[def.groupId].push(visibleRange)
        } else {
          inverseBgByDefId[instance.defId].push(visibleRange)
        }
      } else {
        (def.rendering === 'background' ? bgRanges : fgRanges).push({
          def,
          ui,
          instance,
          range: visibleRange,
          isStart: origRange.start.valueOf() === slicedRange.start.valueOf(),
          isEnd: origRange.end.valueOf() === slicedRange.end.valueOf()
        })
      }
    }
  }

  for (let groupId in inverseBgByGroupId) { // BY GROUP
    let ranges = inverseBgByGroupId[groupId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId]
      let ui = eventUis[def.defId]

      bgRanges.push({
        def,
        ui,
        instance: null,
        range: invertedRange,
        isStart: false,
        isEnd: false
      })
    }
  }

  for (let defId in inverseBgByDefId) {
    let ranges = inverseBgByDefId[defId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      bgRanges.push({
        def: eventStore.defs[defId],
        ui: eventUis[defId],
        instance: null,
        range: invertedRange,
        isStart: false,
        isEnd: false
      })
    }
  }

  return { bg: bgRanges, fg: fgRanges }
}

export function hasBgRendering(def: EventDef) {
  return def.rendering === 'background' || def.rendering === 'inverse-background'
}

export function filterSegsViaEls(view: View, segs: Seg[], isMirror) {

  if (view.hasPublicHandlers('eventRender')) {
    segs = segs.filter(function(seg) {
      let custom = view.publiclyTrigger('eventRender', [
        {
          event: new EventApi(
            view.calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          isMirror,
          isStart: seg.isStart,
          isEnd: seg.isEnd,
          // TODO: include seg.range once all components consistently generate it
          el: seg.el,
          view
        }
      ])

      if (custom === false) { // means don't render at all
        return false
      } else if (custom && custom !== true) {
        seg.el = custom
      }

      return true
    })
  }

  for (let seg of segs) {
    setElSeg(seg.el, seg)
  }

  return segs
}

function setElSeg(el: HTMLElement, seg: Seg) {
  (el as any).fcSeg = seg
}

export function getElSeg(el: HTMLElement): Seg | null {
  return (el as any).fcSeg || null
}

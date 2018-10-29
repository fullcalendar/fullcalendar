import { EventDef, EventDefHash, EventTuple } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges, intersectRanges } from '../datelib/date-range'
import { EventSourceHash } from '../structs/event-source'
import { mapHash } from '../util/object'
import { parseClassName } from '../util/html'
import { Duration } from '../datelib/duration'
import { computeVisibleDayRange } from '../util/misc'
import { Seg } from './DateComponent'
import View from '../View'
import EventApi from '../api/EventApi'

export interface EventUi {
  startEditable: boolean
  durationEditable: boolean
  backgroundColor: string
  borderColor: string
  textColor: string,
  rendering: string,
  classNames: string[]
}

export type EventUiHash = { [defId: string]: EventUi }

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
  let renderRanges: EventRenderRange[] = []

  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId]
    let ui = eventUis[defId]

    if (ui.rendering === 'inverse-background') {
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

      if (ui.rendering === 'inverse-background') {
        if (def.groupId) {
          inverseBgByGroupId[def.groupId].push(visibleRange)
        } else {
          inverseBgByDefId[instance.defId].push(visibleRange)
        }
      } else {
        renderRanges.push({
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

  for (let groupId in inverseBgByGroupId) {
    let ranges = inverseBgByGroupId[groupId]
    let invertedRanges = invertRanges(ranges, framingRange)

    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId]
      let ui = eventUis[def.defId]

      renderRanges.push({
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
      renderRanges.push({
        def: eventStore.defs[defId],
        ui: eventUis[defId],
        instance: null,
        range: invertedRange,
        isStart: false,
        isEnd: false
      })
    }
  }

  return renderRanges
}

export function hasBgRendering(ui: EventUi) {
  return ui.rendering === 'background' || ui.rendering === 'inverse-background'
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


// UI Props
// ----------------------------------------------------------------------------------------------------

export function computeEventDefUis(eventDefs: EventDefHash, eventSources: EventSourceHash, options) {
  return mapHash(eventDefs, function(eventDef) {
    return computeEventDefUi(eventDef, eventSources, options)
  })
}

export function computeEventDefUi(eventDef: EventDef, eventSources: EventSourceHash, options) {

  // lowest to highest priority
  // TODO: hook for resources, using refineScopedUi
  let refinedHashes = [
    refineScopedUi(options),
    refineUnscopedUi(eventSources[eventDef.sourceId] || {}),
    refineUnscopedUi(eventDef)
  ]

  return refinedHashes.reduce(combineUis)
}

// has word "event" in prop names
// FYI: startEditable/durationEditable might end up being null
function refineScopedUi(input): EventUi {
  return {
    startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
    durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
    backgroundColor: input.eventBackgroundColor || input.eventColor || '',
    borderColor: input.eventBorderColor || input.eventColor || '',
    textColor: input.eventTextColor || '',
    rendering: input.eventRendering || '',
    classNames: parseClassName(input.eventClassNames || input.eventClassName) // probs already parsed
  }
}

// does NOT have the word "event" in prop names
// FYI: startEditable/durationEditable might end up being null
function refineUnscopedUi(input): EventUi {
  return {
    startEditable: (input.startEditable != null) ? input.startEditable : input.editable,
    durationEditable: (input.durationEditable != null) ? input.durationEditable : input.editable,
    backgroundColor: input.backgroundColor || input.color || '',
    borderColor: input.borderColor || input.color || '',
    textColor: input.textColor || '',
    rendering: input.rendering || '',
    classNames: parseClassName(input.classNames || input.className) // probs already parsed
  }
}

function combineUis(hash0, hash1): EventUi { // hash1 has higher precedence
  return {
    startEditable: (hash1.startEditable != null) ? hash1.startEditable : hash0.startEditable,
    durationEditable: (hash1.durationEditable != null) ? hash1.durationEditable : hash0.durationEditable,
    backgroundColor: hash1.backgroundColor || hash0.backgroundColor,
    borderColor: hash1.borderColor || hash0.borderColor,
    textColor: hash1.textColor || hash0.textColor,
    rendering: hash1.rendering || hash0.rendering,
    classNames: hash0.classNames.concat(hash1.classNames)
  }
}

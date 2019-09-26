import { EventDef, EventTuple, EventDefHash } from '../structs/event'
import { EventStore } from '../structs/event-store'
import { DateRange, invertRanges, intersectRanges } from '../datelib/date-range'
import { Duration } from '../datelib/duration'
import { computeVisibleDayRange } from '../util/misc'
import { Seg } from './DateComponent'
import EventApi from '../api/EventApi'
import { EventUi, EventUiHash, combineEventUis } from './event-ui'
import { mapHash } from '../util/object'
import { ComponentContext } from './Component'

export interface EventRenderRange extends EventTuple {
  ui: EventUi
  range: DateRange
  isStart: boolean
  isEnd: boolean
}

/*
Specifying nextDayThreshold signals that all-day ranges should be sliced.
*/
export function sliceEventStore(eventStore: EventStore, eventUiBases: EventUiHash, framingRange: DateRange, nextDayThreshold?: Duration) {
  let inverseBgByGroupId: { [groupId: string]: DateRange[] } = {}
  let inverseBgByDefId: { [defId: string]: DateRange[] } = {}
  let defByGroupId: { [groupId: string]: EventDef } = {}
  let bgRanges: EventRenderRange[] = []
  let fgRanges: EventRenderRange[] = []
  let eventUis = compileEventUis(eventStore.defs, eventUiBases)

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

    let normalRange = (!def.allDay && nextDayThreshold) ?
      computeVisibleDayRange(origRange, nextDayThreshold) :
      origRange

    let slicedRange = intersectRanges(normalRange, framingRange)

    if (slicedRange) {
      if (def.rendering === 'inverse-background') {
        if (def.groupId) {
          inverseBgByGroupId[def.groupId].push(slicedRange)
        } else {
          inverseBgByDefId[instance.defId].push(slicedRange)
        }
      } else {
        (def.rendering === 'background' ? bgRanges : fgRanges).push({
          def,
          ui,
          instance,
          range: slicedRange,
          isStart: normalRange.start && normalRange.start.valueOf() === slicedRange.start.valueOf(),
          isEnd: normalRange.end && normalRange.end.valueOf() === slicedRange.end.valueOf()
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

export function filterSegsViaEls(context: ComponentContext, segs: Seg[], isMirror: boolean) {
  let { calendar, view } = context

  if (calendar.hasPublicHandlers('eventRender')) {
    segs = segs.filter(function(seg) {
      let custom = calendar.publiclyTrigger('eventRender', [
        {
          event: new EventApi(
            calendar,
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


// event ui computation

export function compileEventUis(eventDefs: EventDefHash, eventUiBases: EventUiHash) {
  return mapHash(eventDefs, function(eventDef: EventDef) {
    return compileEventUi(eventDef, eventUiBases)
  })
}

export function compileEventUi(eventDef: EventDef, eventUiBases: EventUiHash) {
  let uis = []

  if (eventUiBases['']) {
    uis.push(eventUiBases[''])
  }

  if (eventUiBases[eventDef.defId]) {
    uis.push(eventUiBases[eventDef.defId])
  }

  uis.push(eventDef.ui)

  return combineEventUis(uis)
}


// triggers

export function triggerRenderedSegs(context: ComponentContext, segs: Seg[], isMirrors: boolean) {
  let { calendar, view } = context

  if (calendar.hasPublicHandlers('eventPositioned')) {

    for (let seg of segs) {
      calendar.publiclyTriggerAfterSizing('eventPositioned', [
        {
          event: new EventApi(
            calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          isMirror: isMirrors,
          isStart: seg.isStart,
          isEnd: seg.isEnd,
          el: seg.el,
          view
        }
      ])
    }
  }

  if (!calendar.state.loadingLevel) { // avoid initial empty state while pending
    calendar.afterSizingTriggers._eventsPositioned = [ null ] // fire once
  }
}

export function triggerWillRemoveSegs(context: ComponentContext, segs: Seg[], isMirrors: boolean) {
  let { calendar, view } = context

  for (let seg of segs) {
    calendar.trigger('eventElRemove', seg.el)
  }

  if (calendar.hasPublicHandlers('eventDestroy')) {

    for (let seg of segs) {
      calendar.publiclyTrigger('eventDestroy', [
        {
          event: new EventApi(
            calendar,
            seg.eventRange.def,
            seg.eventRange.instance
          ),
          isMirror: isMirrors,
          el: seg.el,
          view
        }
      ])
    }
  }
}


// is-interactable

export function computeEventDraggable(context: ComponentContext, eventDef: EventDef, eventUi: EventUi) {
  let { calendar, view } = context
  let transformers = calendar.pluginSystem.hooks.isDraggableTransformers
  let val = eventUi.startEditable

  for (let transformer of transformers) {
    val = transformer(val, eventDef, eventUi, view)
  }

  return val
}


export function computeEventStartResizable(context: ComponentContext, eventDef: EventDef, eventUi: EventUi) {
  return eventUi.durationEditable && context.options.eventResizableFromStart
}


export function computeEventEndResizable(context: ComponentContext, eventDef: EventDef, eventUi: EventUi) {
  return eventUi.durationEditable
}

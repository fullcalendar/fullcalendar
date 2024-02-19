import { EventDef, EventDefHash } from '../structs/event-def.js'
import { EventTuple } from '../structs/event-parse.js'
import { EventStore } from '../structs/event-store.js'
import { DateRange, invertRanges, intersectRanges, rangeContainsMarker } from '../datelib/date-range.js'
import { Duration } from '../datelib/duration.js'
import { compareByFieldSpecs, OrderSpec } from '../util/misc.js'
import { computeVisibleDayRange } from '../util/date.js'
import { Seg } from './DateComponent.js'
import { EventImpl } from '../api/EventImpl.js'
import { EventUi, EventUiHash, combineEventUis } from './event-ui.js'
import { mapHash } from '../util/object.js'
import { ViewContext } from '../ViewContext.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { addMs, DateMarker, startOfDay } from '../datelib/marker.js'
import { ViewApi } from '../api/ViewApi.js'
import { MountArg } from '../common/render-hook.js'
import { createAriaKeyboardAttrs } from '../util/dom-event.js'

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
    let ui = eventUis[def.defId]

    if (ui.display === 'inverse-background') {
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
      if (ui.display === 'inverse-background') {
        if (def.groupId) {
          inverseBgByGroupId[def.groupId].push(slicedRange)
        } else {
          inverseBgByDefId[instance.defId].push(slicedRange)
        }
      } else if (ui.display !== 'none') {
        (ui.display === 'background' ? bgRanges : fgRanges).push({
          def,
          ui,
          instance,
          range: slicedRange,
          isStart: normalRange.start && normalRange.start.valueOf() === slicedRange.start.valueOf(),
          isEnd: normalRange.end && normalRange.end.valueOf() === slicedRange.end.valueOf(),
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
        isEnd: false,
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
        isEnd: false,
      })
    }
  }

  return { bg: bgRanges, fg: fgRanges }
}

export function hasBgRendering(def: EventDef) {
  return def.ui.display === 'background' || def.ui.display === 'inverse-background'
}

export function setElSeg(el: HTMLElement, seg: Seg) {
  (el as any).fcSeg = seg
}

export function getElSeg(el: HTMLElement): Seg | null {
  return (el as any).fcSeg ||
    (el.parentNode as any).fcSeg || // for the harness
    null
}

// event ui computation

export function compileEventUis(eventDefs: EventDefHash, eventUiBases: EventUiHash) {
  return mapHash(eventDefs, (eventDef: EventDef) => compileEventUi(eventDef, eventUiBases))
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

export function sortEventSegs(segs, eventOrderSpecs: OrderSpec<EventImpl>[]): Seg[] {
  let objs = segs.map(buildSegCompareObj)

  objs.sort((obj0, obj1) => compareByFieldSpecs(obj0, obj1, eventOrderSpecs))

  return objs.map((c) => c._seg)
}

// returns a object with all primitive props that can be compared
export function buildSegCompareObj(seg: Seg) {
  let { eventRange } = seg
  let eventDef = eventRange.def
  let range = eventRange.instance ? eventRange.instance.range : eventRange.range
  let start = range.start ? range.start.valueOf() : 0 // TODO: better support for open-range events
  let end = range.end ? range.end.valueOf() : 0 // "

  return {
    ...eventDef.extendedProps,
    ...eventDef,
    id: eventDef.publicId,
    start,
    end,
    duration: end - start,
    allDay: Number(eventDef.allDay),
    _seg: seg, // for later retrieval
  }
}

// other stuff

export interface EventContentArg { // for *Content handlers
  event: EventImpl
  timeText: string
  backgroundColor: string // TODO: add other EventUi props?
  borderColor: string //
  textColor: string //
  isDraggable: boolean
  isStartResizable: boolean
  isEndResizable: boolean
  isMirror: boolean
  isStart: boolean
  isEnd: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  isSelected: boolean
  isDragging: boolean
  isResizing: boolean
  view: ViewApi // specifically for the API
}

export type EventMountArg = MountArg<EventContentArg>

export function computeSegDraggable(seg: Seg, context: ViewContext) {
  let { pluginHooks } = context
  let transformers = pluginHooks.isDraggableTransformers
  let { def, ui } = seg.eventRange
  let val = ui.startEditable

  for (let transformer of transformers) {
    val = transformer(val, def, ui, context)
  }

  return val
}

export function computeSegStartResizable(seg: Seg, context: ViewContext) {
  return seg.isStart && seg.eventRange.ui.durationEditable && context.options.eventResizableFromStart
}

export function computeSegEndResizable(seg: Seg, context: ViewContext) {
  return seg.isEnd && seg.eventRange.ui.durationEditable
}

export function buildSegTimeText(
  seg: Seg,
  timeFormat: DateFormatter,
  context: ViewContext,
  defaultDisplayEventTime?: boolean, // defaults to true
  defaultDisplayEventEnd?: boolean, // defaults to true
  startOverride?: DateMarker,
  endOverride?: DateMarker,
) {
  let { dateEnv, options } = context
  let { displayEventTime, displayEventEnd } = options
  let eventDef = seg.eventRange.def
  let eventInstance = seg.eventRange.instance

  if (displayEventTime == null) { displayEventTime = defaultDisplayEventTime !== false }
  if (displayEventEnd == null) { displayEventEnd = defaultDisplayEventEnd !== false }

  let wholeEventStart = eventInstance.range.start
  let wholeEventEnd = eventInstance.range.end
  let segStart = startOverride || seg.start || seg.eventRange.range.start
  let segEnd = endOverride || seg.end || seg.eventRange.range.end
  let isStartDay = startOfDay(wholeEventStart).valueOf() === startOfDay(segStart).valueOf()
  let isEndDay = startOfDay(addMs(wholeEventEnd, -1)).valueOf() === startOfDay(addMs(segEnd, -1)).valueOf()

  if (displayEventTime && !eventDef.allDay && (isStartDay || isEndDay)) {
    segStart = isStartDay ? wholeEventStart : segStart
    segEnd = isEndDay ? wholeEventEnd : segEnd

    if (displayEventEnd && eventDef.hasEnd) {
      return dateEnv.formatRange(segStart, segEnd, timeFormat, {
        forcedStartTzo: startOverride ? null : eventInstance.forcedStartTzo, // nooooooooooooo, give tzo if same date
        forcedEndTzo: endOverride ? null : eventInstance.forcedEndTzo,
      })
    }
    return dateEnv.format(segStart, timeFormat, {
      forcedTzo: startOverride ? null : eventInstance.forcedStartTzo, // nooooo, same
    })
  }

  return ''
}

export function getSegMeta(seg: Seg, todayRange: DateRange, nowDate?: DateMarker) { // TODO: make arg order consistent with date util
  let segRange = seg.eventRange.range

  return {
    isPast: segRange.end <= (nowDate || todayRange.start),
    isFuture: segRange.start >= (nowDate || todayRange.end),
    isToday: todayRange && rangeContainsMarker(todayRange, segRange.start),
  }
}

export function getEventClassNames(props: EventContentArg) { // weird that we use this interface, but convenient
  let classNames: string[] = ['fc-event']

  if (props.isMirror) {
    classNames.push('fc-event-mirror')
  }

  if (props.isDraggable) {
    classNames.push('fc-event-draggable')
  }

  if (props.isStartResizable || props.isEndResizable) {
    classNames.push('fc-event-resizable')
  }

  if (props.isDragging) {
    classNames.push('fc-event-dragging')
  }

  if (props.isResizing) {
    classNames.push('fc-event-resizing')
  }

  if (props.isSelected) {
    classNames.push('fc-event-selected')
  }

  if (props.isStart) {
    classNames.push('fc-event-start')
  }

  if (props.isEnd) {
    classNames.push('fc-event-end')
  }

  if (props.isPast) {
    classNames.push('fc-event-past')
  }

  if (props.isToday) {
    classNames.push('fc-event-today')
  }

  if (props.isFuture) {
    classNames.push('fc-event-future')
  }

  return classNames
}

export function buildEventRangeKey(eventRange: EventRenderRange) {
  return eventRange.instance
    ? eventRange.instance.instanceId
    : `${eventRange.def.defId}:${eventRange.range.start.toISOString()}`
  // inverse-background events don't have specific instances. TODO: better solution
}

export function getSegAnchorAttrs(seg: Seg, context: ViewContext) {
  let { def, instance } = seg.eventRange
  let { url } = def

  if (url) {
    return { href: url }
  }

  let { emitter, options } = context
  let { eventInteractive } = options

  if (eventInteractive == null) {
    eventInteractive = def.interactive
    if (eventInteractive == null) {
      eventInteractive = Boolean(emitter.hasHandlers('eventClick'))
    }
  }

  // mock what happens in EventClicking
  if (eventInteractive) {
    // only attach keyboard-related handlers because click handler is already done in EventClicking
    return createAriaKeyboardAttrs((ev: UIEvent) => {
      emitter.trigger('eventClick', {
        el: ev.target as HTMLElement,
        event: new EventImpl(context, def, instance),
        jsEvent: ev as MouseEvent,
        view: context.viewApi,
      })
    })
  }

  return {}
}

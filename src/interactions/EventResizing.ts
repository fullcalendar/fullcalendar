import { default as DateComponent, Seg } from '../component/DateComponent'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { PointerDragEvent } from '../dnd/PointerDragging'
import { getElSeg } from '../component/renderers/EventRenderer'
import { EventStore, getRelatedEvents } from '../structs/event-store'
import { diffDates, enableCursor, disableCursor } from '../util/misc'
import { DateRange } from '../datelib/date-range'
import EventApi from '../api/EventApi'
import { EventRenderRange } from '../component/event-rendering'
import { createDuration } from '../datelib/duration'

export default class EventDragging {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  draggingSeg: Seg | null = null // TODO: rename to resizingSeg? subjectSeg?
  eventRange: EventRenderRange | null = null
  relatedEvents: EventStore | null = null
  validMutation: EventMutation | null = null
  mutatedRelatedEvents: EventStore | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = '.fc-resizer'
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, component)
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let seg = this.querySeg(ev)!
    let eventRange = this.eventRange = seg.eventRange!

    this.dragging.minDistance = 5 // TODO: make this a constant

    // if touch, need to be working with a selected event
    this.dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(ev.origEvent.target as HTMLElement) ||
      (ev.isTouch && this.component.eventSelection !== eventRange.instance!.instanceId)
    )
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()
    let eventRange = this.eventRange!

    this.relatedEvents = getRelatedEvents(
      calendar.state.eventStore,
      this.eventRange.instance!.instanceId
    )

    this.draggingSeg = this.querySeg(ev)

    calendar.publiclyTrigger('eventResizeStart', [
      {
        el: this.draggingSeg.el,
        event: new EventApi(calendar, eventRange.def, eventRange.instance),
        jsEvent: ev.origEvent,
        view: this.component.view
      }
    ])
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()
    let relatedEvents = this.relatedEvents!
    let initialHit = this.hitDragging.initialHit!
    let eventInstance = this.eventRange.instance!
    let mutation: EventMutation | null = null
    let mutatedRelatedEvents: EventStore | null = null
    let isInvalid = false

    if (hit) {
      mutation = computeMutation(
        initialHit,
        hit,
        (ev.subjectEl as HTMLElement).classList.contains('.fc-start-resizer'),
        eventInstance.range
      )
    }

    if (mutation) {
      mutatedRelatedEvents = applyMutationToEventStore(relatedEvents, mutation, calendar)

      if (!this.component.isEventsValid(mutatedRelatedEvents)) {
        isInvalid = true
        mutation = null
        mutatedRelatedEvents = null
      }
    }

    if (mutatedRelatedEvents) {
      calendar.dispatch({
        type: 'SET_EVENT_RESIZE',
        state: {
          affectedEvents: relatedEvents,
          mutatedEvents: mutatedRelatedEvents,
          isEvent: true,
          origSeg: this.draggingSeg
        }
      })
    } else {
      calendar.dispatch({ type: 'UNSET_EVENT_RESIZE' })
    }

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {

      if (mutation && isHitsEqual(initialHit, hit)) {
        mutation = null
      }

      this.validMutation = mutation
      this.mutatedRelatedEvents = mutatedRelatedEvents
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()
    let view = this.component.view
    let eventDef = this.eventRange!.def
    let eventInstance = this.eventRange!.instance
    let eventApi = new EventApi(calendar, eventDef, eventInstance)
    let relatedEvents = this.relatedEvents!
    let mutatedRelatedEvents = this.mutatedRelatedEvents!

    calendar.publiclyTrigger('eventResizeStop', [
      {
        el: this.draggingSeg.el,
        event: eventApi,
        jsEvent: ev.origEvent,
        view
      }
    ])

    if (this.validMutation) {
      calendar.dispatch({
        type: 'MERGE_EVENTS',
        eventStore: mutatedRelatedEvents
      })

      calendar.publiclyTrigger('eventResize', [
        {
          el: this.draggingSeg.el,
          startDelta: this.validMutation.startDelta || createDuration(0),
          endDelta: this.validMutation.endDelta || createDuration(0),
          prevEvent: eventApi,
          event: new EventApi( // the data AFTER the mutation
            calendar,
            mutatedRelatedEvents.defs[eventDef.defId],
            eventInstance ? mutatedRelatedEvents.instances[eventInstance.instanceId] : null
          ),
          revert: function() {
            calendar.dispatch({
              type: 'MERGE_EVENTS',
              eventStore: relatedEvents
            })
          },
          jsEvent: ev.origEvent,
          view
        }
      ])

    } else {
      calendar.publiclyTrigger('_noEventResize')
    }

    // reset all internal state
    this.draggingSeg = null
    this.relatedEvents = null
    this.validMutation = null

    // okay to keep eventInstance around. useful to set it in handlePointerDown
  }

  querySeg(ev: PointerDragEvent): Seg | null {
    return getElSeg(elementClosest(ev.subjectEl as HTMLElement, this.component.fgSegSelector))
  }

}

function computeMutation(hit0: Hit, hit1: Hit, isFromStart: boolean, instanceRange: DateRange): EventMutation | null {
  let dateEnv = hit0.component.getDateEnv()
  let date0 = hit0.dateSpan.range.start
  let date1 = hit1.dateSpan.range.start

  let delta = diffDates(
    date0, date1,
    dateEnv,
    hit0.component.largeUnit
  )

  if (isFromStart) {
    if (dateEnv.add(instanceRange.start, delta) > instanceRange.end) {
      return { startDelta: delta, standardProps: { hasEnd: true } }
    }
  } else {
    if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
      return { endDelta: delta, standardProps: { hasEnd: true } }
    }
  }

  return null
}

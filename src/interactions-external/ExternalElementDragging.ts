import ElementDragging from '../dnd/ElementDragging'
import HitDragging, { Hit } from '../interactions/HitDragging'
import browserContext from '../common/browser-context'
import { PointerDragEvent } from '../dnd/PointerDragging'
import { parseEventDef, createEventInstance, EventTuple } from '../structs/event'
import { createEmptyEventStore, eventTupleToStore } from '../structs/event-store'
import * as externalHooks from '../exports'
import { DateSpan } from '../structs/date-span'
import Calendar from '../Calendar'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { DragMetaInput, DragMeta, parseDragMeta } from '../structs/drag-meta'
import EventApi from '../api/EventApi'
import { elementMatches } from '../util/dom-manip'
import { enableCursor, disableCursor } from '../util/misc'
import { isEventsValid, isSelectionValid, eventToDateSpan } from '../validation'

/*
Given an already instantiated draggable object for one-or-more elements,
Interprets any dragging as an attempt to drag an events that lives outside
of a calendar onto a calendar.
*/
export default class ExternalElementDragging {

  hitDragging: HitDragging
  receivingCalendar: Calendar | null = null
  droppableEvent: EventTuple | null = null
  explicitDragMeta: DragMeta | null = null
  dragMeta: DragMeta | null = null

  constructor(dragging: ElementDragging, rawEventDragData?: DragMetaInput) {

    let hitDragging = this.hitDragging = new HitDragging(dragging, browserContext.componentHash)
    hitDragging.requireInitial = false // will start outside of a component
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)

    if (rawEventDragData) {
      this.explicitDragMeta = parseDragMeta(rawEventDragData)
    }
  }

  handleDragStart = (ev: PointerDragEvent) => {
    browserContext.unselectEvent() // unselect any existing events

    this.dragMeta = this.explicitDragMeta || getDragMetaFromEl(ev.subjectEl as HTMLElement)
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let { dragging } = this.hitDragging
    let receivingCalendar: Calendar | null = null
    let droppableEvent: EventTuple | null = null
    let isInvalid = false

    if (hit) {
      receivingCalendar = hit.component.getCalendar()

      if (this.canDropElOnCalendar(ev.subjectEl as HTMLElement, receivingCalendar)) {
        droppableEvent = computeEventForDateSpan(
          hit.dateSpan,
          this.dragMeta!,
          receivingCalendar
        )

        // TODO: fix inefficiency of calling eventTupleToStore again, and eventToDateSpan
        if (this.dragMeta.create) {
          isInvalid = !isEventsValid(eventTupleToStore(droppableEvent), receivingCalendar)
        } else { // treat non-event-creating drags as selection validation
          isInvalid = !isSelectionValid(eventToDateSpan(droppableEvent.def, droppableEvent.instance), receivingCalendar)
        }

        if (isInvalid) {
          droppableEvent = null
        }
      }
    }

    // TODO: always store as event-store?
    let droppableEventStore = droppableEvent ? eventTupleToStore(droppableEvent) : createEmptyEventStore()

    this.displayDrag(receivingCalendar, {
      affectedEvents: createEmptyEventStore(),
      mutatedEvents: droppableEventStore,
      isEvent: this.dragMeta!.create,
      origSeg: null
    })

    // show mirror if no already-rendered helper element OR if we are shutting down the mirror
    // TODO: wish we could somehow wait for dispatch to guarantee render
    dragging.setMirrorIsVisible(
      isFinal || !droppableEvent || !document.querySelector('.fc-helper')
    )

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {
      dragging.setMirrorNeedsRevert(!droppableEvent)

      this.receivingCalendar = receivingCalendar
      this.droppableEvent = droppableEvent
    }
  }

  handleDragEnd = (pev: PointerDragEvent) => {
    let { receivingCalendar, droppableEvent } = this

    this.clearDrag()

    if (receivingCalendar && droppableEvent) {
      let finalHit = this.hitDragging.finalHit!
      let finalView = finalHit.component.view
      let dragMeta = this.dragMeta!

      receivingCalendar.publiclyTrigger('drop', [
        {
          draggedEl: pev.subjectEl,
          date: receivingCalendar.dateEnv.toDate(finalHit.dateSpan.range.start),
          isAllDay: finalHit.dateSpan.isAllDay,
          jsEvent: pev.origEvent,
          view: finalView
        }
      ])

      if (dragMeta.create) {
        receivingCalendar.dispatch({
          type: 'MERGE_EVENTS',
          eventStore: eventTupleToStore(droppableEvent)
        })

        // signal that an external event landed
        receivingCalendar.publiclyTrigger('eventReceive', [
          {
            draggedEl: pev.subjectEl,
            event: new EventApi(
              receivingCalendar,
              droppableEvent.def,
              droppableEvent.instance
            ),
            view: finalView
          }
        ])
      }
    }

    this.receivingCalendar = null
    this.droppableEvent = null
  }

  displayDrag(nextCalendar: Calendar | null, state: EventInteractionState) {
    let prevCalendar = this.receivingCalendar

    if (prevCalendar && prevCalendar !== nextCalendar) {
      prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }

    if (nextCalendar) {
      nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state })
    }
  }

  clearDrag() {
    if (this.receivingCalendar) {
      this.receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }
  }

  canDropElOnCalendar(el: HTMLElement, receivingCalendar: Calendar): boolean {
    let dropAccept = receivingCalendar.opt('dropAccept')

    if (typeof dropAccept === 'function') {
      return dropAccept(el)
    } else if (typeof dropAccept === 'string' && dropAccept) {
      return Boolean(elementMatches(el, dropAccept))
    }

    return true
  }

}

// Utils for computing event store from the DragMeta
// ----------------------------------------------------------------------------------------------------

function computeEventForDateSpan(dateSpan: DateSpan, dragMeta: DragMeta, calendar: Calendar): EventTuple {
  let def = parseEventDef(dragMeta.leftoverProps, '', calendar)
  def.isAllDay = dateSpan.isAllDay
  def.hasEnd = Boolean(dragMeta.duration)

  let start = dateSpan.range.start

  // only rely on time info if drop zone is all-day,
  // otherwise, we already know the time
  if (dateSpan.isAllDay && dragMeta.time) {
    start = calendar.dateEnv.add(start, dragMeta.time)
  }

  let end = dragMeta.duration ?
    calendar.dateEnv.add(start, dragMeta.duration) :
    calendar.getDefaultEventEnd(dateSpan.isAllDay, start)

  let instance = createEventInstance(def.defId, { start, end })

  return { def, instance }
}

// Utils for extracting data from element
// ----------------------------------------------------------------------------------------------------

function getDragMetaFromEl(el: HTMLElement): DragMeta {
  let str = getEmbeddedElData(el, 'event')
  let obj = str ?
    JSON.parse(str) :
    { create: false } // if no embedded data, assume no event creation

  return parseDragMeta(obj)
}

(externalHooks as any).dataAttrPrefix = ''

function getEmbeddedElData(el: HTMLElement, name: string): string {
  let prefix = (externalHooks as any).dataAttrPrefix
  let prefixedName = (prefix ? prefix + '-' : '') + name

  return el.getAttribute('data-' + prefixedName) || ''
}

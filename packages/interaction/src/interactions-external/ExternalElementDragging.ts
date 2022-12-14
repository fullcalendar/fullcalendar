import { ViewApi, DatePointApi } from '@fullcalendar/core'
import {
  Hit,
  interactionSettingsStore,
  PointerDragEvent,
  parseEventDef, createEventInstance, EventTuple,
  createEmptyEventStore, eventTupleToStore,
  config,
  DateSpan,
  EventInteractionState,
  DragMetaInput, DragMeta, parseDragMeta,
  elementMatches,
  enableCursor, disableCursor,
  isInteractionValid,
  ElementDragging,
  CalendarContext,
  getDefaultEventEnd,
  refineEventDef,
  EventImpl,
} from '@fullcalendar/core/internal'
import { HitDragging } from '../interactions/HitDragging.js'
import { buildDatePointApiWithContext } from '../utils.js'

export type DragMetaGenerator = DragMetaInput | ((el: HTMLElement) => DragMetaInput)

export interface ExternalDropApi extends DatePointApi {
  draggedEl: HTMLElement
  jsEvent: UIEvent
  view: ViewApi
}

/*
Given an already instantiated draggable object for one-or-more elements,
Interprets any dragging as an attempt to drag an events that lives outside
of a calendar onto a calendar.
*/
export class ExternalElementDragging {
  hitDragging: HitDragging
  receivingContext: CalendarContext | null = null
  droppableEvent: EventTuple | null = null // will exist for all drags, even if create:false
  suppliedDragMeta: DragMetaGenerator | null = null
  dragMeta: DragMeta | null = null

  constructor(dragging: ElementDragging, suppliedDragMeta?: DragMetaGenerator) {
    let hitDragging = this.hitDragging = new HitDragging(dragging, interactionSettingsStore)
    hitDragging.requireInitial = false // will start outside of a component
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)

    this.suppliedDragMeta = suppliedDragMeta
  }

  handleDragStart = (ev: PointerDragEvent) => {
    this.dragMeta = this.buildDragMeta(ev.subjectEl as HTMLElement)
  }

  buildDragMeta(subjectEl: HTMLElement) {
    if (typeof this.suppliedDragMeta === 'object') {
      return parseDragMeta(this.suppliedDragMeta)
    }
    if (typeof this.suppliedDragMeta === 'function') {
      return parseDragMeta(this.suppliedDragMeta(subjectEl))
    }
    return getDragMetaFromEl(subjectEl)
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let { dragging } = this.hitDragging
    let receivingContext: CalendarContext | null = null
    let droppableEvent: EventTuple | null = null
    let isInvalid = false
    let interaction: EventInteractionState = {
      affectedEvents: createEmptyEventStore(),
      mutatedEvents: createEmptyEventStore(),
      isEvent: this.dragMeta!.create,
    }

    if (hit) {
      receivingContext = hit.context

      if (this.canDropElOnCalendar(ev.subjectEl as HTMLElement, receivingContext)) {
        droppableEvent = computeEventForDateSpan(
          hit.dateSpan,
          this.dragMeta!,
          receivingContext,
        )

        interaction.mutatedEvents = eventTupleToStore(droppableEvent)
        isInvalid = !isInteractionValid(interaction, hit.dateProfile, receivingContext)

        if (isInvalid) {
          interaction.mutatedEvents = createEmptyEventStore()
          droppableEvent = null
        }
      }
    }

    this.displayDrag(receivingContext, interaction)

    // show mirror if no already-rendered mirror element OR if we are shutting down the mirror (?)
    // TODO: wish we could somehow wait for dispatch to guarantee render
    dragging.setMirrorIsVisible(
      isFinal || !droppableEvent || !document.querySelector('.fc-event-mirror'), // TODO: turn className into constant
      // TODO: somehow query FullCalendars WITHIN shadow-roots for existing event-mirror els
    )

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {
      dragging.setMirrorNeedsRevert(!droppableEvent)

      this.receivingContext = receivingContext
      this.droppableEvent = droppableEvent
    }
  }

  handleDragEnd = (pev: PointerDragEvent) => {
    let { receivingContext, droppableEvent } = this

    this.clearDrag()

    if (receivingContext && droppableEvent) {
      let finalHit = this.hitDragging.finalHit!
      let finalView = finalHit.context.viewApi
      let dragMeta = this.dragMeta!

      receivingContext.emitter.trigger('drop', {
        ...buildDatePointApiWithContext(finalHit.dateSpan, receivingContext),
        draggedEl: pev.subjectEl as HTMLElement,
        jsEvent: pev.origEvent as MouseEvent, // Is this always a mouse event? See #4655
        view: finalView,
      })

      if (dragMeta.create) {
        let addingEvents = eventTupleToStore(droppableEvent)

        receivingContext.dispatch({
          type: 'MERGE_EVENTS',
          eventStore: addingEvents,
        })

        if (pev.isTouch) {
          receivingContext.dispatch({
            type: 'SELECT_EVENT',
            eventInstanceId: droppableEvent.instance.instanceId,
          })
        }

        // signal that an external event landed
        receivingContext.emitter.trigger('eventReceive', {
          event: new EventImpl(
            receivingContext,
            droppableEvent.def,
            droppableEvent.instance,
          ),
          relatedEvents: [],
          revert() {
            receivingContext.dispatch({
              type: 'REMOVE_EVENTS',
              eventStore: addingEvents,
            })
          },
          draggedEl: pev.subjectEl as HTMLElement,
          view: finalView,
        })
      }
    }

    this.receivingContext = null
    this.droppableEvent = null
  }

  displayDrag(nextContext: CalendarContext | null, state: EventInteractionState) {
    let prevContext = this.receivingContext

    if (prevContext && prevContext !== nextContext) {
      prevContext.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }

    if (nextContext) {
      nextContext.dispatch({ type: 'SET_EVENT_DRAG', state })
    }
  }

  clearDrag() {
    if (this.receivingContext) {
      this.receivingContext.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }
  }

  canDropElOnCalendar(el: HTMLElement, receivingContext: CalendarContext): boolean {
    let dropAccept = receivingContext.options.dropAccept

    if (typeof dropAccept === 'function') {
      return dropAccept.call(receivingContext.calendarApi, el)
    }

    if (typeof dropAccept === 'string' && dropAccept) {
      return Boolean(elementMatches(el, dropAccept))
    }

    return true
  }
}

// Utils for computing event store from the DragMeta
// ----------------------------------------------------------------------------------------------------

function computeEventForDateSpan(dateSpan: DateSpan, dragMeta: DragMeta, context: CalendarContext): EventTuple {
  let defProps = { ...dragMeta.leftoverProps }

  for (let transform of context.pluginHooks.externalDefTransforms) {
    Object.assign(defProps, transform(dateSpan, dragMeta))
  }

  let { refined, extra } = refineEventDef(defProps, context)
  let def = parseEventDef(
    refined,
    extra,
    dragMeta.sourceId,
    dateSpan.allDay,
    context.options.forceEventDuration || Boolean(dragMeta.duration), // hasEnd
    context,
  )

  let start = dateSpan.range.start

  // only rely on time info if drop zone is all-day,
  // otherwise, we already know the time
  if (dateSpan.allDay && dragMeta.startTime) {
    start = context.dateEnv.add(start, dragMeta.startTime)
  }

  let end = dragMeta.duration ?
    context.dateEnv.add(start, dragMeta.duration) :
    getDefaultEventEnd(dateSpan.allDay, start, context)

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

config.dataAttrPrefix = ''

function getEmbeddedElData(el: HTMLElement, name: string): string {
  let prefix = config.dataAttrPrefix
  let prefixedName = (prefix ? prefix + '-' : '') + name

  return el.getAttribute('data-' + prefixedName) || ''
}

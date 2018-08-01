import ElementDragging from '../dnd/ElementDragging'
import HitDragging, { Hit } from '../interactions/HitDragging'
import browserContext from '../common/browser-context'
import { PointerDragEvent } from '../dnd/PointerDragging'
import { EventStore, parseDef, createInstance } from '../reducers/event-store'
import UnzonedRange from '../models/UnzonedRange'
import * as externalHooks from '../exports'
import { createDuration } from '../datelib/duration'
import { assignTo } from '../util/object'
import { DateSpan } from '../reducers/date-span'
import Calendar from '../Calendar'
import { EventInteractionState } from '../reducers/event-interaction'

export default class ExternalElementDragging {

  hitDragging: HitDragging
  receivingCalendar: Calendar
  addableEventStore: EventStore
  explicitEventCreationData: any
  eventCreationData: any

  constructor(dragging: ElementDragging, rawEventCreationData?) {
    let hitDragging = this.hitDragging = new HitDragging(dragging, browserContext.componentHash)
    hitDragging.requireInitial = false
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitupdate', this.onHitUpdate)
    hitDragging.emitter.on('dragend', this.onDragEnd)

    this.explicitEventCreationData = rawEventCreationData ? processExplicitData(rawEventCreationData) : null
  }

  onDragStart = (ev: PointerDragEvent) => {
    browserContext.unselectEvent()
    this.eventCreationData = this.explicitEventCreationData || getDraggedElMeta(ev.subjectEl)
  }

  onHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let { dragging } = this.hitDragging
    let receivingCalendar: Calendar = null
    let addableEventStore: EventStore = null

    if (hit) {
      receivingCalendar = hit.component.getCalendar()
      addableEventStore = computeEventStoreForDateSpan(
        hit.dateSpan,
        receivingCalendar,
        this.eventCreationData
      )
    }

    this.renderDrag(receivingCalendar, {
      affectedEvents: { defs: {}, instances: {} },
      mutatedEvents: addableEventStore || { defs: {}, instances: {} }, // TODO: better way to make empty event-store
      willCreateEvent: Boolean(this.eventCreationData.standardProps)
    })

    // show mirror if no already-rendered helper element OR if we are shutting down the mirror
    // TODO: wish we could somehow wait for dispatch to guarantee render
    dragging.setMirrorIsVisible(
      isFinal || !addableEventStore || !document.querySelector('.fc-helper')
    )

    if (!isFinal) {
      dragging.setMirrorNeedsRevert(!addableEventStore)

      this.receivingCalendar = receivingCalendar
      this.addableEventStore = addableEventStore
    }
  }

  onDragEnd = (pev: PointerDragEvent) => {
    let { receivingCalendar, addableEventStore } = this

    this.unrenderDrag()

    if (receivingCalendar && addableEventStore) {
      let finalHit = this.hitDragging.finalHit
      let finalView = finalHit.component.view

      // TODO: how to let Scheduler extend this?
      receivingCalendar.publiclyTrigger('drop', [
        {
          draggedEl: pev.subjectEl,
          date: receivingCalendar.dateEnv.toDate(finalHit.dateSpan.range.start),
          isAllDay: finalHit.dateSpan.isAllDay,
          jsEvent: pev.origEvent,
          view: finalView
        }
      ])

      if (this.eventCreationData.standardProps) { // TODO: bad way to test if event creation is good
        receivingCalendar.dispatch({
          type: 'ADD_EVENTS',
          eventStore: addableEventStore,
          stick: this.eventCreationData.stick // TODO: use this param
        })

        // signal an external event landed
        receivingCalendar.publiclyTrigger('eventReceive', [
          {
            draggedEl: pev.subjectEl,
            event: addableEventStore, // TODO: what to put here!?
            view: finalView
          }
        ])
      }
    }

    this.receivingCalendar = null
    this.addableEventStore = null
  }

  renderDrag(newReceivingCalendar: Calendar | null, dragState: EventInteractionState) {
    let prevReceivingCalendar = this.receivingCalendar

    if (prevReceivingCalendar && prevReceivingCalendar !== newReceivingCalendar) {
      prevReceivingCalendar.dispatch({ type: 'CLEAR_DRAG' })
    }

    if (newReceivingCalendar) {
      newReceivingCalendar.dispatch({
        type: 'SET_DRAG',
        dragState: dragState
      })
    }
  }

  unrenderDrag() {
    if (this.receivingCalendar) {
      this.receivingCalendar.dispatch({ type: 'CLEAR_DRAG' })
    }
  }

}


function computeEventStoreForDateSpan(dateSpan: DateSpan, calendar: Calendar, eventCreationData): EventStore {

  let def = parseDef(
    eventCreationData.standardProps || {},
    null,
    dateSpan.isAllDay,
    Boolean(eventCreationData.duration) // hasEnd
  )

  let start = dateSpan.range.start

  // only rely on time info if drop zone is all-day,
  // otherwise, we already know the time
  if (dateSpan.isAllDay && eventCreationData.time) {
    start = calendar.dateEnv.add(start, eventCreationData.time)
  }

  let end = eventCreationData.duration ?
    calendar.dateEnv.add(start, eventCreationData.duration) :
    calendar.getDefaultEventEnd(dateSpan.isAllDay, start)

  let instance = createInstance(def.defId, new UnzonedRange(start, end))

  return {
    defs: { [def.defId]: def },
    instances: { [instance.instanceId]: instance }
  }
}


// same return type as getDraggedElMeta
// TODO: merge a lot of code with getDraggedElMeta!
// TODO: use refineProps!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ALSO: don't like how `stick` and others are in same namespace. impossible for them to go to extendedProps
function processExplicitData(data) {
  let standardProps = assignTo({}, data)
  let startTime // a Duration
  let duration
  let stick

  if (standardProps) {

    // something like 1 or true. still signal event creation
    if (typeof standardProps !== 'object') {
      standardProps = {}
    }

    // pluck special-cased date/time properties
    startTime = standardProps.start
    if (startTime == null) { startTime = standardProps.time } // accept 'time' as well
    duration = standardProps.duration
    stick = standardProps.stick
    delete standardProps.start
    delete standardProps.time
    delete standardProps.duration
    delete standardProps.stick
  }

  // massage into correct data types
  startTime = startTime != null ? createDuration(startTime) : null
  duration = duration != null ? createDuration(duration) : null
  stick = Boolean(stick) // wont be refining undefined?!?! - have a default

  return { standardProps, startTime, duration, stick }
}


// Extracting Event Data From Elements
// -----------------------------------
// TODO: create returned struct

(externalHooks as any).dataAttrPrefix = ''

// Given an element that might represent a dragged FullCalendar event, returns an intermediate data structure
// to be used for Event Object creation.
// A defined `.eventProps`, even when empty, indicates that an event should be created.
function getDraggedElMeta(el) {
  let standardProps // properties for creating the event, not related to date/time
  let startTime // a Duration
  let duration
  let stick

  standardProps = getEmbeddedElData(el, 'event', true)

  if (standardProps) {

    // something like 1 or true. still signal event creation
    if (typeof standardProps !== 'object') {
      standardProps = {}
    }

    // pluck special-cased date/time properties
    startTime = standardProps.start
    if (startTime == null) { startTime = standardProps.time } // accept 'time' as well
    duration = standardProps.duration
    stick = standardProps.stick
    delete standardProps.start
    delete standardProps.time
    delete standardProps.duration
    delete standardProps.stick
  }

  // fallback to standalone attribute values for each of the date/time properties
  if (startTime == null) { startTime = getEmbeddedElData(el, 'start') }
  if (startTime == null) { startTime = getEmbeddedElData(el, 'time') } // accept 'time' as well
  if (duration == null) { duration = getEmbeddedElData(el, 'duration') }
  if (stick == null) { stick = getEmbeddedElData(el, 'stick', true) }

  // massage into correct data types
  startTime = startTime != null ? createDuration(startTime) : null
  duration = duration != null ? createDuration(duration) : null
  stick = Boolean(stick)

  return { standardProps, startTime, duration, stick }
}

function getEmbeddedElData(el, name, shouldParseJson = false) {
  let prefix = (externalHooks as any).dataAttrPrefix
  let prefixedName = (prefix ? prefix + '-' : '') + name

  let data = el.getAttribute('data-' + prefixedName) || null
  if (data && shouldParseJson) {
    data = JSON.parse(data)
  }

  return data
}

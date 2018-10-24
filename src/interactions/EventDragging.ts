import { default as DateComponent, Seg } from '../component/DateComponent'
import { getElSeg } from '../component/renderers/EventRenderer'
import { PointerDragEvent } from '../dnd/PointerDragging'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import browserContext from '../common/browser-context'
import { startOfDay } from '../datelib/marker'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { EventStore, getRelevantEvents, createEmptyEventStore } from '../structs/event-store'
import Calendar from '../Calendar'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { diffDates, enableCursor, disableCursor } from '../util/misc'
import { EventRenderRange } from '../component/event-rendering'
import EventApi from '../api/EventApi'

export default class EventDragging { // TODO: rename to EventSelectingAndDragging

  static SELECTOR = '.fc-draggable, .fc-resizable' // TODO: test this in IE11

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  subjectSeg: Seg | null = null // the seg being selected/dragged
  isDragging: boolean = false
  eventRange: EventRenderRange | null = null
  relevantEvents: EventStore | null = null
  receivingCalendar: Calendar | null = null
  validMutation: EventMutation | null = null
  mutatedRelevantEvents: EventStore | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = EventDragging.SELECTOR
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, browserContext.componentHash)
    hitDragging.useSubjectCenter = component.useEventCenter
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('pointerup', this.handlePointerUp)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let origTarget = ev.origEvent.target as HTMLElement
    let { component, dragging } = this
    let { mirror } = dragging
    let initialCalendar = component.calendar
    let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl as HTMLElement)!
    let eventRange = this.eventRange = subjectSeg.eventRange!
    let eventInstanceId = eventRange.instance!.instanceId

    this.relevantEvents = getRelevantEvents(
      initialCalendar.state.eventStore,
      eventInstanceId
    )

    dragging.minDistance = ev.isTouch ? 0 : component.opt('eventDragMinDistance')
    dragging.delay =
      // only do a touch delay if touch and this event hasn't been selected yet
      (ev.isTouch && eventInstanceId !== component.props.eventSelection) ?
        getComponentTouchDelay(component) :
        null

    mirror.parentNode = initialCalendar.el
    mirror.revertDuration = component.opt('dragRevertDuration')

    let isValid =
      this.component.isValidSegDownEl(origTarget) &&
      !elementClosest(origTarget, '.fc-resizer')

    dragging.setIgnoreMove(!isValid)

    // disable dragging for elements that are resizable (ie, selectable)
    // but are not draggable
    this.isDragging = isValid &&
      (ev.subjectEl as HTMLElement).classList.contains('fc-draggable')
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let initialCalendar = this.component.calendar
    let eventRange = this.eventRange!
    let eventInstanceId = eventRange.instance.instanceId

    if (ev.isTouch) {
      // need to select a different event?
      if (eventInstanceId !== this.component.props.eventSelection) {
        initialCalendar.dispatch({ type: 'SELECT_EVENT', eventInstanceId })
      }
    } else {
      // if now using mouse, but was previous touch interaction, clear selected event
      initialCalendar.dispatch({ type: 'UNSELECT_EVENT' })
    }

    if (this.isDragging) {
      initialCalendar.unselect(ev) // unselect *date* selection
      initialCalendar.publiclyTrigger('eventDragStart', [
        {
          el: this.subjectSeg.el,
          event: new EventApi(initialCalendar, eventRange.def, eventRange.instance),
          jsEvent: ev.origEvent,
          view: this.component.view
        }
      ])
    }
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {

    if (!this.isDragging) {
      return
    }

    let relevantEvents = this.relevantEvents!
    let initialHit = this.hitDragging.initialHit!
    let initialCalendar = this.component.calendar

    // states based on new hit
    let receivingCalendar: Calendar | null = null
    let mutation: EventMutation | null = null
    let mutatedRelevantEvents: EventStore | null = null
    let isInvalid = false

    if (hit) {
      let receivingComponent = hit.component
      receivingCalendar = receivingComponent.calendar

      if (
        initialCalendar === receivingCalendar ||
        receivingComponent.opt('editable') && receivingComponent.opt('droppable')
      ) {
        mutation = computeEventMutation(initialHit, hit)

        if (mutation) {
          mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, mutation, receivingCalendar)

          if (!this.component.isEventsValid(mutatedRelevantEvents)) {
            isInvalid = true
            mutation = null
            mutatedRelevantEvents = null
          }
        }
      } else {
        receivingCalendar = null
      }
    }

    this.displayDrag(receivingCalendar, {
      affectedEvents: relevantEvents,
      mutatedEvents: mutatedRelevantEvents || createEmptyEventStore(),
      isEvent: true,
      origSeg: this.subjectSeg
    })

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {

      if (
        initialCalendar === receivingCalendar && // TODO: write test for this
        isHitsEqual(initialHit, hit)
      ) {
        mutation = null
      }

      this.dragging.setMirrorNeedsRevert(!mutation)

      // render the mirror if no already-rendered mirror
      // TODO: wish we could somehow wait for dispatch to guarantee render
      this.dragging.setMirrorIsVisible(
        !hit || !document.querySelector('.fc-mirror')
      )

      // assign states based on new hit
      this.receivingCalendar = receivingCalendar
      this.validMutation = mutation
      this.mutatedRelevantEvents = mutatedRelevantEvents
    }
  }

  handlePointerUp = () => {
    if (!this.isDragging) {
      this.cleanup() // because handleDragEnd won't fire
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {

    if (this.isDragging) {
      let initialCalendar = this.component.calendar
      let initialView = this.component.view
      let { receivingCalendar } = this
      let eventDef = this.eventRange!.def
      let eventInstance = this.eventRange!.instance
      let eventApi = new EventApi(initialCalendar, eventDef, eventInstance)
      let relevantEvents = this.relevantEvents!
      let mutatedRelevantEvents = this.mutatedRelevantEvents!

      this.clearDrag() // must happen after revert animation

      initialCalendar.publiclyTrigger('eventDragStop', [
        {
          el: this.subjectSeg.el,
          event: eventApi,
          jsEvent: ev.origEvent,
          view: initialView
        }
      ])

      if (this.validMutation) {

        // dropped within same calendar
        if (receivingCalendar === initialCalendar) {

          initialCalendar.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: mutatedRelevantEvents
          })

          initialCalendar.publiclyTrigger('eventDrop', [
            {
              el: ev.subjectEl,
              delta: this.validMutation.startDelta!,
              prevEvent: eventApi,
              event: new EventApi( // the data AFTER the mutation
                initialCalendar,
                mutatedRelevantEvents.defs[eventDef.defId],
                eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null
              ),
              revert: function() {
                initialCalendar.dispatch({
                  type: 'MERGE_EVENTS',
                  eventStore: relevantEvents
                })
              },
              jsEvent: ev.origEvent,
              view: initialView
            }
          ])

        // dropped in different calendar
        } else if (receivingCalendar) {

          initialCalendar.publiclyTrigger('eventLeave', [
            {
              draggedEl: ev.subjectEl,
              event: eventApi,
              view: initialView
            }
          ])

          initialCalendar.dispatch({
            type: 'REMOVE_EVENT_INSTANCES',
            instances: this.mutatedRelevantEvents!.instances
          })

          receivingCalendar.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: this.mutatedRelevantEvents!
          })

          if (ev.isTouch) {
            receivingCalendar.dispatch({
              type: 'SELECT_EVENT',
              eventInstanceId: eventInstance.instanceId
            })
          }

          receivingCalendar.publiclyTrigger('eventReceive', [
            {
              draggedEl: ev.subjectEl,
              event: new EventApi(receivingCalendar, eventDef, eventInstance),
              view: this.hitDragging.finalHit.component
            }
          ])
        }

      } else {
        initialCalendar.publiclyTrigger('_noEventDrop')
      }
    }

    this.cleanup()
  }

  // render a drag state on the next receivingCalendar
  displayDrag(nextCalendar: Calendar | null, state: EventInteractionState) {
    let initialCalendar = this.component.calendar
    let prevCalendar = this.receivingCalendar

    // does the previous calendar need to be cleared?
    if (prevCalendar && prevCalendar !== nextCalendar) {

      // does the initial calendar need to be cleared?
      // if so, don't clear all the way. we still need to to hide the affectedEvents
      if (prevCalendar === initialCalendar) {
        prevCalendar.dispatch({
          type: 'SET_EVENT_DRAG',
          state: {
            affectedEvents: state.affectedEvents,
            mutatedEvents: createEmptyEventStore(),
            isEvent: true,
            origSeg: state.origSeg
          }
        })

      // completely clear the old calendar if it wasn't the initial
      } else {
        prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
      }
    }

    if (nextCalendar) {
      nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state })
    }
  }

  clearDrag() {
    let initialCalendar = this.component.calendar
    let { receivingCalendar } = this

    if (receivingCalendar) {
      receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }

    // the initial calendar might have an dummy drag state from displayDrag
    if (initialCalendar !== receivingCalendar) {
      initialCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' })
    }
  }

  cleanup() { // reset all internal state
    this.subjectSeg = null
    this.isDragging = false
    this.eventRange = null
    this.relevantEvents = null
    this.receivingCalendar = null
    this.validMutation = null
    this.mutatedRelevantEvents = null
  }

}

function computeEventMutation(hit0: Hit, hit1: Hit): EventMutation {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan
  let date0 = dateSpan0.range.start
  let date1 = dateSpan1.range.start
  let standardProps = null

  if (dateSpan0.allDay !== dateSpan1.allDay) {
    standardProps = {
      allDay: dateSpan1.allDay,
      hasEnd: hit1.component.opt('allDayMaintainDuration')
    }

    if (dateSpan1.allDay) {
      // means date1 is already start-of-day,
      // but date0 needs to be converted
      date0 = startOfDay(date0)
    }
  }

  let delta = diffDates(
    date0, date1,
    hit0.component.dateEnv,
    hit0.component === hit1.component ?
      hit0.component.largeUnit :
      null
  )

  return {
    startDelta: delta,
    endDelta: delta,
    standardProps
  }
}

function getComponentTouchDelay(component: DateComponent): number | null {
  let delay = component.opt('eventLongPressDelay')

  if (delay == null) {
    delay = component.opt('longPressDelay')
  }

  return delay
}

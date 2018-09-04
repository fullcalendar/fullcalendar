import { default as DateComponent, Seg } from '../component/DateComponent'
import { getElSeg } from '../component/renderers/EventRenderer'
import { PointerDragEvent } from '../dnd/PointerDragging'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import browserContext from '../common/browser-context'
import { startOfDay } from '../datelib/marker'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { EventStore, getRelatedEvents, createEmptyEventStore } from '../structs/event-store'
import Calendar from '../Calendar'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { diffDates, enableCursor, disableCursor } from '../util/misc'
import { EventRenderRange } from '../component/event-rendering'
import EventApi from '../api/EventApi'

export default class EventDragging { // TODO: rename to EventSelectingAndDragging

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  subjectSeg: Seg | null = null // the seg being selected/dragged
  isDragging: boolean = false
  eventRange: EventRenderRange | null = null
  relatedEvents: EventStore | null = null
  receivingCalendar: Calendar | null = null
  validMutation: EventMutation | null = null
  mutatedRelatedEvents: EventStore | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = '.fc-draggable, .fc-resizable' // TODO: test this in IE11
    dragging.touchScrollAllowed = false
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, browserContext.componentHash)
    hitDragging.useSubjectCenter = component.useEventCenter
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let origTarget = ev.origEvent.target as HTMLElement
    let { component, dragging } = this
    let { mirror } = dragging
    let initialCalendar = component.getCalendar()
    let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl as HTMLElement)!
    let eventRange = this.eventRange = subjectSeg.eventRange!
    let eventInstanceId = eventRange.instance!.instanceId

    this.relatedEvents = getRelatedEvents(
      initialCalendar.state.eventStore,
      eventInstanceId
    )

    dragging.minDistance = ev.isTouch ? 0 : 5
    dragging.delay =
      // only do a touch delay if touch and this event hasn't been selected yet
      (ev.isTouch && eventInstanceId !== component.eventSelection) ?
        getComponentTouchDelay(component) :
        null

    mirror.parentNode = initialCalendar.el
    mirror.opacity = component.opt('dragOpacity')
    mirror.revertDuration = component.opt('dragRevertDuration')

    // to prevent from cloning the sourceEl before it is selected
    dragging.setMirrorIsVisible(false)

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
    let initialCalendar = this.component.getCalendar()
    let eventRange = this.eventRange!
    let eventInstanceId = eventRange.instance.instanceId

    if (ev.isTouch) {

      // need to select a different event?
      if (eventInstanceId !== this.component.eventSelection) {

        initialCalendar.dispatch({
          type: 'SELECT_EVENT',
          eventInstanceId: eventInstanceId
        })

        browserContext.reportEventSelection(this.component) // will unselect previous
      }

    // if now using mouse, but was previous touch interaction, clear selected event
    } else {
      browserContext.unselectEvent()
    }

    if (this.isDragging) {
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

    let relatedEvents = this.relatedEvents!
    let initialHit = this.hitDragging.initialHit!
    let initialCalendar = this.component.getCalendar()

    // states based on new hit
    let receivingCalendar: Calendar | null = null
    let mutation: EventMutation | null = null
    let mutatedRelatedEvents: EventStore | null = null
    let isInvalid = false

    if (hit) {
      receivingCalendar = hit.component.getCalendar()
      mutation = computeEventMutation(initialHit, hit)

      if (mutation) {
        mutatedRelatedEvents = applyMutationToEventStore(relatedEvents, mutation, receivingCalendar)

        if (!this.component.isEventsValid(mutatedRelatedEvents)) {
          isInvalid = true
          mutation = null
          mutatedRelatedEvents = null
        }
      }
    }

    this.displayDrag(receivingCalendar, {
      affectedEvents: relatedEvents,
      mutatedEvents: mutatedRelatedEvents || createEmptyEventStore(),
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
      this.mutatedRelatedEvents = mutatedRelatedEvents
    }
  }

  onDocumentPointerUp = (ev: PointerDragEvent, wasTouchScroll: boolean) => {
    if (
      !wasTouchScroll &&
      !this.subjectSeg && // no events were selected/dragged during this interaction
      browserContext.eventSelectedComponent === this.component // this component owned the previous event selection
    ) {
      browserContext.unselectEvent()
    }

    if (!this.isDragging) {
      this.cleanup() // because handleDragEnd won't fire
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {

    if (this.isDragging) {
      let initialCalendar = this.component.getCalendar()
      let initialView = this.component.view
      let { receivingCalendar } = this
      let eventDef = this.eventRange!.def
      let eventInstance = this.eventRange!.instance
      let eventApi = new EventApi(initialCalendar, eventDef, eventInstance)
      let relatedEvents = this.relatedEvents!
      let mutatedRelatedEvents = this.mutatedRelatedEvents!

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
            eventStore: mutatedRelatedEvents
          })

          initialCalendar.publiclyTrigger('eventDrop', [
            {
              el: ev.subjectEl,
              delta: this.validMutation.startDelta!,
              prevEvent: eventApi,
              event: new EventApi( // the data AFTER the mutation
                initialCalendar,
                mutatedRelatedEvents.defs[eventDef.defId],
                eventInstance ? mutatedRelatedEvents.instances[eventInstance.instanceId] : null
              ),
              revert: function() {
                initialCalendar.dispatch({
                  type: 'MERGE_EVENTS',
                  eventStore: relatedEvents
                })
              },
              jsEvent: ev.origEvent,
              view: initialView
            }
          ])

        // dropped in different calendar
        // TODO: more public triggers
        } else if (receivingCalendar) {
          initialCalendar.dispatch({
            type: 'REMOVE_EVENT_INSTANCES',
            instances: this.mutatedRelatedEvents!.instances
          })
          receivingCalendar.dispatch({
            type: 'MERGE_EVENTS',
            eventStore: this.mutatedRelatedEvents!
          })
        }

      } else {
        initialCalendar.publiclyTrigger('_noEventDrop')
      }
    }

    this.cleanup()
  }

  // render a drag state on the next receivingCalendar
  displayDrag(nextCalendar: Calendar | null, state: EventInteractionState) {
    let initialCalendar = this.component.getCalendar()
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
    let initialCalendar = this.component.getCalendar()
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
    this.relatedEvents = null
    this.receivingCalendar = null
    this.validMutation = null
    this.mutatedRelatedEvents = null
  }

}

function computeEventMutation(hit0: Hit, hit1: Hit): EventMutation {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan
  let date0 = dateSpan0.range.start
  let date1 = dateSpan1.range.start
  let standardProps = null

  if (dateSpan0.isAllDay !== dateSpan1.isAllDay) {
    standardProps = {
      isAllDay: dateSpan1.isAllDay,
      hasEnd: hit1.component.opt('isAllDayMaintainDuration')
    }

    if (dateSpan1.isAllDay) {
      // means date1 is already start-of-day,
      // but date0 needs to be converted
      date0 = startOfDay(date0)
    }
  }

  let delta = diffDates(
    date0, date1,
    hit0.component.getDateEnv(),
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

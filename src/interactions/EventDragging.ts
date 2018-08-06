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
import { diffDates } from '../util/misc'

export default class EventDragging {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  draggingSeg: Seg | null = null
  eventInstanceId: string = ''
  relatedEvents: EventStore | null = null
  receivingCalendar: Calendar | null = null
  validMutation: EventMutation | null = null
  mutatedRelatedEvents: EventStore | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = '.fc-draggable'
    dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, browserContext.componentHash)
    hitDragging.useSubjectCenter = true
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { component, dragging } = this
    let initialCalendar = component.getCalendar()
    let draggingSeg = this.draggingSeg = getElSeg(ev.subjectEl as HTMLElement)!
    let eventInstanceId = this.eventInstanceId = draggingSeg.eventRange!.eventInstance!.instanceId

    this.relatedEvents = getRelatedEvents(
      initialCalendar.state.eventStore,
      eventInstanceId
    )

    dragging.minDistance = ev.isTouch ? 0 : 5
    dragging.delay =
      // only do a touch delay if touch and this event hasn't been selected yet
      (ev.isTouch && eventInstanceId !== component.selectedEventInstanceId) ?
        getComponentTouchDelay(component) :
        null

    // to prevent from cloning the sourceEl before it is selected
    dragging.setMirrorIsVisible(false)

    let origTarget = ev.origEvent.target as HTMLElement

    dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(origTarget) ||
      Boolean(elementClosest(origTarget, '.fc-resizer'))
    )
  }

  handleDragStart = (ev: PointerDragEvent) => {
    if (ev.isTouch) {

      // need to select a different event?
      if (this.eventInstanceId !== this.component.selectedEventInstanceId) {
        let initialCalendar = this.component.getCalendar()

        initialCalendar.dispatch({
          type: 'SELECT_EVENT',
          eventInstanceId: this.eventInstanceId
        })

        browserContext.reportEventSelection(this.component) // will unselect previous
      }

    // if now using mouse, but was previous touch interaction, clear selected event
    } else {
      browserContext.unselectEvent()
    }
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {
    let relatedEvents = this.relatedEvents!
    let initialHit = this.hitDragging.initialHit!
    let initialCalendar = this.component.getCalendar()

    // states based on new hit
    let receivingCalendar: Calendar | null = null
    let validMutation: EventMutation | null = null
    let mutatedRelatedEvents: EventStore | null = null

    if (hit) {
      receivingCalendar = hit.component.getCalendar()

      if (
        initialCalendar !== receivingCalendar || // TODO: write test for this
        !isHitsEqual(initialHit, hit)
      ) {
        validMutation = computeEventMutation(initialHit, hit)

        if (validMutation) {
          mutatedRelatedEvents = applyMutationToEventStore(relatedEvents, validMutation, receivingCalendar)
        }
      }
    }

    this.displayDrag(receivingCalendar, {
      affectedEvents: relatedEvents,
      mutatedEvents: mutatedRelatedEvents || relatedEvents,
      isEvent: true,
      origSeg: this.draggingSeg
    })

    if (!isFinal) {
      this.dragging.setMirrorNeedsRevert(!validMutation)

      // render the mirror if no already-rendered helper
      // TODO: wish we could somehow wait for dispatch to guarantee render
      this.dragging.setMirrorIsVisible(
        !hit || !document.querySelector('.fc-helper')
      )

      // assign states based on new hit
      this.receivingCalendar = receivingCalendar
      this.validMutation = validMutation
      this.mutatedRelatedEvents = mutatedRelatedEvents
    }
  }

  onDocumentPointerUp = (ev: PointerDragEvent, wasTouchScroll: boolean) => {
    if (
      !wasTouchScroll &&
      !this.draggingSeg && // was never dragging
      // was the previously event-selected component?
      browserContext.eventSelectedComponent === this.component
    ) {
      browserContext.unselectEvent()
    }
  }

  handleDragEnd = () => {
    let initialCalendar = this.component.getCalendar()
    let { receivingCalendar } = this

    this.clearDrag() // must happen after revert animation

    if (this.validMutation) {

      // dropped within same calendar
      if (receivingCalendar === initialCalendar) {
        receivingCalendar.dispatch({
          type: 'MUTATE_EVENTS',
          mutation: this.validMutation,
          instanceId: this.eventInstanceId
        })

      // dropped in different calendar
      // TODO: more public triggers
      } else if (receivingCalendar) {
        initialCalendar.dispatch({
          type: 'REMOVE_EVENTS',
          eventStore: this.mutatedRelatedEvents
        })
        receivingCalendar.dispatch({
          type: 'ADD_EVENTS',
          eventStore: this.mutatedRelatedEvents,
          stick: true // TODO: use this param
        })
      }
    }

    // reset all internal state
    this.draggingSeg = null
    this.eventInstanceId = ''
    this.relatedEvents = null
    this.receivingCalendar = null
    this.validMutation = null
    this.mutatedRelatedEvents = null
  }

  // render a drag state on the next receivingCalendar
  displayDrag(nextCalendar: Calendar | null, dragState: EventInteractionState) {
    let initialCalendar = this.component.getCalendar()
    let prevCalendar = this.receivingCalendar

    // does the previous calendar need to be cleared?
    if (prevCalendar && prevCalendar !== nextCalendar) {

      // does the initial calendar need to be cleared?
      // if so, don't clear all the way. we still need to to hide the affectedEvents
      if (prevCalendar === initialCalendar) {
        prevCalendar.dispatch({
          type: 'SET_DRAG',
          dragState: {
            affectedEvents: dragState.affectedEvents,
            mutatedEvents: createEmptyEventStore(),
            isEvent: true,
            origSeg: dragState.origSeg
          }
        })

      // completely clear the old calendar if it wasn't the initial
      } else {
        prevCalendar.dispatch({ type: 'CLEAR_DRAG' })
      }
    }

    if (nextCalendar) {
      nextCalendar.dispatch({ type: 'SET_DRAG', dragState })
    }
  }

  clearDrag() {
    let initialCalendar = this.component.getCalendar()
    let { receivingCalendar } = this

    if (receivingCalendar) {
      receivingCalendar.dispatch({ type: 'CLEAR_DRAG' })
    }

    // the initial calendar might have an dummy drag state from displayDrag
    if (initialCalendar !== receivingCalendar) {
      initialCalendar.dispatch({ type: 'CLEAR_DRAG' })
    }
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
      hasEnd: false, // TODO: make this a setting
      isAllDay: dateSpan1.isAllDay
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

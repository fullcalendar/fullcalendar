import { default as DateComponent, Seg } from '../component/DateComponent'
import { PointerDragEvent } from '../dnd/PointerDragging'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, diffDates, getRelatedEvents, applyMutationToAll } from '../reducers/event-mutation'
import browserContext from '../common/browser-context'
import { startOfDay } from '../datelib/marker'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { EventStore } from '../reducers/event-store'
import Calendar from '../Calendar'
import { EventInteractionState } from '../reducers/event-interaction'

export default class EventDragging {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  draggingSeg: Seg
  receivingCalendar: Calendar
  validMutation: EventMutation
  mutatedRelatedEvents: EventStore

  constructor(component: DateComponent) {
    this.component = component

    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.pointer.selector = '.fc-draggable'
    this.dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, browserContext.componentHash)
    hitDragging.useSubjectCenter = true
    hitDragging.emitter.on('pointerdown', this.onPointerDown)
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitchange', this.onHitChange)
    hitDragging.emitter.on('dragend', this.onDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { dragging } = this

    dragging.delay = this.computeDragDelay(ev)

    // to prevent from cloning the sourceEl before it is selected
    dragging.setMirrorIsVisible(false)

    let origTarget = ev.origEvent.target as HTMLElement

    dragging.setIgnoreMove(
      !this.component.isValidSegInteraction(origTarget) ||
      Boolean(elementClosest(origTarget, '.fc-resizer'))
    )
  }

  computeDragDelay(ev: PointerDragEvent): number {
    if (ev.isTouch) {
      let seg = (ev.subjectEl as any).fcSeg
      let eventInstanceId = seg.eventRange.eventInstance.instanceId

      if (eventInstanceId !== this.component.selectedEventInstanceId) {
        return 1000 // TODO: use setting
      }
    }
  }

  onDragStart = (ev: PointerDragEvent) => {
    this.draggingSeg = (ev.subjectEl as any).fcSeg

    if (ev.isTouch) {
      let eventInstanceId = this.draggingSeg.eventRange.eventInstance.instanceId

      this.component.getCalendar().dispatch({
        type: 'SELECT_EVENT',
        eventInstanceId
      })

      browserContext.reportEventSelection(this.component) // will unselect previous
    } else {
      browserContext.unselectEvent()
    }
  }

  onHitChange = (hit: Hit | null, isFinal: boolean) => {
    let { initialHit } = this.hitDragging // guaranteed
    let initialCalendar = initialHit.component.getCalendar()
    let receivingCalendar: Calendar = null
    let validMutation: EventMutation = null
    let relatedEvents: EventStore = null
    let mutatedRelatedEvents: EventStore = null

    relatedEvents = getRelatedEvents( // TODO: compute this only once?
      initialCalendar.state.eventStore,
      this.draggingSeg.eventRange.eventInstance.instanceId
    )

    if (hit) {
      receivingCalendar = hit.component.getCalendar()

      if (!isHitsEqual(initialHit, hit)) {
        validMutation = computeEventMutation(initialHit, hit)

        if (validMutation) {
          mutatedRelatedEvents = applyMutationToAll(relatedEvents, validMutation, receivingCalendar)
        }
      }
    }

    this.renderDrag(receivingCalendar, {
      affectedEvents: relatedEvents,
      mutatedEvents: mutatedRelatedEvents || relatedEvents,
      origSeg: this.draggingSeg
    })

    if (!isFinal) {
      this.dragging.setMirrorNeedsRevert(!validMutation)

      // render the mirror if no already-rendered helper
      // TODO: wish we could somehow wait for dispatch to guarantee render
      this.dragging.setMirrorIsVisible(
        !hit || !document.querySelector('.fc-helper')
      )

      this.receivingCalendar = receivingCalendar
      this.validMutation = validMutation
      this.mutatedRelatedEvents = mutatedRelatedEvents
    }
  }

  onDocumentPointerUp = (ev, wasTouchScroll) => {
    if (
      !wasTouchScroll &&
      !this.draggingSeg && // was never dragging
      // was the previously event-selected component?
      browserContext.eventSelectedComponent === this.component
    ) {
      browserContext.unselectEvent()
    }
  }

  onDragEnd = () => {
    this.unrenderDrag()

    if (this.validMutation) {
      let initialCalendar = this.hitDragging.initialHit.component.getCalendar()

      if (this.receivingCalendar === initialCalendar) {
        this.receivingCalendar.dispatch({
          type: 'MUTATE_EVENTS',
          mutation: this.validMutation,
          instanceId: this.draggingSeg.eventRange.eventInstance.instanceId
        })
      } else {
        initialCalendar.dispatch({
          type: 'REMOVE_EVENTS',
          eventStore: this.mutatedRelatedEvents
        })
        this.receivingCalendar.dispatch({
          type: 'ADD_EVENTS',
          eventStore: this.mutatedRelatedEvents,
          stick: true // TODO: use this param
        })
      }
    }

    this.receivingCalendar = null
    this.validMutation = null
    this.mutatedRelatedEvents = null
    this.draggingSeg = null
  }

  renderDrag(newReceivingCalendar: Calendar | null, dragState: EventInteractionState) {
    let initialCalendar = this.hitDragging.initialHit.component.getCalendar()
    let prevReceivingCalendar = this.receivingCalendar

    if (prevReceivingCalendar && prevReceivingCalendar !== newReceivingCalendar) {
      if (prevReceivingCalendar === initialCalendar) {
        prevReceivingCalendar.dispatch({
          type: 'SET_DRAG',
          dragState: {
            affectedEvents: dragState.affectedEvents,
            mutatedEvents: { defs: {}, instances: {} }, // TODO: util
            origSeg: dragState.origSeg
          }
        })
      } else {
        prevReceivingCalendar.dispatch({ type: 'CLEAR_DRAG' })
      }
    }

    if (newReceivingCalendar) {
      newReceivingCalendar.dispatch({
        type: 'SET_DRAG',
        dragState
      })
    }
  }

  unrenderDrag() {
    let initialCalendar = this.hitDragging.initialHit.component.getCalendar()
    let { receivingCalendar } = this

    if (receivingCalendar) {
      receivingCalendar.dispatch({ type: 'CLEAR_DRAG' })
    }

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

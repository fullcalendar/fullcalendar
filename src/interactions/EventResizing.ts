import { default as DateComponent, Seg } from '../component/DateComponent'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { PointerDragEvent } from '../dnd/PointerDragging'
import { getElSeg } from '../component/renderers/EventRenderer'
import { EventInstance } from '../structs/event'
import { EventStore, getRelatedEvents } from '../structs/event-store'
import { diffDates } from '../util/misc'
import { DateRange } from '../datelib/date-range'

export default class EventDragging {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  // internal state
  draggingSeg: Seg | null = null
  eventInstance: EventInstance | null = null
  relatedEvents: EventStore | null = null
  validMutation: EventMutation | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.pointer.selector = '.fc-resizer'
    dragging.touchScrollAllowed = false

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
    let eventInstance = this.eventInstance = seg.eventRange!.eventInstance!

    // if touch, need to be working with a selected event
    this.dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(ev.origEvent.target as HTMLElement) ||
      (ev.isTouch && this.component.eventSelection !== eventInstance.instanceId)
    )
  }

  handleDragStart = (ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()

    this.relatedEvents = getRelatedEvents(
      calendar.state.eventStore,
      this.eventInstance!.instanceId
    )

    this.draggingSeg = this.querySeg(ev)
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()
    let relatedEvents = this.relatedEvents!
    let initialHit = this.hitDragging.initialHit!
    let eventInstance = this.eventInstance!
    let mutation: EventMutation | null = null

    if (hit) {
      mutation = computeMutation(
        initialHit,
        hit,
        (ev.subjectEl as HTMLElement).classList.contains('.fc-start-resizer'),
        eventInstance.range
      )
    }

    if (mutation) {
      let mutatedRelated = applyMutationToEventStore(relatedEvents, mutation, calendar)

      calendar.dispatch({
        type: 'SET_EVENT_RESIZE',
        state: {
          affectedEvents: relatedEvents,
          mutatedEvents: mutatedRelated,
          isEvent: true,
          origSeg: this.draggingSeg
        }
      })
    } else {
      calendar.dispatch({ type: 'UNSET_EVENT_RESIZE' })
    }

    if (!isFinal) {

      if (mutation && isHitsEqual(initialHit, hit)) {
        mutation = null
      }

      this.validMutation = mutation
    }
  }

  handleDragEnd = (ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()

    if (this.validMutation) {
      calendar.dispatch({
        type: 'MUTATE_EVENTS',
        mutation: this.validMutation,
        instanceId: this.eventInstance!.instanceId
      })
    }

    // reset all internal state
    this.draggingSeg = null
    this.relatedEvents = null
    this.validMutation = null

    // okay to keep eventInstance around. useful to set it in handlePointerDown
  }

  querySeg(ev: PointerDragEvent): Seg | null {
    return getElSeg(elementClosest(ev.subjectEl as HTMLElement, this.component.segSelector))
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

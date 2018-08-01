import { default as DateComponent, Seg } from '../component/DateComponent'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, diffDates, getRelatedEvents, applyMutationToAll } from '../reducers/event-mutation'
import { elementClosest } from '../util/dom-manip'
import UnzonedRange from '../models/UnzonedRange'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { PointerDragEvent } from '../dnd/PointerDragging'
import { getElSeg } from '../component/renderers/EventRenderer'

export default class EventDragging {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  draggingSeg: Seg
  mutation: EventMutation

  constructor(component: DateComponent) {
    this.component = component

    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.pointer.selector = '.fc-resizer'
    this.dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, component)
    hitDragging.emitter.on('pointerdown', this.onPointerDown)
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitupdate', this.onHitUpdate)
    hitDragging.emitter.on('dragend', this.onDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  onPointerDown = (ev) => {
    let seg = this.querySeg(ev)
    let eventInstanceId = seg.eventRange.eventInstance.instanceId

    // if touch, need to be working with a selected event
    this.dragging.setIgnoreMove(
      !this.component.isValidSegDownEl(ev.origEvent.target) ||
      (ev.isTouch && this.component.selectedEventInstanceId !== eventInstanceId)
    )
  }

  onDragStart = (ev) => {
    this.draggingSeg = this.querySeg(ev)
  }

  onHitUpdate = (hit: Hit | null, isFinal: boolean, ev: PointerDragEvent) => {
    let calendar = this.component.getCalendar()
    let { initialHit } = this.hitDragging
    let eventInstance = this.draggingSeg.eventRange.eventInstance
    let mutation = null

    if (hit) {
      mutation = computeMutation(
        initialHit,
        hit,
        (ev.subjectEl as HTMLElement).classList.contains('.fc-start-resizer'),
        eventInstance.range
      )
    }

    if (mutation) {
      let related = getRelatedEvents(calendar.state.eventStore, eventInstance.instanceId)
      let mutatedRelated = applyMutationToAll(related, mutation, calendar)

      calendar.dispatch({
        type: 'SET_EVENT_RESIZE',
        eventResizeState: {
          affectedEvents: related,
          mutatedEvents: mutatedRelated,
          origSeg: this.draggingSeg
        }
      })
    } else {
      calendar.dispatch({
        type: 'CLEAR_EVENT_RESIZE'
      })
    }

    if (mutation && isHitsEqual(initialHit, hit)) {
      mutation = null
    }

    if (!isFinal) {
      this.mutation = mutation
    }
  }

  onDragEnd = (ev) => {
    let calendar = this.component.getCalendar()

    if (this.mutation) {
      calendar.dispatch({
        type: 'MUTATE_EVENTS',
        mutation: this.mutation,
        instanceId: this.draggingSeg.eventRange.eventInstance.instanceId
      })

      this.mutation = null
    }

    this.draggingSeg = null
  }

  querySeg(ev: PointerDragEvent): Seg {
    return getElSeg(elementClosest(ev.subjectEl as HTMLElement, this.component.segSelector))
  }

}

function computeMutation(hit0: Hit, hit1: Hit, isFromStart: boolean, instanceRange: UnzonedRange): EventMutation {
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
}

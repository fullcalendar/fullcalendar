import { default as DateComponent, Seg } from '../component/DateComponent'
import HitDragListener, { isHitsEqual, Hit } from '../dnd/HitDragListener'
import { EventMutation, diffDates, getRelatedEvents, applyMutationToAll } from '../reducers/event-mutation'
import { elementClosest } from '../util/dom-manip'
import UnzonedRange from '../models/UnzonedRange'
import { IntentfulDragListenerImpl } from '../dnd/IntentfulDragListener'

export default class EventDragging {

  component: DateComponent
  dragListener: IntentfulDragListenerImpl
  hitListener: HitDragListener
  draggingSeg: Seg
  mutation: EventMutation

  constructor(component: DateComponent) {
    this.component = component

    this.dragListener = new IntentfulDragListenerImpl(component.el)
    this.dragListener.pointerListener.selector = '.fc-resizer'
    this.dragListener.touchScrollAllowed = false

    let hitListener = this.hitListener = new HitDragListener(this.dragListener, component)
    hitListener.on('pointerdown', this.onPointerDown)
    hitListener.on('dragstart', this.onDragStart)
    hitListener.on('hitover', this.onHitOver)
    hitListener.on('hitout', this.onHitOut)
    hitListener.on('dragend', this.onDragEnd)
  }

  destroy() {
    this.hitListener.destroy()
  }

  onPointerDown = (ev) => {
    let seg = this.querySeg(ev)
    let eventInstanceId = seg.eventRange.eventInstance.instanceId

    // if touch, need to be working with a selected event
    this.dragListener.pointerListener.ignoreMove =
      !this.component.isValidSegInteraction(ev.origEvent.target) ||
      (ev.isTouch && this.component.selectedEventInstanceId !== eventInstanceId)
  }

  onDragStart = (ev) => {
    this.draggingSeg = this.querySeg(ev)
  }

  onHitOver = (hit, ev) => {
    let calendar = this.component.getCalendar()
    let { initialHit } = this.hitListener
    let eventInstance = this.draggingSeg.eventRange.eventInstance

    let mutation = computeMutation(
      initialHit,
      hit,
      ev.el.classList.contains('.fc-start-resizer'),
      eventInstance.range
    )

    if (!mutation) {
      calendar.dispatch({
        type: 'CLEAR_EVENT_RESIZE'
      })
    } else {
      let related = getRelatedEvents(calendar.state.eventStore, eventInstance.instanceId)
      let mutatedRelated = applyMutationToAll(related, mutation, calendar)

      calendar.dispatch({
        type: 'SET_EVENT_RESIZE',
        eventResizeState: {
          eventStore: mutatedRelated,
          origSeg: this.draggingSeg,
          isTouch: ev.isTouch
        }
      })

      if (!isHitsEqual(initialHit, hit)) {
        this.mutation = mutation
      }
    }
  }

  onHitOut = (hit, ev) => {
    let calendar = this.component.getCalendar()

    calendar.dispatch({
      type: 'CLEAR_EVENT_RESIZE'
    })

    this.mutation = null
  }

  onDragEnd = (ev) => {
    let calendar = this.component.getCalendar()

    calendar.dispatch({
      type: 'CLEAR_EVENT_RESIZE'
    })

    if (this.mutation) {
      calendar.dispatch({
        type: 'MUTATE_EVENTS',
        mutation: this.mutation,
        instanceId: this.draggingSeg.eventRange.eventInstance.instanceId
      })
    }

    this.mutation = null
    this.draggingSeg = null
  }

  querySeg(ev): Seg {
    return elementClosest(ev.el, this.component.segSelector).fcSeg
  }

}

function computeMutation(hit0: Hit, hit1: Hit, isFromStart: boolean, instanceRange: UnzonedRange): EventMutation {
  let dateEnv = hit0.component.getDateEnv()
  let date0 = hit0.range.start
  let date1 = hit1.range.start

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

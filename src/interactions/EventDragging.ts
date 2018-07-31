import { default as DateComponent, Seg } from '../component/DateComponent'
import { PointerDragEvent } from '../dnd/PointerDragging'
import HitDragging, { isHitsEqual, Hit } from './HitDragging'
import { EventMutation, diffDates, getRelatedEvents, applyMutationToAll } from '../reducers/event-mutation'
import { GlobalContext } from '../common/GlobalContext'
import { startOfDay } from '../datelib/marker'
import { elementClosest } from '../util/dom-manip'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'

export default class EventDragging {

  component: DateComponent
  globalContext: GlobalContext // need this as a member?
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  draggingSeg: Seg
  mutation: EventMutation

  constructor(component: DateComponent, globalContext: GlobalContext) {
    this.component = component
    this.globalContext = globalContext

    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.pointer.selector = '.fc-draggable'
    this.dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, globalContext.componentHash)
    hitDragging.subjectCenter = true
    hitDragging.emitter.on('pointerdown', this.onPointerDown)
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitover', this.onHitOver)
    hitDragging.emitter.on('hitout', this.onHitOut)
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
    let { globalContext } = this
    let calendar = this.component.getCalendar()

    // TODO: nicer accessors in GlobalContext for this?
    if (globalContext.eventSelectedComponent) {
      let selectedCalendar = globalContext.eventSelectedComponent.getCalendar()

      if (selectedCalendar !== calendar) {
        selectedCalendar.dispatch({
          type: 'CLEAR_SELECTED_EVENT'
        })
        globalContext.eventSelectedComponent = null
      }
    }

    this.draggingSeg = (ev.subjectEl as any).fcSeg

    if (ev.isTouch) {
      let eventInstanceId = this.draggingSeg.eventRange.eventInstance.instanceId

      calendar.dispatch({
        type: 'SELECT_EVENT',
        eventInstanceId
      })

      this.globalContext.eventSelectedComponent = this.component
    }
  }

  onHitOver = (hit) => {
    let { initialHit } = this.hitDragging
    let calendar = hit.component.getCalendar()

    let mutation = computeEventMutation(initialHit, hit)
    let related = getRelatedEvents(
      calendar.state.eventStore,
      this.draggingSeg.eventRange.eventInstance.instanceId
    )
    let mutatedRelated = applyMutationToAll(related, mutation, calendar)

    calendar.dispatch({
      type: 'SET_DRAG',
      dragState: {
        eventStore: mutatedRelated,
        origSeg: this.draggingSeg
      }
    })

    let { dragging } = this

    // render the mirror if no already-rendered helper
    // TODO: wish we could somehow wait for dispatch to guarantee render
    dragging.setMirrorIsVisible(
      !document.querySelector('.fc-helper')
    )

    let isSame = isHitsEqual(initialHit, hit)
    dragging.setMirrorNeedsRevert(isSame)

    if (!isSame) {
      this.mutation = mutation
    }
  }

  onHitOut = (hit) => { // TODO: onHitChange?
    this.mutation = null

    // we still want to notify calendar about invalid drag
    // because we want related events to stay hidden
    hit.component.getCalendar().dispatch({
      type: 'SET_DRAG',
      dragState: {
        eventStore: { defs: {}, instances: {} }, // TODO: better way to make empty event-store
        origSeg: this.draggingSeg
      }
    })

    let { dragging } = this

    dragging.setMirrorIsVisible(true)
    dragging.setMirrorNeedsRevert(true)
  }

  onDocumentPointerUp = (ev, wasTouchScroll) => {
    if (
      !this.mutation &&
      !wasTouchScroll &&
      this.globalContext.eventSelectedComponent === this.component
    ) {
      this.component.getCalendar().dispatch({
        type: 'CLEAR_SELECTED_EVENT'
      })
    }
  }

  onDragEnd = () => {
    let { initialHit } = this.hitDragging
    let initialCalendar = initialHit.component.getCalendar()

    // TODO: what about across calendars?

    initialCalendar.dispatch({
      type: 'CLEAR_DRAG'
    })

    if (this.mutation) {
      initialCalendar.dispatch({
        type: 'MUTATE_EVENTS',
        mutation: this.mutation,
        instanceId: this.draggingSeg.eventRange.eventInstance.instanceId
      })
    }

    this.mutation = null
    this.draggingSeg = null
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

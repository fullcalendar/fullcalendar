import { default as DateComponent, Seg } from '../component/DateComponent'
import { PointerDragEvent } from '../dnd/PointerDragListener'
import HitDragListener, { isHitsEqual } from '../dnd/HitDragListener'
import { createMutation, EventMutation, computeEventDisplacement } from '../reducers/event-mutation'
import { GlobalContext } from '../common/GlobalContext'

export default class EventDragging {

  component: DateComponent
  globalContext: GlobalContext
  hitListener: HitDragListener
  draggingSeg: Seg
  mutation: EventMutation

  constructor(component: DateComponent, globalContext: GlobalContext) {
    this.component = component
    this.globalContext = globalContext

    let hitListener = this.hitListener = new HitDragListener(
      component,
      globalContext.componentHash
    )
    hitListener.dragListener.pointerListener.selector = '.fc-draggable'
    hitListener.dragListener.touchScrollAllowed = false
    hitListener.subjectCenter = true
    hitListener.on('pointerdown', this.onPointerDown)
    hitListener.on('dragstart', this.onDragStart)
    hitListener.on('hitover', this.onHitOver)
    hitListener.on('hitout', this.onHitOut)
    hitListener.on('dragend', this.onDragEnd)
  }

  destroy() {
    this.hitListener.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { dragListener } = this.hitListener

    dragListener.delay = this.computeDragDelay(ev)

    // to prevent from cloning the sourceEl before it is selected
    dragListener.dragMirror.disable()
  }

  computeDragDelay(ev: PointerDragEvent): number {
    if (ev.isTouch) {
      let seg = (ev.el as any).fcSeg
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

    this.draggingSeg = (ev.el as any).fcSeg

    if (ev.isTouch) {
      let eventInstanceId = this.draggingSeg.eventRange.eventInstance.instanceId

      calendar.dispatch({
        type: 'SELECT_EVENT',
        eventInstanceId
      })

      this.globalContext.eventSelectedComponent = this.component
    }
  }

  onHitOver = (hit, ev) => {
    let { initialHit } = this.hitListener

    this.mutation = createMutation(
      initialHit.range,
      initialHit.isAllDay,
      hit.range,
      hit.isAllDay,
      this.draggingSeg.eventRange.eventDef.hasEnd,
      hit.component === initialHit.component ?
        hit.component.largeUnit :
        null,
      hit.component.getDateEnv()
    )

    let calendar = hit.component.getCalendar()
    let displacement = computeEventDisplacement(
      calendar.state.eventStore,
      this.draggingSeg.eventRange.eventInstance.instanceId,
      this.mutation,
      calendar
    )

    calendar.dispatch({
      type: 'SET_DRAG',
      displacement,
      origSeg: this.draggingSeg,
      isTouch: ev.isTouch
    })

    let { dragMirror } = this.hitListener.dragListener

    // TODO wish we could somehow wait for dispatch to guarantee render
    if (!document.querySelector('.fc-helper')) {
      dragMirror.enable()
    } else {
      dragMirror.disable()
    }

    dragMirror.needsRevert = isHitsEqual(initialHit, hit)
  }

  onHitOut = (hit, ev) => { // TODO: onHitChange?
    this.mutation = null

    hit.component.getCalendar().dispatch({
      type: 'SET_DRAG',
      displacement: { defs: {}, instances: {} }, // TODO: better way to make empty event-store
      origSeg: this.draggingSeg,
      isTouch: ev.isTouch
    })

    let { dragMirror } = this.hitListener.dragListener

    dragMirror.enable()
    dragMirror.needsRevert = true
  }

  onDocumentPointerUp = (ev, isTouchScroll) => {
    if (
      !this.mutation &&
      !isTouchScroll &&
      this.globalContext.eventSelectedComponent === this.component
    ) {
      this.component.getCalendar().dispatch({
        type: 'CLEAR_SELECTED_EVENT'
      })
    }
  }

  onDragEnd = () => {
    let { initialHit } = this.hitListener
    let initialCalendar = initialHit.component.getCalendar()

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

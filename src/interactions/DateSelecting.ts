import { compareNumbers } from '../util/misc'
import { elementClosest } from '../util/dom-manip'
import InteractiveDateComponent, { InteractiveDateComponentHash } from '../component/InteractiveDateComponent'
import HitDragListener, { Hit } from '../dnd/HitDragListener'
import { Selection } from '../reducers/selection'
import UnzonedRange from '../models/UnzonedRange'
import PointerDragListener, { PointerDragEvent } from '../dnd/PointerDragListener'

export default class DateSelecting {

  componentHash: InteractiveDateComponentHash
  pointerListener: PointerDragListener
  pointerDownEl: HTMLElement
  hitListener: HitDragListener
  dragComponent: InteractiveDateComponent
  dragSelection: Selection
  activeComponent: InteractiveDateComponent
  activeSelection: Selection

  constructor(componentHash: InteractiveDateComponentHash) {
    this.componentHash = componentHash
    this.pointerListener = new PointerDragListener(
      document as any, // TODO: better
      null, // selector
      true // ignoreMove
    )
    this.pointerListener.on('pointerdown', this.onPointerDown)
    this.pointerListener.on('pointerup', this.onPointerUp)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let component = this.queryComponent(ev)

    if (component && component.opt('selectable')) {

      this.hitListener = new HitDragListener({
        containerEl: component.el,
        touchDelay: getComponentDelay(component),
        touchScrollAllowed: false
      }, [ component ])

      this.dragComponent = component
      this.dragSelection = null

      this.hitListener.on('dragstart', this.onDragStart)
      this.hitListener.on('hitover', this.onHitOver)
      this.hitListener.on('hitout', this.onHitOut)
      this.hitListener.dragListener.pointerListener.simulateStart(ev)
    }

    this.pointerDownEl = ev.origEvent.target as any // TODO: better
  }

  queryComponent(ev: PointerDragEvent): InteractiveDateComponent {
    let componentEl = elementClosest(
      ev.origEvent.target as any, // TODO: better
      '[data-fc-com-uid]'
    )
    if (componentEl) {
      return this.componentHash[componentEl.getAttribute('data-fc-com-uid')]
    }
  }

  onDragStart = (ev: PointerDragEvent) => {
    if (this.hitListener.initialHit) {
      this.clearActiveSelection(ev)
    }
  }

  onHitOver = (overHit: Hit) => {
    let { initialHit } = this.hitListener
    let initialComponent = initialHit.component
    let calendar = initialComponent.getCalendar()
    let dragSelection = computeSelection(initialHit, overHit)

    if (dragSelection) {
      this.dragSelection = dragSelection
      calendar.setSelectionState(dragSelection)
    }
  }

  onHitOut = (hit: Selection) => {
    let { initialHit, finalHit } = this.hitListener
    let initialComponent = initialHit.component
    let calendar = initialComponent.getCalendar()

    if (!finalHit) { // still dragging? a hitout means it went out of bounds
      this.dragSelection = null
      calendar.clearSelectionState()
    }
  }

  onPointerUp = (ev: PointerDragEvent) => {
    if (this.dragSelection) {
      this.setActiveSelection(this.dragComponent, this.dragSelection, ev)
    } else if (!this.pointerListener.isTouchScroll) {
      // if there was a pointerup that did not result in a selection and was
      // not merely a touchmove-scroll, then possibly unselect the current selection
      this.maybeUnfocus(ev)
    }

    if (this.hitListener) {
      this.hitListener.destroy()
      this.hitListener = null
    }

    this.dragComponent = null
    this.dragSelection = null
    this.pointerDownEl = null
  }

  maybeUnfocus(ev: PointerDragEvent) {
    if (this.activeSelection) {
      let view = this.activeComponent.view
      let unselectAuto = view.opt('unselectAuto')
      let unselectCancel = view.opt('unselectCancel')

      if (unselectAuto && (!unselectCancel || !elementClosest(this.pointerDownEl, unselectCancel))) {
        this.clearActiveSelection(ev)
      }
    }
  }

  setActiveSelection(component: InteractiveDateComponent, selection: Selection, ev: PointerDragEvent) {
    this.clearActiveSelection(ev)
    this.activeComponent = component
    this.activeSelection = selection
    let view = component.view
    view.calendar.triggerSelect(selection, view, ev.origEvent)
  }

  clearActiveSelection(ev: PointerDragEvent) {
    if (this.activeSelection) {
      let component = this.activeComponent
      let calendar = component.getCalendar()
      calendar.clearSelectionState()
      calendar.triggerUnselect(component.view, ev.origEvent)
      this.activeSelection = null
    }
  }

}

function getComponentDelay(component): number {
  let delay = component.opt('selectLongPressDelay')
  if (delay == null) {
    delay = component.opt('longPressDelay')
  }
  return delay
}

function computeSelection(hit0: Hit, hit1: Hit): Selection {
  let ms = [
    hit0.range.start,
    hit0.range.end,
    hit1.range.start,
    hit1.range.end
  ]

  ms.sort(compareNumbers)

  return {
    range: new UnzonedRange(ms[0], ms[3]),
    isAllDay: hit0.isAllDay
  }
}

// TODO: isSelectionFootprintAllowed

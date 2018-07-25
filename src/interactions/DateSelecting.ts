import { compareNumbers } from '../util/misc'
import { elementClosest } from '../util/dom-manip'
import DateComponent from '../component/DateComponent'
import HitDragListener, { Hit } from '../dnd/HitDragListener'
import { Selection } from '../reducers/selection'
import UnzonedRange from '../models/UnzonedRange'
import { PointerDragEvent } from '../dnd/PointerDragListener'
import { GlobalContext } from '../common/GlobalContext'

export default class DateSelecting {

  component: DateComponent
  globalContext: GlobalContext
  hitListener: HitDragListener
  dragSelection: Selection

  constructor(component: DateComponent, globalContext: GlobalContext) {
    this.component = component
    this.globalContext = globalContext

    let hitListener = this.hitListener = new HitDragListener(component)
    hitListener.dragListener.touchScrollAllowed = false
    hitListener.on('pointerdown', this.onPointerDown)
    hitListener.on('dragstart', this.onDragStart)
    hitListener.on('hitover', this.onHitOver)
    hitListener.on('hitout', this.onHitOut)
  }

  destroy() {
    this.hitListener.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { component } = this
    let { dragListener } = this.hitListener
    let isValid = component.opt('selectable') &&
      component.isValidDateInteraction(ev.origEvent.target as HTMLElement)

    // don't bother to watch expensive moves if component won't do selection
    dragListener.pointerListener.ignoreMove = !isValid

    dragListener.delay = (isValid && ev.isTouch) ?
      getComponentDelay(component) :
      null
  }

  onDragStart = (ev: PointerDragEvent) => {
    let { globalContext } = this

    if (globalContext.selectedCalendar) {
      globalContext.selectedCalendar.unselect(ev.origEvent)
      globalContext.selectedCalendar = null
    }
  }

  onHitOver = (overHit: Hit) => { // TODO: do a onHitChange instead?
    let { globalContext } = this
    let calendar = this.component.getCalendar()
    let dragSelection = computeSelection(this.hitListener.initialHit, overHit)

    if (dragSelection) {
      globalContext.selectedCalendar = calendar
      this.dragSelection = dragSelection

      calendar.dispatch({
        type: 'SELECT',
        selection: dragSelection
      })
    }
  }

  onHitOut = (hit: Selection, ev) => {
    let { globalContext } = this
    let calendar = this.component.getCalendar()

    globalContext.selectedCalendar = null
    this.dragSelection = null

    calendar.dispatch({
      type: 'UNSELECT'
    })
  }

  onDocumentPointerUp = (ev: PointerDragEvent, isTouchScroll: boolean, downEl: HTMLElement) => {
    let { component } = this

    if (this.dragSelection) {

      // the selection is already rendered, so just need to fire
      component.getCalendar().triggerSelect(
        this.dragSelection,
        component.view,
        ev.origEvent
      )

      this.dragSelection = null

    } else if (!isTouchScroll && component.selection) {
      // if there was a pointerup that did not result in a selection and was
      // not merely a touchmove-scroll, then possibly unselect the current selection.
      // won't do anything if already unselected (OR, leverage selectedCalendar?)

      let unselectAuto = component.opt('unselectAuto')
      let unselectCancel = component.opt('unselectCancel')

      if (unselectAuto && (!unselectAuto || !elementClosest(downEl, unselectCancel))) {
        component.getCalendar().unselect()
      }
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

import { compareNumbers, enableCursor, disableCursor } from '../util/misc'
import { elementClosest } from '../util/dom-manip'
import DateComponent from '../component/DateComponent'
import HitDragging, { Hit } from './HitDragging'
import { DateSpan } from '../structs/date-span'
import { PointerDragEvent } from '../dnd/PointerDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import browserContext from '../common/browser-context'

/*
Tracks when the user selects a portion of time of a component,
constituted by a drag over date cells, with a possible delay at the beginning of the drag.
*/
export default class DateSelecting {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  dragSelection: DateSpan | null = null

  constructor(component: DateComponent) {
    this.component = component

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.touchScrollAllowed = false
    dragging.minDistance = component.opt('selectMinDistance') || 0
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, component)
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { component, dragging } = this
    let canSelect = component.opt('selectable') &&
      component.isValidDateDownEl(ev.origEvent.target as HTMLElement)

    // don't bother to watch expensive moves if component won't do selection
    dragging.setIgnoreMove(!canSelect)

    // if touch, require user to hold down
    dragging.delay = ev.isTouch ? getComponentTouchDelay(component) : null
  }

  handleDragStart = (ev: PointerDragEvent) => {
    browserContext.unselectDates(ev) // clear selection from all other calendars/components
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {
    let calendar = this.component.getCalendar()
    let dragSelection: DateSpan | null = null
    let isInvalid = false

    if (hit) {
      dragSelection = computeSelection(
        this.hitDragging.initialHit!.dateSpan,
        hit.dateSpan
      )

      if (!this.component.isSelectionValid(dragSelection)) {
        isInvalid = true
        dragSelection = null
      }
    }

    if (dragSelection) {
      calendar.dispatch({ type: 'SELECT_DATES', selection: dragSelection })
    } else if (!isFinal) { // only unselect if moved away while dragging
      calendar.dispatch({ type: 'UNSELECT_DATES' })
    }

    if (!isInvalid) {
      enableCursor()
    } else {
      disableCursor()
    }

    if (!isFinal) {
      this.dragSelection = dragSelection // only clear if moved away from all hits while dragging
    }
  }

  onDocumentPointerUp = (ev: PointerDragEvent, wasTouchScroll: boolean, downEl: HTMLElement) => {
    let { component } = this

    if (this.dragSelection) {

      // the selection is already rendered, so just need to report it
      browserContext.reportDateSelection(component.getCalendar(), this.dragSelection, ev)

      this.dragSelection = null

    // only unselect if this component has a selection.
    // otherwise, we might be clearing another component's new selection in the same calendar.
    } else if (!wasTouchScroll && component.dateSelection) {
      let unselectAuto = component.opt('unselectAuto')
      let unselectCancel = component.opt('unselectCancel')

      if (unselectAuto && (!unselectAuto || !elementClosest(downEl, unselectCancel))) {
        browserContext.unselectDates(ev)
      }
    }
  }

}

function getComponentTouchDelay(component: DateComponent): number {
  let delay = component.opt('selectLongPressDelay')

  if (delay == null) {
    delay = component.opt('longPressDelay')
  }

  return delay
}

function computeSelection(dateSpan0: DateSpan, dateSpan1: DateSpan): DateSpan {
  let ms = [
    dateSpan0.range.start,
    dateSpan0.range.end,
    dateSpan1.range.start,
    dateSpan1.range.end
  ]

  ms.sort(compareNumbers)

  return {
    range: { start: ms[0], end: ms[3] },
    isAllDay: dateSpan0.isAllDay
  }
}

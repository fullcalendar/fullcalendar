import { compareNumbers } from '../util/misc'
import { elementClosest } from '../util/dom-manip'
import DateComponent from '../component/DateComponent'
import HitDragging, { Hit } from './HitDragging'
import { DateSpan } from '../reducers/date-span'
import UnzonedRange from '../models/UnzonedRange'
import { PointerDragEvent } from '../dnd/PointerDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import browserContext from '../common/browser-context'

export default class DateSelecting {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  dragSelection: DateSpan

  constructor(component: DateComponent) {
    this.component = component

    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, component)
    hitDragging.emitter.on('pointerdown', this.onPointerDown)
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitchange', this.onHitChange)
  }

  destroy() {
    this.dragging.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { component, dragging } = this
    let isValid = component.opt('selectable') &&
      component.isValidDateInteraction(ev.origEvent.target as HTMLElement)

    // don't bother to watch expensive moves if component won't do selection
    dragging.setIgnoreMove(!isValid)

    dragging.delay = (isValid && ev.isTouch) ?
      getComponentDelay(component) :
      null
  }

  onDragStart = (ev: PointerDragEvent) => {
    browserContext.unselectDates(ev)
  }

  onHitChange = (hit: Hit | null, isFinal: boolean) => {
    let calendar = this.component.getCalendar()
    let dragSelection: DateSpan = null

    if (hit) {
      dragSelection = computeSelection(
        this.hitDragging.initialHit.dateSpan,
        hit.dateSpan
      )
    }

    if (dragSelection) {
      calendar.dispatch({
        type: 'SELECT',
        selection: dragSelection
      })
    } else if (!isFinal) { // only unselect if moved away while dragging
      calendar.dispatch({
        type: 'UNSELECT'
      })
    }

    if (!isFinal) {
      this.dragSelection = dragSelection
    }
  }

  onDocumentPointerUp = (ev: PointerDragEvent, wasTouchScroll: boolean, downEl: HTMLElement) => {
    let { component } = this

    if (this.dragSelection) {

      // the selection is already rendered, so just need to report it
      browserContext.reportDateSelection(component.getCalendar(), this.dragSelection, ev)

      this.dragSelection = null

    } else if (!wasTouchScroll && component.selection) { // only unselect if this component has a selection
      let unselectAuto = component.opt('unselectAuto')
      let unselectCancel = component.opt('unselectCancel')

      if (unselectAuto && (!unselectAuto || !elementClosest(downEl, unselectCancel))) {
        browserContext.unselectDates(ev)
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

function computeSelection(dateSpan0: DateSpan, dateSpan1: DateSpan): DateSpan {
  let ms = [
    dateSpan0.range.start,
    dateSpan0.range.end,
    dateSpan1.range.start,
    dateSpan1.range.end
  ]

  ms.sort(compareNumbers)

  return {
    range: new UnzonedRange(ms[0], ms[3]),
    isAllDay: dateSpan0.isAllDay
  }
}

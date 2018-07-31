import { compareNumbers } from '../util/misc'
import { elementClosest } from '../util/dom-manip'
import DateComponent from '../component/DateComponent'
import HitDragging, { Hit } from './HitDragging'
import { DateSpan } from '../reducers/date-span'
import UnzonedRange from '../models/UnzonedRange'
import { PointerDragEvent } from '../dnd/PointerDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { GlobalContext } from '../common/GlobalContext'

export default class DateSelecting {

  component: DateComponent
  globalContext: GlobalContext
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  dragSelection: DateSpan

  constructor(component: DateComponent, globalContext: GlobalContext) {
    this.component = component
    this.globalContext = globalContext

    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.touchScrollAllowed = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, component)
    hitDragging.emitter.on('pointerdown', this.onPointerDown)
    hitDragging.emitter.on('dragstart', this.onDragStart)
    hitDragging.emitter.on('hitover', this.onHitOver)
    hitDragging.emitter.on('hitout', this.onHitOut)
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
    let { globalContext } = this
    globalContext.unselectDates(ev)
  }

  onHitOver = (overHit: Hit) => { // TODO: do a onHitChange instead?
    let calendar = this.component.getCalendar()
    let dragSelection = computeSelection(
      this.hitDragging.initialHit.dateSpan,
      overHit.dateSpan
    )

    if (dragSelection) {
      this.dragSelection = dragSelection

      calendar.dispatch({
        type: 'SELECT',
        selection: dragSelection
      })
    }
  }

  onHitOut = (hit: DateSpan, ev) => {
    let calendar = this.component.getCalendar()

    this.dragSelection = null

    calendar.dispatch({
      type: 'UNSELECT'
    })
  }

  onDocumentPointerUp = (ev: PointerDragEvent, wasTouchScroll: boolean, downEl: HTMLElement) => {
    let { component, globalContext } = this

    if (this.dragSelection) {

      // the selection is already rendered, so just need to report it
      globalContext.reportDateSelection(component, this.dragSelection, ev)

      this.dragSelection = null

    } else if (!wasTouchScroll && component.selection) {
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

// TODO: isSelectionFootprintAllowed

import {
  compareNumbers, enableCursor, disableCursor, DateComponent, Hit,
  DateSpan, PointerDragEvent, dateSelectionJoinTransformer,
  Interaction, InteractionSettings, interactionSettingsToStore
} from '@fullcalendar/core'
import HitDragging from './HitDragging'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import { __assign } from 'tslib'

/*
Tracks when the user selects a portion of time of a component,
constituted by a drag over date cells, with a possible delay at the beginning of the drag.
*/
export default class DateSelecting extends Interaction {

  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  dragSelection: DateSpan | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    let dragging = this.dragging = new FeaturefulElementDragging(component.el)
    dragging.touchScrollAllowed = false
    dragging.minDistance = component.opt('selectMinDistance') || 0
    dragging.autoScroller.isEnabled = component.opt('dragScroll')

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings))
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragstart', this.handleDragStart)
    hitDragging.emitter.on('hitupdate', this.handleHitUpdate)
    hitDragging.emitter.on('pointerup', this.handlePointerUp)
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
    this.component.calendar.unselect(ev) // unselect previous selections
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {
    let calendar = this.component.calendar
    let dragSelection: DateSpan | null = null
    let isInvalid = false

    if (hit) {
      dragSelection = joinHitsIntoSelection(
        this.hitDragging.initialHit!,
        hit,
        calendar.pluginSystem.hooks.dateSelectionTransformers
      )

      if (!dragSelection || !this.component.isDateSelectionValid(dragSelection)) {
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

  handlePointerUp = (pev: PointerDragEvent) => {
    if (this.dragSelection) {

      // selection is already rendered, so just need to report selection
      this.component.calendar.triggerDateSelect(this.dragSelection, pev)

      this.dragSelection = null
    }
  }

}

function getComponentTouchDelay(component: DateComponent<any>): number {
  let delay = component.opt('selectLongPressDelay')

  if (delay == null) {
    delay = component.opt('longPressDelay')
  }

  return delay
}

function joinHitsIntoSelection(hit0: Hit, hit1: Hit, dateSelectionTransformers: dateSelectionJoinTransformer[]): DateSpan {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan
  let ms = [
    dateSpan0.range.start,
    dateSpan0.range.end,
    dateSpan1.range.start,
    dateSpan1.range.end
  ]

  ms.sort(compareNumbers)

  let props = {} as DateSpan

  for (let transformer of dateSelectionTransformers) {
    let res = transformer(hit0, hit1)

    if (res === false) {
      return null
    } else if (res) {
      __assign(props, res)
    }
  }

  props.range = { start: ms[0], end: ms[3] }
  props.allDay = dateSpan0.allDay

  return props
}

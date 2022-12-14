import {
  compareNumbers, enableCursor, disableCursor, DateComponent, Hit,
  DateSpan, PointerDragEvent, dateSelectionJoinTransformer,
  Interaction, InteractionSettings, interactionSettingsToStore,
  triggerDateSelect, isDateSelectionValid,
} from '@fullcalendar/core/internal'
import { HitDragging } from './HitDragging.js'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging.js'

/*
Tracks when the user selects a portion of time of a component,
constituted by a drag over date cells, with a possible delay at the beginning of the drag.
*/
export class DateSelecting extends Interaction {
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging
  dragSelection: DateSpan | null = null

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings
    let { options } = component.context

    let dragging = this.dragging = new FeaturefulElementDragging(settings.el)
    dragging.touchScrollAllowed = false
    dragging.minDistance = options.selectMinDistance || 0
    dragging.autoScroller.isEnabled = options.dragScroll

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
    let { options } = component.context

    let canSelect = options.selectable &&
      component.isValidDateDownEl(ev.origEvent.target as HTMLElement)

    // don't bother to watch expensive moves if component won't do selection
    dragging.setIgnoreMove(!canSelect)

    // if touch, require user to hold down
    dragging.delay = ev.isTouch ? getComponentTouchDelay(component) : null
  }

  handleDragStart = (ev: PointerDragEvent) => {
    this.component.context.calendarApi.unselect(ev) // unselect previous selections
  }

  handleHitUpdate = (hit: Hit | null, isFinal: boolean) => {
    let { context } = this.component
    let dragSelection: DateSpan | null = null
    let isInvalid = false

    if (hit) {
      let initialHit = this.hitDragging.initialHit!
      let disallowed = hit.componentId === initialHit.componentId
        && this.isHitComboAllowed
        && !this.isHitComboAllowed(initialHit, hit)

      if (!disallowed) {
        dragSelection = joinHitsIntoSelection(
          initialHit,
          hit,
          context.pluginHooks.dateSelectionTransformers,
        )
      }

      if (!dragSelection || !isDateSelectionValid(dragSelection, hit.dateProfile, context)) {
        isInvalid = true
        dragSelection = null
      }
    }

    if (dragSelection) {
      context.dispatch({ type: 'SELECT_DATES', selection: dragSelection })
    } else if (!isFinal) { // only unselect if moved away while dragging
      context.dispatch({ type: 'UNSELECT_DATES' })
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
      triggerDateSelect(this.dragSelection, pev, this.component.context)

      this.dragSelection = null
    }
  }
}

function getComponentTouchDelay(component: DateComponent<any>): number {
  let { options } = component.context
  let delay = options.selectLongPressDelay

  if (delay == null) {
    delay = options.longPressDelay
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
    dateSpan1.range.end,
  ]

  ms.sort(compareNumbers)

  let props = {} as DateSpan

  for (let transformer of dateSelectionTransformers) {
    let res = transformer(hit0, hit1)

    if (res === false) {
      return null
    }

    if (res) {
      Object.assign(props, res)
    }
  }

  props.range = { start: ms[0], end: ms[3] }
  props.allDay = dateSpan0.allDay

  return props
}

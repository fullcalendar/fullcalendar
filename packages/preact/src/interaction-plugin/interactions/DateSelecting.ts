import { compareNumbers, enableCursor, disableCursor } from '../../util/misc'
import { DateComponent } from '../../component/DateComponent'
import type { Hit } from '../../interactions/hit'
import type { DateSpan } from '../../structs/date-span'
import { getDateSpanInstantStartMs, getDateSpanInstantEndMs } from '../../structs/date-span'
import { buildValidInstanceRange } from '../../structs/event-instance'
import type { PointerDragEvent } from '../../interactions/pointer'
import type { dateSelectionJoinTransformer } from '../../interactions/date-selecting'
import { Interaction } from '../../interactions/interaction'
import type { InteractionSettings } from '../../interactions/interaction'
import { interactionSettingsToStore } from '../../interactions/interaction'
import { triggerDateSelect } from '../../calendar-utils'
import { isDateSelectionValid } from '../../validation'
import { HitDragging } from './HitDragging'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging'

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

    let canDateSelect = options.selectable &&
      component.isValidDateDownEl(ev.origEvent.target as HTMLElement)

    if (!canDateSelect) {
      dragging.cancel()
    } else {
      // if touch, require user to hold down
      dragging.delay = ev.isTouch ? getComponentTouchDelay(component) : null
    }
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
    } else {
      this.component.context.emitter.trigger('_noDateSelect')
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

function joinHitsIntoSelection(hit0: Hit, hit1: Hit, dateSelectionTransformers: dateSelectionJoinTransformer[]): DateSpan | null {
  let dateSpan0 = hit0.dateSpan
  let dateSpan1 = hit1.dateSpan

  // Only instant-aware components (currently timed timeline axes) may sort by instant, which
  // orders repeated civil times during DST fall-back correctly. For civil-only components,
  // deriving instants would reorder nonexistent spring-forward times (a civil 02:30 resolves
  // to instant 03:30, past a civil 03:00), so their edges must keep the civil marker sort.
  let hasInstants = dateSpan0.instantStartMs != null || dateSpan1.instantStartMs != null
  let entries = [
    { date: dateSpan0.range.start, ms: getDateSpanInstantStartMs(dateSpan0, hit0.context.dateEnv) },
    { date: dateSpan0.range.end, ms: getDateSpanInstantEndMs(dateSpan0, hit0.context.dateEnv) },
    { date: dateSpan1.range.start, ms: getDateSpanInstantStartMs(dateSpan1, hit1.context.dateEnv) },
    { date: dateSpan1.range.end, ms: getDateSpanInstantEndMs(dateSpan1, hit1.context.dateEnv) },
  ]

  entries.sort(hasInstants
    ? (entry0, entry1) => compareNumbers(entry0.ms, entry1.ms)
    : (entry0, entry1) => compareNumbers(entry0.date.valueOf(), entry1.date.valueOf()))

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

  if (hasInstants) {
    const validRange = buildValidInstanceRange(
      { marker: entries[0].date, instantMs: entries[0].ms },
      { marker: entries[3].date, instantMs: entries[3].ms },
      hit0.context.dateEnv,
    )

    if (!validRange) {
      return null
    }

    props.range = { start: validRange.start, end: validRange.end }
  } else {
    props.range = { start: entries[0].date, end: entries[3].date }
  }
  props.allDay = dateSpan0.allDay

  if (hasInstants) {
    props.instantStartMs = entries[0].ms
    props.instantEndMs = entries[3].ms
  }

  return props
}

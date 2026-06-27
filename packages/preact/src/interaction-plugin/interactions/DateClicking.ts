import { ViewApi } from '../../api/ViewApi'
import type { DatePointApi } from '../../structs/date-span'
import type { PointerDragEvent } from '../../interactions/pointer'
import { Interaction } from '../../interactions/interaction'
import type { InteractionSettings } from '../../interactions/interaction'
import { interactionSettingsToStore } from '../../interactions/interaction'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging'
import { HitDragging, isHitsEqual } from './HitDragging'
import { buildDatePointApiWithContext } from '../utils'

export interface DateClickInfo extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: MouseEvent
  view: ViewApi
}

/*
Monitors when the user clicks on a specific date/time of a component.
A pointerdown+pointerup on the same "hit" constitutes a click.
*/
export class DateClicking extends Interaction {
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  constructor(settings: InteractionSettings) {
    super(settings)

    // we DO want to watch pointer moves because otherwise finalHit won't get populated
    this.dragging = new FeaturefulElementDragging(settings.el)
    this.dragging.autoScroller.isEnabled = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings))
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (pev: PointerDragEvent) => {
    let { dragging } = this
    let downEl = pev.origEvent.target as HTMLElement

    /*
    If no dateClick, allow text on dates to be text-selectable
    */
    const canDateClick = this.component.context.emitter.hasHandlers('dateClick') &&
      this.component.isValidDateDownEl(downEl)

    if (!canDateClick) {
      dragging.cancel()
    }
  }

  // won't even fire if moving was ignored
  handleDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointer } = this.dragging

    if (!pointer.wasTouchScroll) {
      let { initialHit, finalHit } = this.hitDragging

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        let { context } = component
        let data: DateClickInfo = {
          ...buildDatePointApiWithContext(initialHit.dateSpan, context),
          dayEl: initialHit.getDayEl(),
          jsEvent: ev.origEvent as MouseEvent,
          view: context.viewApi || context.calendarApi.view,
        }

        context.emitter.trigger('dateClick', data)
      }
    }
  }
}

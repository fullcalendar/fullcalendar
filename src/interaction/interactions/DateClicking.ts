import { PointerDragEvent, Interaction, InteractionSettings, interactionSettingsToStore } from '@fullcalendar/core'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import HitDragging, { isHitsEqual } from './HitDragging'

/*
Monitors when the user clicks on a specific date/time of a component.
A pointerdown+pointerup on the same "hit" constitutes a click.
*/
export default class DateClicking extends Interaction {

  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  constructor(settings: InteractionSettings) {
    super(settings)
    let { component } = settings

    // we DO want to watch pointer moves because otherwise finalHit won't get populated
    this.dragging = new FeaturefulElementDragging(component.el)
    this.dragging.autoScroller.isEnabled = false

    let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings))
    hitDragging.emitter.on('pointerdown', this.handlePointerDown)
    hitDragging.emitter.on('dragend', this.handleDragEnd)
  }

  destroy() {
    this.dragging.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { dragging } = this

    // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
    dragging.setIgnoreMove(
      !this.component.isValidDateDownEl(dragging.pointer.downEl!)
    )
  }

  // won't even fire if moving was ignored
  handleDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointer } = this.dragging

    if (!pointer.wasTouchScroll) {
      let { initialHit, finalHit } = this.hitDragging

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        component.calendar.triggerDateClick(
          initialHit.dateSpan,
          initialHit.dayEl,
          component.view,
          ev.origEvent
        )
      }
    }
  }

}

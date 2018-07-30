import DateComponent from '../component/DateComponent'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import HitDragging, { isHitsEqual } from './HitDragging'
import { PointerDragEvent } from '../dnd/PointerDragging'

export default class DateClicking {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitDragging: HitDragging

  constructor(component: DateComponent) {
    this.component = component
    this.dragging = new FeaturefulElementDragging(component.el)
    this.hitDragging = new HitDragging(this.dragging, component)
    this.hitDragging.on('pointerdown', this.onPointerDown)
    this.hitDragging.on('dragend', this.onDragEnd)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointer } = this.dragging

    // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
    pointer.shouldIgnoreMove = !component.isValidDateInteraction(pointer.downEl)
  }

  onDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointer } = this.dragging

    if (
      !pointer.shouldIgnoreMove && // not ignored in onPointerDown
      !pointer.wasTouchScroll
    ) {
      let { initialHit, finalHit } = this.hitDragging

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        component.getCalendar().triggerDayClick(initialHit, initialHit.el, component.view, ev.origEvent)
      }
    }
  }

  destroy() {
    this.hitDragging.destroy()
  }

}

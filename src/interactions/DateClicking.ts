import DateComponent from '../component/DateComponent'
import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import HitDragListener, { isHitsEqual } from '../dnd/HitDragListener'
import { PointerDragEvent } from '../dnd/PointerDragging'

export default class DateClicking {

  component: DateComponent
  dragging: FeaturefulElementDragging
  hitListener: HitDragListener

  constructor(component: DateComponent) {
    this.component = component
    this.dragging = new FeaturefulElementDragging(component.el)
    this.hitListener = new HitDragListener(this.dragging, component)
    this.hitListener.on('pointerdown', this.onPointerDown)
    this.hitListener.on('dragend', this.onDragEnd)
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
      let { initialHit, finalHit } = this.hitListener

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        component.getCalendar().triggerDayClick(initialHit, initialHit.el, component.view, ev.origEvent)
      }
    }
  }

  destroy() {
    this.hitListener.destroy()
  }

}

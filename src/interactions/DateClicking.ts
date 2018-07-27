import DateComponent from '../component/DateComponent'
import { IntentfulDragListenerImpl } from '../dnd/IntentfulDragListener'
import HitDragListener, { isHitsEqual } from '../dnd/HitDragListener'
import { PointerDragEvent } from '../dnd/PointerDragListener'

export default class DateClicking {

  component: DateComponent
  dragListener: IntentfulDragListenerImpl
  hitListener: HitDragListener

  constructor(component: DateComponent) {
    this.component = component
    this.dragListener = new IntentfulDragListenerImpl(component.el)
    this.hitListener = new HitDragListener(this.dragListener, component)
    this.hitListener.on('pointerdown', this.onPointerDown)
    this.hitListener.on('dragend', this.onDragEnd)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointerListener } = this.dragListener

    // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
    pointerListener.ignoreMove = !component.isValidDateInteraction(pointerListener.downEl)
  }

  onDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let { pointerListener } = this.dragListener

    if (
      !pointerListener.ignoreMove && // not ignored in onPointerDown
      !pointerListener.isTouchScroll
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

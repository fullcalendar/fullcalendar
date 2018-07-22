import DateComponent from '../component/DateComponent'
import HitDragListener, { isHitsEqual } from '../dnd/HitDragListener'
import { PointerDragEvent } from '../dnd/PointerDragListener'

export default class DateClicking {

  component: DateComponent
  hitListener: HitDragListener

  constructor(component: DateComponent) {
    this.component = component
    this.hitListener = new HitDragListener({
      containerEl: component.el
      // don't do ignoreMove:false because finalHit needs it
    }, component)

    this.hitListener.on('dragend', this.onDragEnd)
  }

  onDragEnd = (ev: PointerDragEvent) => {
    let { component } = this
    let pointerListener = this.hitListener.dragListener.pointerListener

    if (
      !pointerListener.isTouchScroll &&
      component.isValidDateInteraction(pointerListener.downEl)
    ) {
      let { initialHit, finalHit } = this.hitListener

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        component.getCalendar().triggerDayClick(initialHit, component.view, ev.origEvent)
      }
    }
  }

  destroy() {
    this.hitListener.destroy()
  }

}

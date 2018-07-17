import InteractiveDateComponent from '../component/InteractiveDateComponent'
import HitDragListener, { isHitsEqual } from '../dnd/HitDragListener'
import { PointerDragEvent } from '../dnd/PointerDragListener'

export default class DateClicking {

  component: InteractiveDateComponent
  hitListener: HitDragListener

  constructor(component: InteractiveDateComponent) {
    this.component = component
    this.hitListener = new HitDragListener({
      containerEl: component.el
      // don't do ignoreMove:false because finalHit needs it
    }, [ component ])

    this.hitListener.on('dragend', this.onDragEnd)
  }

  onDragEnd = (ev: PointerDragEvent) => {
    if (!this.hitListener.dragListener.pointerListener.isTouchScroll) {
      let { initialHit, finalHit } = this.hitListener

      if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
        let component = initialHit.component
        component.getCalendar().triggerDayClick(initialHit, component.view, ev.origEvent)
      }
    }
  }

  destroy() {
    this.hitListener.destroy()
  }

}

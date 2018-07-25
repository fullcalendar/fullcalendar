import DateComponent from '../component/DateComponent'
import PointerDragListener from '../dnd/PointerDragListener'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'
import EventClicking from '../interactions/EventClicking'
import EventHovering from '../interactions/EventHovering'
import EventDragging from '../interactions/EventDragging'
import Calendar from '../Calendar'

// TODO: how to accept external drags?
// TODO: rename to BrowserContext?

export class GlobalContext { // TODO: rename file to something better

  pointerUpListener: PointerDragListener
  componentCnt: number = 0
  componentHash = {}
  listenerHash = {}
  selectedCalendar: Calendar // *date* selection // TODO: move to component just like eventSelected?
  eventSelectedComponent: DateComponent

  registerComponent(component: DateComponent) {
    this.componentHash[component.uid] = component

    if (!(this.componentCnt++)) {
      this.bind()
    }

    this.bindComponent(component)
  }

  unregisterComponent(component: DateComponent) {
    delete this.componentHash[component.uid]

    if (!(--this.componentCnt)) {
      this.unbind()
    }

    this.unbindComponent(component)
  }

  bind() {
    this.pointerUpListener = new PointerDragListener(document as any)
    this.pointerUpListener.ignoreMove = true
    this.pointerUpListener.on('pointerup', this.onPointerUp)
  }

  unbind() {
    this.pointerUpListener.destroy()
    this.pointerUpListener = null
  }

  bindComponent(component: DateComponent) {
    this.listenerHash[component.uid] = {
      dateClicking: new DateClicking(component),
      dateSelecting: new DateSelecting(component, globalContext),
      eventClicking: new EventClicking(component),
      eventHovering: new EventHovering(component),
      eventDragging: new EventDragging(component, globalContext)
    }
  }

  unbindComponent(component: DateComponent) {
    let listeners = this.listenerHash[component.uid]

    listeners.dateClicking.destroy()
    listeners.dateSelecting.destroy()
    listeners.eventClicking.destroy()
    listeners.eventHovering.destroy()
    listeners.eventDragging.destroy()

    delete this.listenerHash[component.uid]
  }

  onPointerUp = (ev) => {
    let { listenerHash } = this
    let { isTouchScroll, downEl } = this.pointerUpListener

    for (let id in listenerHash) {
      listenerHash[id].dateSelecting.onDocumentPointerUp(ev, isTouchScroll, downEl)
      listenerHash[id].eventDragging.onDocumentPointerUp(ev, isTouchScroll, downEl)
    }
  }

}

let globalContext = new GlobalContext()
export default globalContext

import DateComponent from '../component/DateComponent'
import PointerDragging from '../dnd/PointerDragging'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'
import EventClicking from '../interactions/EventClicking'
import EventHovering from '../interactions/EventHovering'
import EventDragging from '../interactions/EventDragging'
import EventResizing from '../interactions/EventResizing'
import Calendar from '../Calendar'

// TODO: rename to BrowserContext?

export class GlobalContext { // TODO: rename file to something better

  pointer: PointerDragging
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
    let pointer = this.pointer = new PointerDragging(document)
    pointer.shouldIgnoreMove = true
    pointer.emitter.on('pointerup', this.onPointerUp)
  }

  unbind() {
    this.pointer.destroy()
    this.pointer = null
  }

  bindComponent(component: DateComponent) {
    this.listenerHash[component.uid] = {
      dateClicking: new DateClicking(component),
      dateSelecting: new DateSelecting(component, globalContext),
      eventClicking: new EventClicking(component),
      eventHovering: new EventHovering(component),
      eventDragging: new EventDragging(component, globalContext),
      eventResizing: new EventResizing(component)
    }
  }

  unbindComponent(component: DateComponent) {
    let listeners = this.listenerHash[component.uid]

    listeners.dateClicking.destroy()
    listeners.dateSelecting.destroy()
    listeners.eventClicking.destroy()
    listeners.eventHovering.destroy()
    listeners.eventDragging.destroy()
    listeners.eventResizing.destroy()

    delete this.listenerHash[component.uid]
  }

  onPointerUp = (ev) => {
    let { listenerHash } = this
    let { wasTouchScroll, downEl } = this.pointer

    for (let id in listenerHash) {
      listenerHash[id].dateSelecting.onDocumentPointerUp(ev, wasTouchScroll, downEl)
      listenerHash[id].eventDragging.onDocumentPointerUp(ev, wasTouchScroll, downEl)
    }
  }

}

let globalContext = new GlobalContext()
export default globalContext

import DateComponent from '../component/DateComponent'
import PointerDragging, { PointerDragEvent } from '../dnd/PointerDragging'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'
import EventClicking from '../interactions/EventClicking'
import EventHovering from '../interactions/EventHovering'
import EventDragging from '../interactions/EventDragging'
import EventResizing from '../interactions/EventResizing'
import { DateSpan, buildDateSpanApi } from '../structs/date-span'
import Calendar from '../Calendar'

export class BrowserContext {

  pointer: PointerDragging
  componentCnt: number = 0
  componentHash = {}
  listenerHash = {}
  dateSelectedCalendar: Calendar
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
    pointer.shouldWatchScroll = false
    pointer.emitter.on('pointerup', this.onPointerUp)
  }

  unbind() {
    this.pointer.destroy()
    this.pointer = null
  }

  bindComponent(component: DateComponent) {
    this.listenerHash[component.uid] = {
      dateClicking: new DateClicking(component),
      dateSelecting: new DateSelecting(component),
      eventClicking: new EventClicking(component),
      eventHovering: new EventHovering(component),
      eventDragging: new EventDragging(component),
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
    let { listenerHash, pointer } = this

    // trickiness about sending pointer-up to these components:
    // pointer might be null, but if so, all components were destroyed and the following loops won't execute.
    // also, a onDocumentPointerUp call might cause the component to be destroyed, so break into separate loops
    // and freshly access listenerHash every time.

    for (let id in listenerHash) {
      listenerHash[id].dateSelecting.onDocumentPointerUp(ev, pointer.wasTouchScroll, pointer.downEl)
    }

    for (let id in listenerHash) {
      listenerHash[id].eventDragging.onDocumentPointerUp(ev, pointer.wasTouchScroll, pointer.downEl)
    }
  }

  unselectDates(pev?: PointerDragEvent) {
    let { dateSelectedCalendar } = this

    if (dateSelectedCalendar) {

      dateSelectedCalendar.dispatch({
        type: 'UNSELECT_DATES'
      })

      this.dateSelectedCalendar = null // in case publicTrigger wants to reselect

      dateSelectedCalendar.publiclyTrigger('unselect', [
        {
          jsEvent: pev ? pev.origEvent : null,
          view: dateSelectedCalendar.view
        }
      ])
    }
  }

  reportDateSelection(calendar: Calendar, selection: DateSpan, pev?: PointerDragEvent) {

    if (this.dateSelectedCalendar && this.dateSelectedCalendar !== calendar) {
      this.unselectDates(pev)
    }

    this.dateSelectedCalendar = calendar // in case publicTrigger wants to unselect

    let arg = buildDateSpanApi(selection, calendar.dateEnv)
    arg.jsEvent = pev ? pev.origEvent : null
    arg.view = calendar.view

    calendar.publiclyTrigger('select', [ arg ])
  }

  unselectEvent() {
    if (this.eventSelectedComponent) {
      this.eventSelectedComponent.getCalendar().dispatch({
        type: 'UNSELECT_EVENT'
      })
      this.eventSelectedComponent = null
    }
  }

  reportEventSelection(component: DateComponent) {
    if (
      this.eventSelectedComponent &&
      this.eventSelectedComponent.getCalendar() !== component.getCalendar()
    ) {
      this.unselectEvent()
    }

    this.eventSelectedComponent = component
  }

}

export default new BrowserContext()

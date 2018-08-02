import DateComponent from '../component/DateComponent'
import PointerDragging, { PointerDragEvent } from '../dnd/PointerDragging'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'
import EventClicking from '../interactions/EventClicking'
import EventHovering from '../interactions/EventHovering'
import EventDragging from '../interactions/EventDragging'
import EventResizing from '../interactions/EventResizing'
import { DateSpan } from '../structs/date-span'
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
    let { listenerHash } = this
    let { wasTouchScroll, downEl } = this.pointer

    for (let id in listenerHash) {
      listenerHash[id].dateSelecting.onDocumentPointerUp(ev, wasTouchScroll, downEl)
      listenerHash[id].eventDragging.onDocumentPointerUp(ev, wasTouchScroll, downEl)
    }
  }

  unselectDates(pev?: PointerDragEvent) {
    let { dateSelectedCalendar } = this

    if (dateSelectedCalendar) {

      dateSelectedCalendar.dispatch({
        type: 'UNSELECT'
      })

      dateSelectedCalendar.publiclyTrigger('unselect', [
        {
          jsEvent: pev ? pev.origEvent : null,
          view: dateSelectedCalendar.view
        }
      ])

      this.dateSelectedCalendar = null
    }
  }

  reportDateSelection(calendar: Calendar, selection: DateSpan, pev?: PointerDragEvent) {
    if (this.dateSelectedCalendar && this.dateSelectedCalendar !== calendar) {
      this.unselectDates(pev)
    }

    calendar.publiclyTrigger('select', [
      {
        start: calendar.dateEnv.toDate(selection.range.start),
        end: calendar.dateEnv.toDate(selection.range.end),
        isAllDay: selection.isAllDay,
        jsEvent: pev ? pev.origEvent : null,
        view: calendar.view
      }
    ])

    this.dateSelectedCalendar = calendar
  }

  unselectEvent() {
    if (this.eventSelectedComponent) {
      this.eventSelectedComponent.getCalendar().dispatch({
        type: 'CLEAR_SELECTED_EVENT'
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

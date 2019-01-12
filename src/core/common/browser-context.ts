import DateComponent from '../component/DateComponent'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'
import EventClicking from '../interactions/EventClicking'
import EventHovering from '../interactions/EventHovering'
import EventDragging from '../interactions/EventDragging'
import EventResizing from '../interactions/EventResizing'

export class BrowserContext {

  componentHash = {}
  listenerHash = {}

  registerComponent(component: DateComponent<any>) {
    this.componentHash[component.uid] = component
    this.bindComponent(component)
  }

  unregisterComponent(component: DateComponent<any>) {
    delete this.componentHash[component.uid]
    this.unbindComponent(component)
  }

  bindComponent(component: DateComponent<any>) {
    this.listenerHash[component.uid] = {
      dateClicking: new DateClicking(component),
      dateSelecting: new DateSelecting(component),
      eventClicking: new EventClicking(component),
      eventHovering: new EventHovering(component),
      eventDragging: new EventDragging(component),
      eventResizing: new EventResizing(component)
    }
  }

  unbindComponent(component: DateComponent<any>) {
    let listeners = this.listenerHash[component.uid]

    listeners.dateClicking.destroy()
    listeners.dateSelecting.destroy()
    listeners.eventClicking.destroy()
    listeners.eventHovering.destroy()
    listeners.eventDragging.destroy()
    listeners.eventResizing.destroy()

    delete this.listenerHash[component.uid]
  }

}

export default new BrowserContext()

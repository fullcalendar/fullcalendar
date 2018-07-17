import InteractiveDateComponent from '../component/InteractiveDateComponent'
import DateClicking from '../interactions/DateClicking'
import DateSelecting from '../interactions/DateSelecting'

let componentCnt = 0
let componentHash = {}
let listenerHash = {}

export default {

  // TODO: event hovering

  registerComponent(component: InteractiveDateComponent) {
    componentHash[component.uid] = component
    componentCnt++

    if (componentCnt === 1) {
      this.bind()
    }

    this.bindComponent(component)
  },

  unregisterComponent(component: InteractiveDateComponent) {
    delete componentHash[component.uid]
    componentCnt--

    if (componentCnt === 0) {
      this.unbind()
    }

    this.unbindComponent(component)
  },

  bind() {
    this.dateSelecting = new DateSelecting(componentHash)
  },

  unbind() {
    this.dateSelecting.destroy()
  },

  bindComponent(component: InteractiveDateComponent) {
    listenerHash[component.uid] = {
      dateClicking: new DateClicking(component)
    }
  },

  unbindComponent(component: InteractiveDateComponent) {
    let listeners = listenerHash[component.uid]
    listeners.dateClicking.destroy()
    delete listenerHash[component.uid]
  }

}

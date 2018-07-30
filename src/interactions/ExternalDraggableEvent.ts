import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalDragging from './ExternalDragging'

export interface ExternalDraggableEventSettings {
  el: HTMLElement
  event?: any
}

export default class ExternalDraggableEvent {

  externalDragging: ExternalDragging

  constructor(settings: ExternalDraggableEventSettings) {
    let dragListener = new FeaturefulElementDragging(settings.el)
    this.externalDragging = new ExternalDragging(dragListener, settings.event)
  }

  destroy() {
    this.externalDragging.destroy()
  }

}

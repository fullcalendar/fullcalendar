import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalElementDragging from './ExternalElementDragging'

export interface ExternalDraggableEventSettings {
  el: HTMLElement
  event?: any
}

export default class ExternalDraggableEvent {

  dragging: FeaturefulElementDragging

  constructor(settings: ExternalDraggableEventSettings) {
    this.dragging = new FeaturefulElementDragging(settings.el)
    new ExternalElementDragging(this.dragging, settings.event)
  }

  destroy() {
    this.dragging.destroy()
  }

}

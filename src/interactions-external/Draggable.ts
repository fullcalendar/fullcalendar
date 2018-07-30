import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalElementDragging from './ExternalElementDragging'

export interface ExternalDraggableEventSettings {
  el: HTMLElement
  event?: any
}

export default class ExternalDraggableEvent {

  externalDragging: ExternalElementDragging

  constructor(settings: ExternalDraggableEventSettings) {
    let dragging = new FeaturefulElementDragging(settings.el)
    this.externalDragging = new ExternalElementDragging(dragging, settings.event)
  }

  destroy() {
    this.externalDragging.destroy()
  }

}

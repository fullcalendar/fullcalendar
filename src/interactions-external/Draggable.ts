import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalElementDragging from './ExternalElementDragging'
import { DragMetaInput } from '../structs/drag-meta'

// TODO: somehow accept settings for FeaturefulElementDragging

export default class ExternalDraggableEvent {

  dragging: FeaturefulElementDragging

  constructor(el: HTMLElement, dragMeta?: DragMetaInput) {
    this.dragging = new FeaturefulElementDragging(el)
    new ExternalElementDragging(this.dragging, dragMeta)
  }

  destroy() {
    this.dragging.destroy()
  }

}

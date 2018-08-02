import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalElementDragging from './ExternalElementDragging'
import { DragMetaInput } from '../structs/drag-meta'

// TODO: somehow accept settings for FeaturefulElementDragging

/*
Makes an element (that is *external* to any calendar) draggable.
Can pass in data that determines how an event will be created when dropped onto a calendar.
Leverages FullCalendar's internal drag-n-drop functionality WITHOUT a third-party drag system.
*/
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

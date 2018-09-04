import FeaturefulElementDragging from '../dnd/FeaturefulElementDragging'
import ExternalElementDragging, { DragMetaGenerator } from './ExternalElementDragging'

export interface ExternalDraggableSettings {
  eventData?: DragMetaGenerator
  itemSelector?: string
  delay?: number
  minDistance?: number
  touchScrollAllowed?: boolean
}

/*
Makes an element (that is *external* to any calendar) draggable.
Can pass in data that determines how an event will be created when dropped onto a calendar.
Leverages FullCalendar's internal drag-n-drop functionality WITHOUT a third-party drag system.
*/
export default class ExternalDraggable {

  dragging: FeaturefulElementDragging

  constructor(el: HTMLElement, options: ExternalDraggableSettings = {}) {
    let dragging = this.dragging = new FeaturefulElementDragging(el)

    if (options.itemSelector != null) {
      dragging.pointer.selector = options.itemSelector
    }
    if (options.delay != null) {
      dragging.delay = options.delay
    }
    if (options.minDistance != null) {
      dragging.minDistance = options.minDistance
    }
    if (options.touchScrollAllowed != null) {
      dragging.touchScrollAllowed = options.touchScrollAllowed
    }

    new ExternalElementDragging(dragging, options.eventData)
  }

  destroy() {
    this.dragging.destroy()
  }

}

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

  constructor(el: HTMLElement, settings: ExternalDraggableSettings = {}) {
    let dragging = this.dragging = new FeaturefulElementDragging(el)

    if (settings.itemSelector != null) {
      dragging.pointer.selector = settings.itemSelector
    }
    if (settings.delay != null) {
      dragging.delay = settings.delay
    }
    if (settings.minDistance != null) {
      dragging.minDistance = settings.minDistance
    }
    if (settings.touchScrollAllowed != null) {
      dragging.touchScrollAllowed = settings.touchScrollAllowed
    }

    new ExternalElementDragging(dragging, settings.eventData)
  }

  destroy() {
    this.dragging.destroy()
  }

}

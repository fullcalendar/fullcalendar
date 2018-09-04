import ExternalElementDragging, { DragMetaGenerator } from './ExternalElementDragging'
import InferredElementDragging from './InferredElementDragging';

export interface ThirdPartyDraggableSettings {
  eventData?: DragMetaGenerator
  itemSelector?: string
  mirrorSelector?: string
}

/*
Bridges third-party drag-n-drop systems with FullCalendar.
Must be instantiated and destroyed by caller.
*/
export default class ThirdPartyDraggable {

  dragging: InferredElementDragging

  constructor(
    containerOrSettings?: EventTarget | ThirdPartyDraggableSettings,
    settings: ThirdPartyDraggableSettings = {}
  ) {
    let containerEl: EventTarget = document

    if (containerOrSettings instanceof EventTarget) {
      containerEl = containerOrSettings
    } else {
      settings = containerOrSettings || settings
    }

    let dragging = this.dragging = new InferredElementDragging(containerEl as HTMLElement)

    if (typeof settings.itemSelector === 'string') {
      dragging.pointer.selector = settings.itemSelector
    } else if (containerEl === document) {
      dragging.pointer.selector = '[data-event]'
    }

    if (typeof settings.mirrorSelector === 'string') {
      dragging.mirrorSelector = settings.mirrorSelector
    }

    new ExternalElementDragging(dragging, settings.eventData)
  }

  destroy() {
    this.dragging.destroy()
  }

}

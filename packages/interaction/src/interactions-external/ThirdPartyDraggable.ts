import { ExternalElementDragging, DragMetaGenerator } from './ExternalElementDragging.js'
import { InferredElementDragging } from './InferredElementDragging.js'

export interface ThirdPartyDraggableSettings {
  eventData?: DragMetaGenerator
  itemSelector?: string
  mirrorSelector?: string
}

/*
Bridges third-party drag-n-drop systems with FullCalendar.
Must be instantiated and destroyed by caller.
*/
export class ThirdPartyDraggable {
  dragging: InferredElementDragging

  constructor(
    containerOrSettings?: EventTarget | ThirdPartyDraggableSettings,
    settings?: ThirdPartyDraggableSettings,
  ) {
    let containerEl: EventTarget = document

    if (
      // wish we could just test instanceof EventTarget, but doesn't work in IE11
      containerOrSettings === document ||
      containerOrSettings instanceof Element
    ) {
      containerEl = containerOrSettings as EventTarget
      settings = settings || {}
    } else {
      settings = (containerOrSettings || {}) as ThirdPartyDraggableSettings
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

    let externalDragging = new ExternalElementDragging(dragging, settings.eventData)

    // The hit-detection system requires that the dnd-mirror-element be pointer-events:none,
    // but this can't be guaranteed for third-party draggables, so disable
    externalDragging.hitDragging.disablePointCheck = true
  }

  destroy() {
    this.dragging.destroy()
  }
}

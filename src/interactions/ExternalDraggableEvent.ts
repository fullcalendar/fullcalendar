import { IntentfulDragListenerImpl } from '../dnd/IntentfulDragListener'
import ExternalDragging from './ExternalDragging'

export interface ExternalDraggableEventSettings {

}

export default class ExternalDraggableEvent {

  externalDragging: ExternalDragging

  constructor(el: HTMLElement, settings: ExternalDraggableEventSettings) {
    let dragListener = new IntentfulDragListenerImpl(el)
    this.externalDragging = new ExternalDragging(dragListener)
  }

  destroy() {
    this.externalDragging.destroy()
  }

}

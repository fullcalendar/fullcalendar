import { IntentfulDragListenerImpl } from '../dnd/IntentfulDragListener'
import ExternalDragging from './ExternalDragging'

export interface ExternalDraggableEventSettings {
  el: HTMLElement
  event?: any
}

export default class ExternalDraggableEvent {

  externalDragging: ExternalDragging

  constructor(settings: ExternalDraggableEventSettings) {
    let dragListener = new IntentfulDragListenerImpl(settings.el)
    this.externalDragging = new ExternalDragging(dragListener, settings.event)
  }

  destroy() {
    this.externalDragging.destroy()
  }

}

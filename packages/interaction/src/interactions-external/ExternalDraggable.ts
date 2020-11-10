import { BASE_OPTION_DEFAULTS, PointerDragEvent } from '@fullcalendar/common'
import { FeaturefulElementDragging } from '../dnd/FeaturefulElementDragging'
import { ExternalElementDragging, DragMetaGenerator } from './ExternalElementDragging'

export interface ExternalDraggableSettings {
  eventData?: DragMetaGenerator
  itemSelector?: string
  minDistance?: number
  longPressDelay?: number
  appendTo?: HTMLElement
}

/*
Makes an element (that is *external* to any calendar) draggable.
Can pass in data that determines how an event will be created when dropped onto a calendar.
Leverages FullCalendar's internal drag-n-drop functionality WITHOUT a third-party drag system.
*/
export class ExternalDraggable {
  dragging: FeaturefulElementDragging
  settings: ExternalDraggableSettings

  constructor(el: HTMLElement, settings: ExternalDraggableSettings = {}) {
    this.settings = settings

    let dragging = this.dragging = new FeaturefulElementDragging(el)
    dragging.touchScrollAllowed = false

    if (settings.itemSelector != null) {
      dragging.pointer.selector = settings.itemSelector
    }

    if (settings.appendTo != null) {
      dragging.mirror.parentNode = settings.appendTo // TODO: write tests
    }

    dragging.emitter.on('pointerdown', this.handlePointerDown)
    dragging.emitter.on('dragstart', this.handleDragStart)

    new ExternalElementDragging(dragging, settings.eventData) // eslint-disable-line no-new
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    let { dragging } = this
    let { minDistance, longPressDelay } = this.settings

    dragging.minDistance =
      minDistance != null ?
        minDistance :
        (ev.isTouch ? 0 : BASE_OPTION_DEFAULTS.eventDragMinDistance)

    dragging.delay =
      ev.isTouch ? // TODO: eventually read eventLongPressDelay instead vvv
        (longPressDelay != null ? longPressDelay : BASE_OPTION_DEFAULTS.longPressDelay) :
        0
  }

  handleDragStart = (ev: PointerDragEvent) => {
    if (
      ev.isTouch &&
      this.dragging.delay &&
      (ev.subjectEl as HTMLElement).classList.contains('fc-event')
    ) {
      this.dragging.mirror.getMirrorEl().classList.add('fc-event-selected')
    }
  }

  destroy() {
    this.dragging.destroy()
  }
}

import { DateSelectionApi } from '@fullcalendar/core'
import {
  PointerDragEvent,
  elementClosest,
  CalendarContext,
  getEventTargetViaRoot,
} from '@fullcalendar/core/internal'
import { PointerDragging } from '../dnd/PointerDragging.js'
import { EventDragging } from './EventDragging.js'

export class UnselectAuto {
  documentPointer: PointerDragging // for unfocusing
  isRecentPointerDateSelect = false // wish we could use a selector to detect date selection, but uses hit system
  matchesCancel = false
  matchesEvent = false

  constructor(private context: CalendarContext) {
    let documentPointer = this.documentPointer = new PointerDragging(document)
    documentPointer.shouldIgnoreMove = true
    documentPointer.shouldWatchScroll = false
    documentPointer.emitter.on('pointerdown', this.onDocumentPointerDown)
    documentPointer.emitter.on('pointerup', this.onDocumentPointerUp)

    /*
    TODO: better way to know about whether there was a selection with the pointer
    */
    context.emitter.on('select', this.onSelect)
  }

  destroy() {
    this.context.emitter.off('select', this.onSelect)
    this.documentPointer.destroy()
  }

  onSelect = (selectInfo: DateSelectionApi) => {
    if (selectInfo.jsEvent) {
      this.isRecentPointerDateSelect = true
    }
  }

  onDocumentPointerDown = (pev: PointerDragEvent) => {
    let unselectCancel = this.context.options.unselectCancel
    let downEl = getEventTargetViaRoot(pev.origEvent) as HTMLElement

    this.matchesCancel = !!elementClosest(downEl, unselectCancel)
    this.matchesEvent = !!elementClosest(downEl, EventDragging.SELECTOR) // interaction started on an event?
  }

  onDocumentPointerUp = (pev: PointerDragEvent) => {
    let { context } = this
    let { documentPointer } = this
    let calendarState = context.getCurrentData()

    // touch-scrolling should never unfocus any type of selection
    if (!documentPointer.wasTouchScroll) {
      if (
        calendarState.dateSelection && // an existing date selection?
        !this.isRecentPointerDateSelect // a new pointer-initiated date selection since last onDocumentPointerUp?
      ) {
        let unselectAuto = context.options.unselectAuto

        if (unselectAuto && (!unselectAuto || !this.matchesCancel)) {
          context.calendarApi.unselect(pev)
        }
      }

      if (
        calendarState.eventSelection && // an existing event selected?
        !this.matchesEvent // interaction DIDN'T start on an event
      ) {
        context.dispatch({ type: 'UNSELECT_EVENT' })
      }
    }

    this.isRecentPointerDateSelect = false
  }
}

import {
  Calendar, DateSelectionApi,
  PointerDragEvent,
  elementClosest
} from '@fullcalendar/core'
import PointerDragging from '../dnd/PointerDragging'
import EventDragging from './EventDragging'

export default class UnselectAuto {

  calendar: Calendar
  documentPointer: PointerDragging // for unfocusing
  isRecentPointerDateSelect = false // wish we could use a selector to detect date selection, but uses hit system

  constructor(calendar: Calendar) {
    this.calendar = calendar

    let documentPointer = this.documentPointer = new PointerDragging(document)
    documentPointer.shouldIgnoreMove = true
    documentPointer.shouldWatchScroll = false
    documentPointer.emitter.on('pointerup', this.onDocumentPointerUp)

    /*
    TODO: better way to know about whether there was a selection with the pointer
    */
    calendar.on('select', this.onSelect)
  }

  destroy() {
    this.calendar.off('select', this.onSelect)
    this.documentPointer.destroy()
  }

  onSelect = (selectInfo: DateSelectionApi) => {
    if (selectInfo.jsEvent) {
      this.isRecentPointerDateSelect = true
    }
  }

  onDocumentPointerUp = (pev: PointerDragEvent) => {
    let { calendar, documentPointer } = this
    let { state } = calendar

    // touch-scrolling should never unfocus any type of selection
    if (!documentPointer.wasTouchScroll) {

      if (
        state.dateSelection && // an existing date selection?
        !this.isRecentPointerDateSelect // a new pointer-initiated date selection since last onDocumentPointerUp?
      ) {
        let unselectAuto = calendar.viewOpt('unselectAuto')
        let unselectCancel = calendar.viewOpt('unselectCancel')

        if (unselectAuto && (!unselectAuto || !elementClosest(documentPointer.downEl, unselectCancel))) {
          calendar.unselect(pev)
        }
      }

      if (
        state.eventSelection && // an existing event selected?
        !elementClosest(documentPointer.downEl, EventDragging.SELECTOR) // interaction DIDN'T start on an event
      ) {
        calendar.dispatch({ type: 'UNSELECT_EVENT' })
      }

    }

    this.isRecentPointerDateSelect = false
  }

}


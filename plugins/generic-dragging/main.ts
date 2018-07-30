import { ExternalDragging } from 'fullcalendar'
import DumbDragListener from './DumbDragListener'

let externalDragging

// TODO: protect against multiple enables/disables

window['FullCalendarGenericDragging'] = {

  enable(options) {
    let dragListener = new DumbDragListener(options || {})
    externalDragging = new ExternalDragging(dragListener)
  },

  disable() {
    if (externalDragging) {
      externalDragging.destroy()
      externalDragging = null
    }
  }

}



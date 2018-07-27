import { ExternalDragging } from 'fullcalendar'
import DumbDragListener from './DumbDragListener'

let externalDragging

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



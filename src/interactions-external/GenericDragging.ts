import ExternalDragging from './ExternalElementDragging'
import DumbElementDragging from './DumbElementDragging'

let externalDragging

// TODO: protect against multiple enables/disables

export default {

  enable(options) {
    let dragging = new DumbElementDragging(options || {})
    externalDragging = new ExternalDragging(dragging)
  },

  disable() {
    if (externalDragging) {
      externalDragging.destroy()
      externalDragging = null
    }
  }

}



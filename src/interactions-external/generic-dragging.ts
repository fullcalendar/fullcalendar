import ExternalElementDragging from './ExternalElementDragging'
import InferredElementDragging, { InferredElementDraggingSettings } from './InferredElementDragging'

/*
The public API to the system that bridges third-party drag-n-drop systems with FullCalendar.
This class is instantiated as a singleton.
*/

export class GenericDragging {

  dragging: InferredElementDragging | null = null
  externalDragging: ExternalElementDragging | null = null
  isEnabled: boolean = false

  enable(options?: InferredElementDraggingSettings) {
    if (!this.isEnabled) {
      this.isEnabled = true

      new ExternalElementDragging(
        this.dragging = new InferredElementDragging(options || {})
      )
    }
  }

  disable() {
    if (this.isEnabled) {
      this.isEnabled = false

      this.dragging!.destroy()
      this.dragging = null
    }
  }

}

export default new GenericDragging() // singleton

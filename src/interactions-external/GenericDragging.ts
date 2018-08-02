import ExternalElementDragging from './ExternalElementDragging'
import DumbElementDragging, { DumbElementDraggingSettings } from './DumbElementDragging'

// TODO: change file

export class GenericDragging {

  dragging: DumbElementDragging | null = null
  externalDragging: ExternalElementDragging | null = null
  isEnabled: boolean = false

  enable(options?: DumbElementDraggingSettings) {
    if (!this.isEnabled) {
      this.isEnabled = true

      new ExternalElementDragging(
        this.dragging = new DumbElementDragging(options || {})
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

export default new GenericDragging()

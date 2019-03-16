import { createPlugin } from '@fullcalendar/core'
import DateClicking from './interactions/DateClicking'
import DateSelecting from './interactions/DateSelecting'
import EventDragging from './interactions/EventDragging'
import EventResizing from './interactions/EventResizing'
import UnselectAuto from './interactions/UnselectAuto'
import FeaturefulElementDragging from './dnd/FeaturefulElementDragging'

export default createPlugin({
  componentInteractions: [ DateClicking, DateSelecting, EventDragging, EventResizing ],
  calendarInteractions: [ UnselectAuto ],
  elementDraggingImpl: FeaturefulElementDragging
})

export { FeaturefulElementDragging }
export { default as PointerDragging } from './dnd/PointerDragging'
export { default as Draggable } from './interactions-external/ExternalDraggable'
export { default as ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable'

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
export { default as Draggable, ExternalDraggableSettings } from './interactions-external/ExternalDraggable'
export { default as ThirdPartyDraggable, ThirdPartyDraggableSettings } from './interactions-external/ThirdPartyDraggable'
export { default as OffsetTracker } from './OffsetTracker'
export { ElementScrollGeomCache, ScrollGeomCache, WindowScrollGeomCache } from './scroll-geom-cache'
export { default as AutoScroller } from './dnd/AutoScroller'
export { default as ElementMirror } from './dnd/ElementMirror'
export { default as DateClicking } from './interactions/DateClicking'
export { default as DateSelecting } from './interactions/DateSelecting'
export { default as EventDragging } from './interactions/EventDragging'
export { default as EventResizing } from './interactions/EventResizing'
export { default as HitDragging, isHitsEqual } from './interactions/HitDragging'
export { default as UnselectAuto } from './interactions/UnselectAuto'
export { default as ExternalElementDragging, ExternalDropApi, DragMetaGenerator } from './interactions-external/ExternalElementDragging'
export { default as InferredElementDragging } from './interactions-external/InferredElementDragging'

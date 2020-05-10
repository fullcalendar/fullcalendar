import { createPlugin } from '@fullcalendar/common'
import { DateClicking } from './interactions/DateClicking'
import { DateSelecting } from './interactions/DateSelecting'
import { EventDragging } from './interactions/EventDragging'
import { EventResizing } from './interactions/EventResizing'
import { UnselectAuto } from './interactions/UnselectAuto'
import { FeaturefulElementDragging } from './dnd/FeaturefulElementDragging'
import { OPTION_REFINERS } from './options'

export default createPlugin({
  componentInteractions: [ DateClicking, DateSelecting, EventDragging, EventResizing ],
  calendarInteractions: [ UnselectAuto ],
  elementDraggingImpl: FeaturefulElementDragging,
  optionRefiners: OPTION_REFINERS
})

export { FeaturefulElementDragging }
export { PointerDragging } from './dnd/PointerDragging'
export { ExternalDraggable as Draggable } from './interactions-external/ExternalDraggable'
export { ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable'

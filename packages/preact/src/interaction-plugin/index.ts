import { PluginInput } from '../plugin-system-struct'
import { DateClicking } from './interactions/DateClicking'
import { DateSelecting } from './interactions/DateSelecting'
import { EventDragging } from './interactions/EventDragging'
import { EventResizing } from './interactions/EventResizing'
import { UnselectAuto } from './interactions/UnselectAuto'
import { FeaturefulElementDragging } from './dnd/FeaturefulElementDragging'

export default {
  name: 'interaction',
  componentInteractions: [DateClicking, DateSelecting, EventDragging, EventResizing],
  calendarInteractions: [UnselectAuto],
  elementDraggingImpl: FeaturefulElementDragging,
} as PluginInput

// real classes, not just types
export { ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable'
export { ExternalDraggable as Draggable } from './interactions-external/ExternalDraggable'

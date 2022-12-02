import { createPlugin, PluginDef } from '@fullcalendar/core'
import { DateClicking } from './interactions/DateClicking.js'
import { DateSelecting } from './interactions/DateSelecting.js'
import { EventDragging } from './interactions/EventDragging.js'
import { EventResizing } from './interactions/EventResizing.js'
import { UnselectAuto } from './interactions/UnselectAuto.js'
import { FeaturefulElementDragging } from './dnd/FeaturefulElementDragging.js'
import { OPTION_REFINERS, LISTENER_REFINERS } from './option-refiners.js'
import './ambient.js'

export default createPlugin({
  name: '<%= pkgName %>',
  componentInteractions: [DateClicking, DateSelecting, EventDragging, EventResizing],
  calendarInteractions: [UnselectAuto],
  elementDraggingImpl: FeaturefulElementDragging,
  optionRefiners: OPTION_REFINERS,
  listenerRefiners: LISTENER_REFINERS,
}) as PluginDef

export * from './public-types.js'
export { ExternalDraggable as Draggable } from './interactions-external/ExternalDraggable.js'
export { ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable.js'

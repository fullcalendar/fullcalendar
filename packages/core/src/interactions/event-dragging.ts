import { EventMutation } from '../structs/event-mutation.js'
import { Hit } from './hit.js'
import { EventDef } from '../structs/event-def.js'
import { EventUi } from '../component/event-ui.js'
import { CalendarContext } from '../CalendarContext.js'
import { Dictionary } from '../options.js'

export type eventDragMutationMassager = (mutation: EventMutation, hit0: Hit, hit1: Hit) => void
export type EventDropTransformers = (mutation: EventMutation, context: CalendarContext) => Dictionary
export type eventIsDraggableTransformer = (val: boolean, eventDef: EventDef, eventUi: EventUi, context: CalendarContext) => boolean

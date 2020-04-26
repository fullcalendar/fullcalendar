import { EventMutation } from '../structs/event-mutation'
import { Hit } from './hit'
import { EventDef } from '../structs/event-def'
import { EventUi } from '../component/event-ui'
import { ReducerContext } from '../reducers/ReducerContext'

export type eventDragMutationMassager = (mutation: EventMutation, hit0: Hit, hit1: Hit) => void
export type EventDropTransformers = (mutation: EventMutation, context: ReducerContext) => any
export type eventIsDraggableTransformer = (val: boolean, eventDef: EventDef, eventUi: EventUi, context: ReducerContext) => boolean

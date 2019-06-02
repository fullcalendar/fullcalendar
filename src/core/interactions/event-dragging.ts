import Calendar from '../Calendar'
import { EventMutation } from '../structs/event-mutation'
import { Hit } from './hit'

export type eventDragMutationMassager = (mutation: EventMutation, hit0: Hit, hit1: Hit) => void
export type EventDropTransformers = (mutation: EventMutation, calendar: Calendar) => any

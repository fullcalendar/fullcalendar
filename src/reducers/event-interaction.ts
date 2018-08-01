import { EventStore } from './event-store'
import { Seg } from '../component/DateComponent'

export interface EventInteractionState {
  affectedEvents: EventStore
  mutatedEvents: EventStore
  origSeg?: Seg
  willCreateEvent?: boolean // doesn't apply to resize :(
}

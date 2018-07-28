import { EventStore } from './event-store'
import { Seg } from '../component/DateComponent'

export interface EventInteractionState {
  eventStore: EventStore
  origSeg?: Seg
  willCreateEvent?: boolean // doesn't apply to resize :(
}

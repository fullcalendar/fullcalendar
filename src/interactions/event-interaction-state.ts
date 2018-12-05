import { EventStore } from '../structs/event-store'
import { Seg } from '../component/DateComponent'

export interface EventInteractionState { // is this ever used alone?
  affectedEvents: EventStore
  mutatedEvents: EventStore
  isEvent: boolean
  origSeg: Seg | null
}

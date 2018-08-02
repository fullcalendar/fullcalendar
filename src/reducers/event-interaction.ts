import { EventStore } from './event-store'
import { Seg } from '../component/DateComponent'

export interface EventInteractionState {
  affectedEvents: EventStore
  mutatedEvents: EventStore
  isEvent: boolean
  origSeg: Seg | null
}

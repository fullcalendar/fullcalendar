import { EventStore } from '../structs/event-store'
import { Seg } from '../component/DateComponent'
import { EventUiHash } from '../component/event-ui'

export interface EventInteractionState { // is this ever used alone?
  affectedEvents: EventStore
  mutatedEvents: EventStore
  isEvent: boolean
  origSeg: Seg | null
}

export interface EventInteractionUiState extends EventInteractionState {
  eventUis: EventUiHash
}

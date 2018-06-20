import { EventStore } from './event-store'

export interface EventResizeState {
  eventStore: EventStore
  origSeg: any
  isTouch: boolean
}

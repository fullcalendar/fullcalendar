import { EventStore } from './event-store'

export interface DragState {
  eventStore: EventStore
  origSeg: any
  isTouch: boolean
}

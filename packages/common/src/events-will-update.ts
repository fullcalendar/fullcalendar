import { EventApi } from './api/EventApi'
import { CalendarContext } from './CalendarContext'
import { EventStore } from './structs/event-store'


export interface EventsWillUpdateArg {
  addingEvent: EventApi | null
  updatingEvent: EventApi | null
  removingEvent: EventApi | null
  allEvents: EventApi[]
}


export function eventWillAdd(eventApi: EventApi, storeUpdates: EventStore, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate
  return !handler || handler({ addingEvent: eventApi } as any) !== false
}


export function eventWillUpdate(eventApi: EventApi, storeUpdates: EventStore, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate
  return !handler || handler({ updatingEvent: eventApi } as any) !== false
}


export function eventWillRemove(eventApi: EventApi, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate
  return !handler || handler({ removingEvent: eventApi } as any) !== false
}

import { EventStore } from './structs/event-store'
import { CalendarData } from './reducers/data-types'
import { EventApi, buildEventApis } from './api/EventApi'

export interface EventAddArg {
  event: EventApi
  relatedEvents: EventApi[]
  revert: () => void
}

export interface EventChangeArg {
  oldEvent: EventApi
  event: EventApi
  relatedEvents: EventApi[]
  revert: () => void
}

export interface EventRemoveArg {
  event: EventApi
  relatedEvents: EventApi[]
  revert: () => void
}

export function handleEventStore(eventStore: EventStore, context: CalendarData) {
  let { emitter } = context

  if (emitter.hasHandlers('eventsSet')) {
    emitter.trigger('eventsSet', buildEventApis(eventStore, context))
  }
}

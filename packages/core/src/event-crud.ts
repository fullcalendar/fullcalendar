import { EventStore } from './structs/event-store.js'
import { CalendarData } from './reducers/data-types.js'
import { EventImpl, buildEventApis } from './api/EventImpl.js'
import { Duration } from './datelib/duration.js'
import { ViewApi } from './index.js'

export interface EventAddArg {
  event: EventImpl
  relatedEvents: EventImpl[]
  revert: () => void
}

export interface EventChangeArg {
  oldEvent: EventImpl
  event: EventImpl
  relatedEvents: EventImpl[]
  revert: () => void
}

export interface EventDropArg extends EventChangeArg { // not best place. deals w/ UI
  el: HTMLElement
  delta: Duration
  jsEvent: MouseEvent
  view: ViewApi
  // and other "transformed" things
}

export interface EventRemoveArg {
  event: EventImpl
  relatedEvents: EventImpl[]
  revert: () => void
}

export function handleEventStore(eventStore: EventStore, context: CalendarData) {
  let { emitter } = context

  if (emitter.hasHandlers('eventsSet')) {
    emitter.trigger('eventsSet', buildEventApis(eventStore, context))
  }
}

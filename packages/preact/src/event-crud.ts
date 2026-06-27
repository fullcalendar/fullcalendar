import { EventStore } from './structs/event-store'
import { CalendarData } from './reducers/data-types'
import { EventImpl, buildEventApis } from './api/EventImpl'
import { Duration } from '@full-ui/headless-calendar'
import { ViewApi } from './index'

export interface EventAddInfo {
  event: EventImpl
  relatedEvents: EventImpl[]
  revert: () => void
}

export interface EventChangeInfo {
  oldEvent: EventImpl
  event: EventImpl
  relatedEvents: EventImpl[]
  revert: () => void
}

export interface EventDropInfo extends EventChangeInfo { // not best place. deals w/ UI
  el: HTMLElement
  delta: Duration
  jsEvent: MouseEvent
  view: ViewApi
  // and other "transformed" things
}

export interface EventRemoveInfo {
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

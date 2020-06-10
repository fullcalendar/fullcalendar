import { buildEventApis } from './CalendarApi'
import { EventApi } from './api/EventApi'
import { CalendarContext } from './CalendarContext'
import { EventStore, mergeEventStores } from './structs/event-store'
import { excludeEventsByDefId } from './reducers/eventStore'


export interface EventsWillUpdateArg {
  addingEvent: EventApi | null
  updatingEvent: EventApi | null
  removingEvent: EventApi | null
  loadingEvents: EventApi[]
  allEvents: EventApi[]
}


export function eventWillAdd(eventApi: EventApi, storeUpdates: EventStore, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate

  return !handler ||
    handler(
      createArg({ addingEvent: eventApi }, context, storeUpdates, null)
    ) !== false
}


export function eventWillUpdate(eventApi: EventApi, storeUpdates: EventStore, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate

  return !handler ||
    handler(
      createArg({ updatingEvent: eventApi }, context, storeUpdates, null)
    ) !== false
}


export function eventWillRemove(eventApi: EventApi, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate

  return !handler ||
    handler(
      createArg({ removingEvent: eventApi }, context, null, eventApi)
    ) !== false
}


export function eventsWillLoad(storeUpdates: EventStore, context: CalendarContext) {
  let handler = context.options.eventsWillUpdate

  if (handler) {
    handler(
      createArg({ loadingEvents: buildEventApis(storeUpdates, context) }, context, storeUpdates, null)
    )
  }
}


function createArg(
  props: Partial<EventsWillUpdateArg>,
  context: CalendarContext,
  eventStoreExtend: EventStore | null,
  eventRemoval: EventApi | null
): EventsWillUpdateArg {
  return {
    get allEvents(): EventApi[] { // declared first so subsequent props are merged into this orig object and getter is preserved
      return buildEventApis(
        massageEventStore(context.getCurrentData().eventStore, eventStoreExtend, eventRemoval),
        context
      )
    },
    addingEvent: null,
    updatingEvent: null,
    removingEvent: null,
    loadingEvents: [],
    ...props
  }
}


function massageEventStore(eventStore: EventStore, eventStoreExtend: EventStore | null, eventRemoval: EventApi | null) {

  if (eventStoreExtend) {
    eventStore = mergeEventStores(eventStore, eventStoreExtend)
  }

  if (eventRemoval) {
    eventStore = excludeEventsByDefId(eventStore, eventRemoval._def.defId)
  }

  return eventStore
}

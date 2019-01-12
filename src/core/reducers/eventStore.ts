import Calendar from '../Calendar'
import { filterHash, mapHash } from '../util/object'
import { EventMutation, applyMutationToEventStore } from '../structs/event-mutation'
import { EventDef, EventInstance, EventInput, EventInstanceHash } from '../structs/event'
import {
  EventStore,
  mergeEventStores,
  getRelevantEvents,
  createEmptyEventStore,
  filterEventStoreDefs,
  parseEvents,
  expandRecurring,
  transformRawEvents
} from '../structs/event-store'
import { Action } from './types'
import { EventSourceHash, EventSource } from '../structs/event-source'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import { DateEnv } from '../datelib/env'
import { EventUiHash } from '../component/event-ui'


export default function(eventStore: EventStore, action: Action, eventSources: EventSourceHash, dateProfile: DateProfile, calendar: Calendar): EventStore {
  switch (action.type) {

    case 'RECEIVE_EVENTS': // raw
      return receiveRawEvents(
        eventStore,
        eventSources[action.sourceId],
        action.fetchId,
        action.fetchRange,
        action.rawEvents,
        calendar
      )

    case 'ADD_EVENTS': // already parsed, but not expanded
      return addEvent(
        eventStore,
        action.eventStore, // new ones
        dateProfile ? dateProfile.activeRange : null,
        calendar
      )

    case 'MERGE_EVENTS': // already parsed and expanded
      return mergeEventStores(eventStore, action.eventStore)

    case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
    case 'NEXT':
    case 'SET_DATE':
    case 'SET_VIEW_TYPE':
      if (dateProfile) {
        return expandRecurring(eventStore, dateProfile.activeRange, calendar)
      } else {
        return eventStore
      }

    case 'CHANGE_TIMEZONE':
      return rezoneDates(eventStore, action.oldDateEnv, calendar.dateEnv)

    case 'MUTATE_EVENTS':
      return applyMutationToRelated(eventStore, action.instanceId, action.mutation, action.fromApi, calendar)

    case 'REMOVE_EVENT_INSTANCES':
      return excludeInstances(eventStore, action.instances)

    case 'REMOVE_EVENT_DEF':
      return filterEventStoreDefs(eventStore, function(eventDef) {
        return eventDef.defId !== action.defId
      })

    case 'REMOVE_EVENT_SOURCE':
      return excludeEventsBySourceId(eventStore, action.sourceId)

    case 'REMOVE_ALL_EVENT_SOURCES':
      return filterEventStoreDefs(eventStore, function(eventDef: EventDef) {
        return !eventDef.sourceId // only keep events with no source id
      })

    case 'REMOVE_ALL_EVENTS':
      return createEmptyEventStore()

    case 'RESET_EVENTS':
      return { // returns a new object with the same contents
        defs: eventStore.defs,
        instances: eventStore.instances
      }

    default:
      return eventStore
  }
}


function receiveRawEvents(
  eventStore: EventStore,
  eventSource: EventSource,
  fetchId: string,
  fetchRange: DateRange | null,
  rawEvents: EventInput[],
  calendar: Calendar
): EventStore {

  if (
    eventSource && // not already removed
    fetchId === eventSource.latestFetchId // TODO: wish this logic was always in event-sources
  ) {

    let subset = parseEvents(
      transformRawEvents(rawEvents, eventSource, calendar),
      eventSource.sourceId,
      calendar
    )

    if (fetchRange) {
      subset = expandRecurring(subset, fetchRange, calendar)
    }

    return mergeEventStores(
      excludeEventsBySourceId(eventStore, eventSource.sourceId),
      subset
    )
  }

  return eventStore
}


function addEvent(eventStore: EventStore, subset: EventStore, expandRange: DateRange | null, calendar: Calendar): EventStore {

  if (expandRange) {
    subset = expandRecurring(subset, expandRange, calendar)
  }

  return mergeEventStores(eventStore, subset)
}


function rezoneDates(eventStore: EventStore, oldDateEnv: DateEnv, newDateEnv: DateEnv): EventStore {
  let defs = eventStore.defs

  let instances = mapHash(eventStore.instances, function(instance: EventInstance): EventInstance {
    let def = defs[instance.defId]

    if (def.allDay || def.recurringDef) {
      return instance // isn't dependent on timezone
    } else {
      return {
        ...instance,
        range: {
          start: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start, instance.forcedStartTzo)),
          end: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end, instance.forcedEndTzo))
        },
        forcedStartTzo: newDateEnv.canComputeOffset ? null : instance.forcedStartTzo,
        forcedEndTzo: newDateEnv.canComputeOffset ? null : instance.forcedEndTzo
      }
    }
  })

  return { defs, instances }
}


function applyMutationToRelated(eventStore: EventStore, instanceId: string, mutation: EventMutation, fromApi: boolean, calendar: Calendar): EventStore {
  let relevant = getRelevantEvents(eventStore, instanceId)
  let eventConfigBase = fromApi ?
    { '': { // HACK. always allow API to mutate events
      startEditable: true,
      durationEditable: true,
      constraints: [],
      overlap: null,
      allows: [],
      backgroundColor: '',
      borderColor: '',
      textColor: '',
      classNames: []
    } } as EventUiHash :
    calendar.eventUiBases


  relevant = applyMutationToEventStore(relevant, eventConfigBase, mutation, calendar)

  return mergeEventStores(eventStore, relevant)
}


function excludeEventsBySourceId(eventStore, sourceId) {
  return filterEventStoreDefs(eventStore, function(eventDef: EventDef) {
    return eventDef.sourceId !== sourceId
  })
}


// QUESTION: why not just return instances? do a general object-property-exclusion util
export function excludeInstances(eventStore: EventStore, removals: EventInstanceHash): EventStore {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, function(instance: EventInstance) {
      return !removals[instance.instanceId]
    })
  }
}

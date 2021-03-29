import { EventInput } from '../structs/event-parse'
import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventSource, EventSourceError } from '../structs/event-source'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { DateSpan } from '../structs/date-span'
import { DateMarker } from '../datelib/marker'

export type Action =
  { type: 'NOTHING' } | // hack
  { type: 'SET_OPTION', optionName: string, rawOptionValue: any } | // TODO: how to link this to CalendarOptions?

  { type: 'PREV' } |
  { type: 'NEXT' } |
  { type: 'CHANGE_DATE', dateMarker: DateMarker } |
  { type: 'CHANGE_VIEW_TYPE', viewType: string, dateMarker?: DateMarker } |

  { type: 'SELECT_DATES', selection: DateSpan } |
  { type: 'UNSELECT_DATES' } |

  { type: 'SELECT_EVENT', eventInstanceId: string } |
  { type: 'UNSELECT_EVENT' } |

  { type: 'SET_EVENT_DRAG', state: EventInteractionState } |
  { type: 'UNSET_EVENT_DRAG' } |

  { type: 'SET_EVENT_RESIZE', state: EventInteractionState } |
  { type: 'UNSET_EVENT_RESIZE' } |

  { type: 'ADD_EVENT_SOURCES', sources: EventSource<any>[] } |
  { type: 'REMOVE_EVENT_SOURCE', sourceId: string } |
  { type: 'REMOVE_ALL_EVENT_SOURCES' } |

  { type: 'FETCH_EVENT_SOURCES', sourceIds?: string[], isRefetch?: boolean } | // if no sourceIds, fetch all

  { type: 'RECEIVE_EVENTS', sourceId: string, fetchId: string, fetchRange: DateRange | null, rawEvents: EventInput[] } |
  {
    type: 'RECEIVE_EVENT_ERROR'
    sourceId: string
    fetchId: string
    fetchRange: DateRange | null
    error: EventSourceError
  } | // need all these?

  { type: 'ADD_EVENTS', eventStore: EventStore } |
  { type: 'RESET_EVENTS', eventStore: EventStore } |
  { type: 'MERGE_EVENTS', eventStore: EventStore } |
  { type: 'REMOVE_EVENTS', eventStore: EventStore } |
  { type: 'REMOVE_ALL_EVENTS' }

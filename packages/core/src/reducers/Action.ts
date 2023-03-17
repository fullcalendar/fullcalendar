import { EventInput } from '../structs/event-parse.js'
import { DateRange } from '../datelib/date-range.js'
import { EventStore } from '../structs/event-store.js'
import { EventSource } from '../structs/event-source.js'
import { EventInteractionState } from '../interactions/event-interaction-state.js'
import { DateSpan } from '../structs/date-span.js'
import { DateMarker } from '../datelib/marker.js'

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
    error: Error
  } | // need all these?

  { type: 'ADD_EVENTS', eventStore: EventStore } |
  { type: 'RESET_EVENTS', eventStore: EventStore } |
  { type: 'RESET_RAW_EVENTS', rawEvents: EventInput[], sourceId: string } |
  { type: 'MERGE_EVENTS', eventStore: EventStore } |
  { type: 'REMOVE_EVENTS', eventStore: EventStore } |
  { type: 'REMOVE_ALL_EVENTS' }

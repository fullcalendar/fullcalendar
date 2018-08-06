import { EventInput } from '../structs/event'
import { DateRange } from '../datelib/date-range'
import { EventStore } from '../structs/event-store'
import { EventMutation } from '../structs/event-mutation'
import { DateComponentRenderState } from '../component/DateComponent'
import { EventSource, EventSourceHash } from '../structs/event-source'
import { DateProfile } from '../DateProfileGenerator'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { DateSpan } from '../structs/date-span'

export interface CalendarState extends DateComponentRenderState {
  loadingLevel: number
  eventSources: EventSourceHash
}

export interface SimpleError {
  message: string
}

export type Action =

  { type: 'SET_DATE_PROFILE', dateProfile: DateProfile  } |

  { type: 'SELECT', selection: DateSpan } |
  { type: 'UNSELECT' } |

  { type: 'SELECT_EVENT', eventInstanceId: string } |
  { type: 'CLEAR_SELECTED_EVENT' } |

  { type: 'SET_DRAG', dragState: EventInteractionState } |
  { type: 'CLEAR_DRAG' } |

  { type: 'SET_EVENT_RESIZE', eventResizeState: EventInteractionState } |
  { type: 'CLEAR_EVENT_RESIZE' } |

  { type: 'ADD_EVENT_SOURCES', sources: EventSource[] } |
  { type: 'REMOVE_EVENT_SOURCES', sourceIds?: string[] } | // if no sourceIds, remove all
  { type: 'FETCH_EVENT_SOURCES', sourceIds?: string[] } | // if no sourceIds, fetch all

  { type: 'RECEIVE_EVENTS', sourceId: string, fetchId: string, fetchRange: DateRange, rawEvents: EventInput[] } |
  { type: 'RECEIVE_EVENT_ERROR', sourceId: string, fetchId: string, fetchRange: DateRange, error: SimpleError } |

  { type: 'ADD_EVENTS', eventStore: EventStore, stick: boolean } | // TODO: use stick param
  { type: 'MUTATE_EVENTS', instanceId: string, mutation: EventMutation } |
  { type: 'REMOVE_EVENTS', eventStore: EventStore }

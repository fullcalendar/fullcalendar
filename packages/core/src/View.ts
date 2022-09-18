import { DateProfile } from './DateProfileGenerator.js'
import { EventStore } from './structs/event-store.js'
import { EventUiHash } from './component/event-ui.js'
import { sliceEventStore, EventRenderRange } from './component/event-rendering.js'
import { DateSpan } from './structs/date-span.js'
import { EventInteractionState } from './interactions/event-interaction-state.js'
import { Duration } from './datelib/duration.js'

export interface ViewProps {
  dateProfile: DateProfile
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  isHeightAuto: boolean
  forPrint: boolean
}

// HELPERS

/*
if nextDayThreshold is specified, slicing is done in an all-day fashion.
you can get nextDayThreshold from context.nextDayThreshold
*/
export function sliceEvents(
  props: ViewProps & { dateProfile: DateProfile, nextDayThreshold: Duration },
  allDay?: boolean,
): EventRenderRange[] {
  return sliceEventStore(
    props.eventStore,
    props.eventUiBases,
    props.dateProfile.activeRange,
    allDay ? props.nextDayThreshold : null,
  ).fg
}

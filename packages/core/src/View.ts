import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { ViewSpec } from './structs/view-spec'
import { EventStore } from './structs/event-store'
import { EventUiHash } from './component/event-ui'
import { sliceEventStore, EventRenderRange } from './component/event-rendering'
import { DateSpan } from './structs/date-span'
import { EventInteractionState } from './interactions/event-interaction-state'
import { __assign } from 'tslib'
import { Duration } from './datelib/duration'


export interface ViewProps {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator
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
export function sliceEvents(props: ViewProps & { nextDayThreshold: Duration }, allDay?: boolean): EventRenderRange[] {
  return sliceEventStore(
    props.eventStore,
    props.eventUiBases,
    props.dateProfile.activeRange,
    allDay ? props.nextDayThreshold : null
  ).fg
}

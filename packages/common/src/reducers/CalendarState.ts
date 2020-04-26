import { EventStore } from '../structs/event-store'
import { EventSourceHash } from '../structs/event-source'
import { DateProfile, DateProfileGenerator } from '../DateProfileGenerator'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { DateSpan } from '../structs/date-span'
import { DateMarker } from '../datelib/marker'
import { RawLocaleMap } from '../datelib/locale'
import { Theme } from '../theme/Theme'
import { ViewSpecHash, ViewSpec } from '../structs/view-spec'
import { ReducerContext } from './ReducerContext'
import { EventUiHash, EventUi } from '../component/event-ui'
import { ViewApi } from '../ViewApi'


export interface CalendarState extends ReducerContext {
  businessHours: EventStore
  calendarOptions: any // NOTE: use `options` instead. view-specific
  eventSources: EventSourceHash
  eventSourceLoadingLevel: number
  eventUiBases: EventUiHash
  loadingLevel: number
  viewType: string
  currentDate: DateMarker
  dateProfile: DateProfile | null // for the current view
  eventStore: EventStore
  renderableEventStore: EventStore
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  optionOverrides: any
  dynamicOptionOverrides: any
  availableRawLocales: RawLocaleMap
  theme: Theme
  dateProfileGenerator: DateProfileGenerator
  viewSpecs: ViewSpecHash
  toolbarConfig
  selectionConfig: EventUi
  viewSpec: ViewSpec
  viewTitle: string
  viewApi: ViewApi
}

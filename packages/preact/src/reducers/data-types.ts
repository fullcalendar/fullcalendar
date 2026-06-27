import { Action } from './Action'
import { PluginHooks } from '../plugin-system-struct'
import { DateEnv, DateMarker } from '@full-ui/headless-calendar'
import { CalendarApiImpl } from '../api/CalendarApiImpl'
import { EventSourceHash } from '../structs/event-source'
import { ViewSpecHash, ViewSpec } from '../structs/view-spec'
import { DateProfileGenerator, DateProfile } from '../DateProfileGenerator'
import { Emitter } from '../common/Emitter'
import { EventUiHash, EventUi } from '../component-util/event-ui'
import { ViewImpl } from '../api/ViewImpl'
import { EventStore } from '../structs/event-store'
import { DateSpan } from '../structs/date-span'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { CalendarOptionsRefined, ViewOptionsRefined, CalendarOptions, CalendarListeners } from '../options'
import { ToolbarModel } from '../toolbar-struct'
import { CalendarNowManager } from './CalendarNowManager'

export interface CalendarDataManagerState {
  dynamicOptionOverrides: CalendarOptions
  currentViewType: string
  currentDate: DateMarker
  dateProfile: DateProfile
  businessHours: EventStore
  eventSources: EventSourceHash
  eventUiBases: EventUiHash
  eventStore: EventStore
  renderableEventStore: EventStore
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  selectionConfig: EventUi
  nowDate: DateMarker // whole-day
}

export interface CalendarToolbarProps {
  title: string
  selectedButton: string
  navUnit: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

export interface CalendarOptionsData {
  localeDefaults: CalendarOptions
  calendarOptions: CalendarOptionsRefined
  toolbarConfig: { [toolbarName: string]: ToolbarModel }
  availableRawLocales: any
  dateEnv: DateEnv
  pluginHooks: PluginHooks
  viewSpecs: ViewSpecHash
}

export interface CalendarCurrentViewData {
  viewSpec: ViewSpec
  options: ViewOptionsRefined
  viewApi: ViewImpl
  dateProfileGenerator: DateProfileGenerator
}

type CalendarDataBase = CalendarOptionsData & CalendarCurrentViewData & CalendarDataManagerState

// needs to be an interface so we can ambient-extend
// is a superset of CalendarContext
export interface CalendarData extends CalendarDataBase {
  nowManager: CalendarNowManager
  viewTitle: string // based on current date
  calendarApi: CalendarApiImpl // TODO: try to remove this
  dispatch: (action: Action) => void
  emitter: Emitter<Required<CalendarListeners>>
  getCurrentData(): CalendarData // TODO: try to remove
  toolbarProps: CalendarToolbarProps
}

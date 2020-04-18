import { buildLocale, RawLocaleInfo, organizeRawLocales } from '../datelib/locale'
import { memoize, memoizeObjArg } from '../util/memoize'
import { Action, CalendarState } from './types'
import { PluginHooks, buildPluginHooks } from '../plugin-system'
import { DateEnv } from '../datelib/env'
import { Calendar } from '../Calendar'
import { StandardTheme } from '../theme/StandardTheme'
import { EventSourceHash } from '../structs/event-source'
import { buildViewSpecs, ViewSpec } from '../structs/view-spec'
import { mapHash, isPropsEqual } from '../util/object'
import { DateProfileGenerator } from '../DateProfileGenerator'
import { reduceViewType } from './view-type'
import { reduceCurrentDate, getInitialDate } from './current-date'
import { reduceDateProfile } from './date-profile'
import { reduceEventSources } from './eventSources'
import { reduceEventStore } from './eventStore'
import { reduceDateSelection } from './date-selection'
import { reduceSelectedEvent } from './selected-event'
import { reduceEventDrag } from './event-drag'
import { reduceEventResize } from './event-resize'
import { Emitter } from '../common/Emitter'
import { ReducerContext, buildComputedOptions } from './ReducerContext'
import { processScopedUiProps, EventUiHash, EventUi } from '../component/event-ui'
import { EventDefHash } from '../structs/event'
import { parseToolbars } from '../toolbar-parse'
import { firstDefined } from '../util/misc'
import { globalDefaults, mergeOptions } from '../options'
import { diffWholeDays } from '../datelib/marker'
import { createFormatter } from '../datelib/formatting'
import { DateRange } from '../datelib/date-range'
import { ViewApi } from '../ViewApi'


export class CalendarStateReducer {

  private buildPluginHooks = memoize(buildPluginHooks)
  private buildDateEnv = memoize(buildDateEnv)
  private buildTheme = memoize(buildTheme)
  private buildViewSpecs = memoize(buildViewSpecs)
  private buildDateProfileGenerator = memoize(buildDateProfileGenerator)
  private buildComputedOptions = memoize(buildComputedOptions)
  private buildViewUiProps = memoizeObjArg(buildViewUiProps)
  private buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)
  private parseToolbars = memoize(parseToolbars)
  private organizeRawLocales = memoize(organizeRawLocales)
  private buildCalendarOptions = memoize(mergeOptionSets)
  private buildViewOptions = memoize(mergeOptionSets)
  private computeTitle = memoize(computeTitle)
  private buildViewApi = memoize(buildViewApi)
  private buildLocale = memoize(buildLocale)


  reduce(state: CalendarState, action: Action, emitter: Emitter, calendar: Calendar): CalendarState {
    let optionOverrides = state.optionOverrides || {}
    let dynamicOptionOverrides = state.dynamicOptionOverrides || {}

    switch (action.type) {
      case 'INIT':
        optionOverrides = action.optionOverrides
        break

      case 'SET_OPTION':
        dynamicOptionOverrides = { ...dynamicOptionOverrides, [action.optionName]: action.optionValue }
        break

      case 'MUTATE_OPTIONS':
        let { updates, removals, isDynamic } = action

        if (Object.keys(updates).length || removals.length) {
          let hash = isDynamic
            ? (dynamicOptionOverrides = { ...dynamicOptionOverrides, updates })
            : (optionOverrides = { ...optionOverrides, updates })

          for (let removal of removals) {
            delete hash[removal]
          }
        }
        break
    }

    let locales = firstDefined( // explicit locale option given?
      dynamicOptionOverrides.locales,
      optionOverrides.locales,
      globalDefaults.locales
    )

    let locale = firstDefined( // explicit locales option given?
      dynamicOptionOverrides.locale,
      optionOverrides.locale,
      globalDefaults.locale
    )

    let availableLocaleData = this.organizeRawLocales(locales)
    let localeDefaults = this.buildLocale(locale || availableLocaleData.defaultCode, availableLocaleData.map).options

    let calendarOptions = this.buildCalendarOptions( // NOTE: use viewOptions mostly instead
      globalDefaults, // global defaults
      localeDefaults,
      optionOverrides,
      dynamicOptionOverrides
    )

    let pluginHooks = this.buildPluginHooks(calendarOptions.plugins)

    let prevDateEnv = state ? state.dateEnv : null
    let dateEnv = this.buildDateEnv(
      calendarOptions.timeZone,
      calendarOptions.locale,
      calendarOptions.weekNumberCalculation,
      calendarOptions.firstDay,
      calendarOptions.weekText,
      pluginHooks,
      availableLocaleData
    )
    let theme = this.buildTheme(calendarOptions, pluginHooks)

    let viewSpecs = this.buildViewSpecs(pluginHooks.views, optionOverrides, dynamicOptionOverrides, localeDefaults)
    let viewType = state.viewType || calendarOptions.initialView || pluginHooks.initialView // weird how we do INIT
    viewType = reduceViewType(viewType, action, viewSpecs)
    let viewSpec = viewSpecs[viewType]

    let viewOptions = this.buildViewOptions( // merge defaults and overrides. lowest to highest precedence
      globalDefaults, // global defaults
      viewSpec.optionDefaults,
      localeDefaults,
      optionOverrides,
      viewSpec.optionOverrides,
      dynamicOptionOverrides
    )

    emitter.setOptions(viewOptions)

    if (action.type === 'INIT') {
      emitter.trigger('_init') // for tests. needs to happen after emitter.setOptions
    }

    let dispatch = state.dispatch || calendar.dispatch.bind(calendar) // will reuse past functions! TODO: memoize? TODO: calendar should bind?
    let reducerContext: ReducerContext = {
      dateEnv,
      options: viewOptions,
      computedOptions: this.buildComputedOptions(viewOptions),
      pluginHooks,
      emitter,
      dispatch,
      calendar
    }

    let currentDate = state.currentDate || getInitialDate(viewOptions, dateEnv) // weird how we do INIT
    let dateProfileGenerator = this.buildDateProfileGenerator(viewSpec, viewOptions, dateEnv)
    let dateProfile = reduceDateProfile(state.dateProfile, action, currentDate, dateProfileGenerator)
    currentDate = reduceCurrentDate(currentDate, action, dateProfile)

    let eventSources = reduceEventSources(state.eventSources, action, dateProfile, reducerContext)
    let eventSourceLoadingLevel = computeLoadingLevel(eventSources)
    let eventStore = reduceEventStore(state.eventStore, action, eventSources, dateProfile, prevDateEnv, reducerContext)

    let renderableEventStore =
      (eventSourceLoadingLevel && !viewOptions.progressiveEventRendering) ?
        (state.renderableEventStore || eventStore) : // try from previous state
        eventStore

    let { eventUiSingleBase, selectionConfig } = this.buildViewUiProps(reducerContext)
    let eventUiBySource = this.buildEventUiBySource(eventSources)
    let eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    let prevLoadingLevel = state.loadingLevel || 0
    let loadingLevel = computeLoadingLevel(eventSources)

    if (!prevLoadingLevel && loadingLevel) {
      emitter.trigger('loading', true)
    } else if (prevLoadingLevel && !loadingLevel) {
      emitter.trigger('loading', false)
    }

    let viewTitle = this.computeTitle(dateProfile, viewOptions, dateEnv)
    let viewApi = this.buildViewApi(viewSpec.type, dateProfile, viewTitle, viewOptions, dateEnv)

    let nextState: CalendarState = {
      ...(state as object), // preserve previous state from plugin reducers. tho remove type to make sure all data is provided right now
      ...reducerContext,
      calendarOptions,
      optionOverrides,
      dynamicOptionOverrides,
      availableRawLocales: availableLocaleData.map,
      theme,
      viewSpecs,
      viewType,
      dateProfileGenerator,
      dateProfile,
      currentDate,
      eventSources,
      eventStore,
      renderableEventStore,
      eventSourceLoadingLevel,
      eventUiBases,
      selectionConfig,
      loadingLevel,
      dateSelection: reduceDateSelection(state.dateSelection, action),
      eventSelection: reduceSelectedEvent(state.eventSelection, action),
      eventDrag: reduceEventDrag(state.eventDrag, action),
      eventResize: reduceEventResize(state.eventResize, action),
      toolbarConfig: this.parseToolbars(viewOptions, optionOverrides, theme, viewSpecs, calendar),
      viewSpec,
      viewTitle,
      viewApi
    }

    for (let reducerFunc of pluginHooks.reducers) {
      nextState = reducerFunc(nextState, action, reducerContext)
    }

    return nextState
  }
}


function computeLoadingLevel(eventSources: EventSourceHash): number {
  let cnt = 0

  for (let sourceId in eventSources) {
    if (eventSources[sourceId].isFetching) {
      cnt++
    }
  }

  return cnt
}


function buildDateEnv(
  timeZone: string,
  explicitLocale: string,
  weekNumberCalculation,
  firstDay,
  weekText,
  pluginHooks: PluginHooks,
  availableLocaleData: RawLocaleInfo
) {
  let locale = buildLocale(explicitLocale || availableLocaleData.defaultCode, availableLocaleData.map)

  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone: timeZone,
    namedTimeZoneImpl: pluginHooks.namedTimeZonedImpl,
    locale,
    weekNumberCalculation,
    firstDay,
    weekText,
    cmdFormatter: pluginHooks.cmdFormatter
  })
}


function buildTheme(rawOptions, pluginHooks: PluginHooks) {
  let ThemeClass = pluginHooks.themeClasses[rawOptions.themeSystem] || StandardTheme

  return new ThemeClass(rawOptions)
}


function buildDateProfileGenerator(viewSpec: ViewSpec, viewOptions: any, dateEnv: DateEnv) {
  let DateProfileGeneratorClass = viewSpec.optionDefaults.dateProfileGeneratorClass || DateProfileGenerator

  return new DateProfileGeneratorClass(viewSpec, viewOptions, dateEnv)
}


function mergeOptionSets(...optionSets: any[]) {
  return mergeOptions(optionSets)
}


function buildViewUiProps(reducerContext: ReducerContext) {
  return {
    eventUiSingleBase: processScopedUiProps('event', reducerContext.options, reducerContext),
    selectionConfig: processScopedUiProps('select', reducerContext.options, reducerContext)
  }
}


function buildEventUiBySource(eventSources: EventSourceHash): EventUiHash {
  return mapHash(eventSources, function(eventSource) {
    return eventSource.ui
  })
}


function buildEventUiBases(eventDefs: EventDefHash, eventUiSingleBase: EventUi, eventUiBySource: EventUiHash) {
  let eventUiBases: EventUiHash = { '': eventUiSingleBase }

  for (let defId in eventDefs) {
    let def = eventDefs[defId]

    if (def.sourceId && eventUiBySource[def.sourceId]) {
      eventUiBases[defId] = eventUiBySource[def.sourceId]
    }
  }

  return eventUiBases
}


function buildViewApi(
  type: string,
  dateProfile: DateProfile,
  title: string,
  options: any,
  dateEnv: DateEnv
) {
  return new ViewApi(type, dateProfile, title, options, dateEnv)
}


// Title and Date Formatting
// -----------------------------------------------------------------------------------------------------------------


// Computes what the title at the top of the calendar should be for this view
function computeTitle(dateProfile, viewOptions, dateEnv: DateEnv) {
  let range: DateRange

  // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
  if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
    range = dateProfile.currentRange
  } else { // for day units or smaller, use the actual day range
    range = dateProfile.activeRange
  }

  return dateEnv.formatRange(
    range.start,
    range.end,
    createFormatter(
      viewOptions.titleFormat || computeTitleFormat(dateProfile),
      viewOptions.titleRangeSeparator
    ),
    { isEndExclusive: dateProfile.isRangeAllDay }
  )
}


// Generates the format string that should be used to generate the title for the current date range.
// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
function computeTitleFormat(dateProfile) {
  let currentRangeUnit = dateProfile.currentRangeUnit

  if (currentRangeUnit === 'year') {
    return { year: 'numeric' }
  } else if (currentRangeUnit === 'month') {
    return { year: 'numeric', month: 'long' } // like "September 2014"
  } else {
    let days = diffWholeDays(
      dateProfile.currentRange.start,
      dateProfile.currentRange.end
    )
    if (days !== null && days > 1) {
      // multi-day range. shorter, like "Sep 9 - 10 2014"
      return { year: 'numeric', month: 'short', day: 'numeric' }
    } else {
      // one day. longer, like "September 9 2014"
      return { year: 'numeric', month: 'long', day: 'numeric' }
    }
  }
}

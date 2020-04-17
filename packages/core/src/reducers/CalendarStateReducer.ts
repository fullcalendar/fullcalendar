import { buildLocale, RawLocaleInfo } from '../datelib/locale'
import { memoize } from '../util/memoize'
import { Action, CalendarState } from './types'
import { PluginHooks, buildPluginHooks } from '../plugin-system'
import { DateEnv } from '../datelib/env'
import { compileOptions } from '../OptionsManager'
import { Calendar } from '../Calendar'
import { StandardTheme } from '../theme/StandardTheme'
import { EventSourceHash } from '../structs/event-source'
import { buildViewSpecs, ViewSpecHash, ViewSpec } from '../structs/view-spec'
import { mapHash, isPropsEqual } from '../util/object'
import { DateProfileGenerator } from '../DateProfileGenerator'
import { reduceViewType } from './view-type'
import { reduceCurrentDate, getInitialDate, getNow } from './current-date'
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


export class CalendarStateReducer {

  private compileOptions = memoize(compileOptions)
  private buildPluginHooks = memoize(buildPluginHooks)
  private buildDateEnv = memoize(buildDateEnv)
  private buildTheme = memoize(buildTheme)
  private buildViewSpecs = memoize(buildViewSpecs)
  private buildDateProfileGenerator = memoize(buildDateProfileGenerators)
  private buildComputedOptions = memoize(buildComputedOptions)
  private buildViewUiProps = memoize(buildViewUiProps)
  private buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)
  private parseToolbars = memoize(parseToolbars)


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

    let { options, availableLocaleData } = this.compileOptions(optionOverrides, dynamicOptionOverrides)
    emitter.setOptions(options)

    let pluginHooks = this.buildPluginHooks(options.plugins)
    let viewSpecs = this.buildViewSpecs(pluginHooks.views, optionOverrides, dynamicOptionOverrides)
    let prevDateEnv = state ? state.dateEnv : null
    let dateEnv = this.buildDateEnv(
      options.timeZone,
      options.locale,
      options.weekNumberCalculation,
      options.firstDay,
      options.weekText,
      pluginHooks,
      availableLocaleData
    )
    let dateProfileGenerators = this.buildDateProfileGenerator(viewSpecs, dateEnv)
    let theme = this.buildTheme(options, pluginHooks)

    let dispatch = state.dispatch || calendar.dispatch.bind(calendar) // will reuse past functions! TODO: memoize? TODO: calendar should bind?
    let reducerContext: ReducerContext = {
      dateEnv,
      options,
      computedOptions: this.buildComputedOptions(options),
      pluginHooks,
      emitter,
      dispatch,
      calendar
    }

    let viewType = state.viewType || options.initialView || pluginHooks.initialView // weird how we do INIT
    viewType = reduceViewType(viewType, action, pluginHooks.views)

    let currentDate = state.currentDate || getInitialDate(options, dateEnv) // weird how we do INIT
    let dateProfileGenerator = dateProfileGenerators[viewType]
    let dateProfile = reduceDateProfile(state.dateProfile, action, currentDate, dateProfileGenerator)
    currentDate = reduceCurrentDate(currentDate, action, dateProfile)

    let eventSources = reduceEventSources(state.eventSources, action, dateProfile, reducerContext)
    let eventSourceLoadingLevel = computeLoadingLevel(eventSources)
    let eventStore = reduceEventStore(state.eventStore, action, eventSources, dateProfile, prevDateEnv, reducerContext)

    let renderableEventStore =
      (eventSourceLoadingLevel && !options.progressiveEventRendering) ?
        (state.renderableEventStore || eventStore) : // try from previous state
        eventStore

    let { eventUiSingleBase, selectionConfig } = this.buildViewUiProps(
      viewSpecs[viewType],
      dateEnv,
      pluginHooks,
      emitter,
      dispatch,
      calendar
    )
    let eventUiBySource = this.buildEventUiBySource(eventSources)
    let eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    let prevLoadingLevel = state.loadingLevel || 0
    let loadingLevel = computeLoadingLevel(eventSources)

    if (!prevLoadingLevel && loadingLevel) {
      emitter.trigger('loading', true)
    } else if (prevLoadingLevel && !loadingLevel) {
      emitter.trigger('loading', false)
    }

    let nextState: CalendarState = {
      ...(state as object), // preserve previous state from plugin reducers. tho remove type to make sure all data is provided right now
      ...reducerContext,
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
      toolbarConfig: this.parseToolbars(options, optionOverrides, theme, viewSpecs, calendar)
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


function buildDateProfileGenerators(viewSpecs: ViewSpecHash, dateEnv: DateEnv) {
  return mapHash(viewSpecs, (viewSpec) => {
    let DateProfileGeneratorClass = viewSpec.options.dateProfileGeneratorClass || DateProfileGenerator

    return new DateProfileGeneratorClass(viewSpec, dateEnv, getNow(viewSpec.options, dateEnv))
  })
}


function buildViewUiProps(
  viewSpec: ViewSpec,
  dateEnv: DateEnv,
  pluginHooks: PluginHooks,
  emitter: Emitter,
  dispatch: (action: Action) => void,
  calendar: Calendar
) {
  let { options } = viewSpec
  let reducerContext: ReducerContext = {
    dateEnv,
    options,
    computedOptions: buildComputedOptions(options), // bad, REPEAT work
    pluginHooks,
    emitter,
    dispatch,
    calendar
  }

  return {
    eventUiSingleBase: processScopedUiProps('event', options, reducerContext),
    selectionConfig: processScopedUiProps('select', options, reducerContext)
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

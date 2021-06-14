import { __assign } from 'tslib'
import { buildLocale, RawLocaleInfo, organizeRawLocales, LocaleSingularArg } from '../datelib/locale'
import { memoize, memoizeObjArg } from '../util/memoize'
import { Action } from './Action'
import { buildBuildPluginHooks } from '../plugin-system'
import { PluginHooks } from '../plugin-system-struct'
import { DateEnv } from '../datelib/env'
import { CalendarApi } from '../CalendarApi'
import { StandardTheme } from '../theme/StandardTheme'
import { EventSourceHash } from '../structs/event-source'
import { buildViewSpecs, ViewSpec } from '../structs/view-spec'
import { mapHash, isPropsEqual } from '../util/object'
import { DateProfileGenerator, DateProfileGeneratorProps } from '../DateProfileGenerator'
import { reduceViewType } from './view-type'
import { getInitialDate, reduceCurrentDate } from './current-date'
import { reduceDynamicOptionOverrides } from './options'
import { reduceDateProfile } from './date-profile'
import { reduceEventSources, initEventSources, reduceEventSourcesNewTimeZone, computeEventSourcesLoading } from './eventSources'
import { reduceEventStore, rezoneEventStoreDates } from './eventStore'
import { reduceDateSelection } from './date-selection'
import { reduceSelectedEvent } from './selected-event'
import { reduceEventDrag } from './event-drag'
import { reduceEventResize } from './event-resize'
import { Emitter } from '../common/Emitter'
import { EventUiHash, EventUi, createEventUi } from '../component/event-ui'
import { EventDefHash } from '../structs/event-def'
import { parseToolbars } from '../toolbar-parse'
import {
  CalendarOptionsRefined, CalendarOptions,
  CALENDAR_OPTION_REFINERS, COMPLEX_OPTION_COMPARATORS,
  ViewOptions, ViewOptionsRefined,
  BASE_OPTION_DEFAULTS, mergeRawOptions,
  BASE_OPTION_REFINERS, VIEW_OPTION_REFINERS,
  CalendarListeners, CALENDAR_LISTENER_REFINERS, Dictionary,
} from '../options'
import { rangeContainsMarker } from '../datelib/date-range'
import { ViewApi } from '../ViewApi'
import { parseBusinessHours } from '../structs/business-hours'
import { globalPlugins } from '../global-plugins'
import { createEmptyEventStore } from '../structs/event-store'
import { CalendarContext } from '../CalendarContext'
import { CalendarDataManagerState, CalendarOptionsData, CalendarCurrentViewData, CalendarData } from './data-types'
import { TaskRunner } from '../util/TaskRunner'
import { buildTitle } from './title-formatting'

export interface CalendarDataManagerProps {
  optionOverrides: CalendarOptions
  calendarApi: CalendarApi
  onAction?: (action: Action) => void
  onData?: (data: CalendarData) => void
}

export type ReducerFunc = ( // TODO: rename to CalendarDataInjector. move view-props-manip hook here as well?
  currentState: Dictionary | null,
  action: Action | null,
  context: CalendarContext & CalendarDataManagerState // more than just context
) => Dictionary

// in future refactor, do the redux-style function(state=initial) for initial-state
// also, whatever is happening in constructor, have it happen in action queue too

export class CalendarDataManager {
  private computeOptionsData = memoize(this._computeOptionsData)
  private computeCurrentViewData = memoize(this._computeCurrentViewData)
  private organizeRawLocales = memoize(organizeRawLocales)
  private buildLocale = memoize(buildLocale)
  private buildPluginHooks = buildBuildPluginHooks()
  private buildDateEnv = memoize(buildDateEnv)
  private buildTheme = memoize(buildTheme)
  private parseToolbars = memoize(parseToolbars)
  private buildViewSpecs = memoize(buildViewSpecs)
  private buildDateProfileGenerator = memoizeObjArg(buildDateProfileGenerator)
  private buildViewApi = memoize(buildViewApi)
  private buildViewUiProps = memoizeObjArg(buildViewUiProps)
  private buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)
  private parseContextBusinessHours = memoizeObjArg(parseContextBusinessHours)
  private buildTitle = memoize(buildTitle)

  public emitter = new Emitter<CalendarListeners>()
  private actionRunner = new TaskRunner(this._handleAction.bind(this), this.updateData.bind(this))
  private props: CalendarDataManagerProps
  private state: CalendarDataManagerState
  private data: CalendarData

  public currentCalendarOptionsInput: CalendarOptions = {}
  private currentCalendarOptionsRefined: CalendarOptionsRefined = ({} as any)
  private currentViewOptionsInput: ViewOptions = {}
  private currentViewOptionsRefined: ViewOptionsRefined = ({} as any)
  public currentCalendarOptionsRefiners: any = {}

  constructor(props: CalendarDataManagerProps) {
    this.props = props
    this.actionRunner.pause()

    let dynamicOptionOverrides: CalendarOptions = {}
    let optionsData = this.computeOptionsData(
      props.optionOverrides,
      dynamicOptionOverrides,
      props.calendarApi,
    )

    let currentViewType = optionsData.calendarOptions.initialView || optionsData.pluginHooks.initialView
    let currentViewData = this.computeCurrentViewData(
      currentViewType,
      optionsData,
      props.optionOverrides,
      dynamicOptionOverrides,
    )

    // wire things up
    // TODO: not DRY
    props.calendarApi.currentDataManager = this
    this.emitter.setThisContext(props.calendarApi)
    this.emitter.setOptions(currentViewData.options)

    let currentDate = getInitialDate(optionsData.calendarOptions, optionsData.dateEnv)
    let dateProfile = currentViewData.dateProfileGenerator.build(currentDate)

    if (!rangeContainsMarker(dateProfile.activeRange, currentDate)) {
      currentDate = dateProfile.currentRange.start
    }

    let calendarContext: CalendarContext = {
      dateEnv: optionsData.dateEnv,
      options: optionsData.calendarOptions,
      pluginHooks: optionsData.pluginHooks,
      calendarApi: props.calendarApi,
      dispatch: this.dispatch,
      emitter: this.emitter,
      getCurrentData: this.getCurrentData,
    }

    // needs to be after setThisContext
    for (let callback of optionsData.pluginHooks.contextInit) {
      callback(calendarContext)
    }

    // NOT DRY
    let eventSources = initEventSources(optionsData.calendarOptions, dateProfile, calendarContext)

    let initialState: CalendarDataManagerState = {
      dynamicOptionOverrides,
      currentViewType,
      currentDate,
      dateProfile,
      businessHours: this.parseContextBusinessHours(calendarContext), // weird to have this in state
      eventSources,
      eventUiBases: {},
      eventStore: createEmptyEventStore(),
      renderableEventStore: createEmptyEventStore(),
      dateSelection: null,
      eventSelection: '',
      eventDrag: null,
      eventResize: null,
      selectionConfig: this.buildViewUiProps(calendarContext).selectionConfig,
    }
    let contextAndState = { ...calendarContext, ...initialState }

    for (let reducer of optionsData.pluginHooks.reducers) {
      __assign(initialState, reducer(null, null, contextAndState))
    }

    if (computeIsLoading(initialState, calendarContext)) {
      this.emitter.trigger('loading', true) // NOT DRY
    }

    this.state = initialState
    this.updateData()
    this.actionRunner.resume()
  }

  getCurrentData = () => this.data

  dispatch = (action: Action) => {
    this.actionRunner.request(action) // protects against recursive calls to _handleAction
  }

  resetOptions(optionOverrides: CalendarOptions, append?: boolean) {
    let { props } = this

    props.optionOverrides = append
      ? { ...props.optionOverrides, ...optionOverrides }
      : optionOverrides

    this.actionRunner.request({ // hack. will cause updateData
      type: 'NOTHING',
    })
  }

  _handleAction(action: Action) {
    let { props, state, emitter } = this

    let dynamicOptionOverrides = reduceDynamicOptionOverrides(state.dynamicOptionOverrides, action)
    let optionsData = this.computeOptionsData(
      props.optionOverrides,
      dynamicOptionOverrides,
      props.calendarApi,
    )

    let currentViewType = reduceViewType(state.currentViewType, action)
    let currentViewData = this.computeCurrentViewData(
      currentViewType,
      optionsData,
      props.optionOverrides,
      dynamicOptionOverrides,
    )

    // wire things up
    // TODO: not DRY
    props.calendarApi.currentDataManager = this
    emitter.setThisContext(props.calendarApi)
    emitter.setOptions(currentViewData.options)

    let calendarContext: CalendarContext = {
      dateEnv: optionsData.dateEnv,
      options: optionsData.calendarOptions,
      pluginHooks: optionsData.pluginHooks,
      calendarApi: props.calendarApi,
      dispatch: this.dispatch,
      emitter,
      getCurrentData: this.getCurrentData,
    }

    let { currentDate, dateProfile } = state

    if (this.data && this.data.dateProfileGenerator !== currentViewData.dateProfileGenerator) { // hack
      dateProfile = currentViewData.dateProfileGenerator.build(currentDate)
    }

    currentDate = reduceCurrentDate(currentDate, action)
    dateProfile = reduceDateProfile(dateProfile, action, currentDate, currentViewData.dateProfileGenerator)

    if (
      action.type === 'PREV' || // TODO: move this logic into DateProfileGenerator
      action.type === 'NEXT' || // "
      !rangeContainsMarker(dateProfile.currentRange, currentDate)
    ) {
      currentDate = dateProfile.currentRange.start
    }

    let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendarContext)
    let eventStore = reduceEventStore(state.eventStore, action, eventSources, dateProfile, calendarContext)
    let isEventsLoading = computeEventSourcesLoading(eventSources) // BAD. also called in this func in computeIsLoading

    let renderableEventStore =
      (isEventsLoading && !currentViewData.options.progressiveEventRendering) ?
        (state.renderableEventStore || eventStore) : // try from previous state
        eventStore

    let { eventUiSingleBase, selectionConfig } = this.buildViewUiProps(calendarContext) // will memoize obj
    let eventUiBySource = this.buildEventUiBySource(eventSources)
    let eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    let newState: CalendarDataManagerState = {
      dynamicOptionOverrides,
      currentViewType,
      currentDate,
      dateProfile,
      eventSources,
      eventStore,
      renderableEventStore,
      selectionConfig,
      eventUiBases,
      businessHours: this.parseContextBusinessHours(calendarContext), // will memoize obj
      dateSelection: reduceDateSelection(state.dateSelection, action),
      eventSelection: reduceSelectedEvent(state.eventSelection, action),
      eventDrag: reduceEventDrag(state.eventDrag, action),
      eventResize: reduceEventResize(state.eventResize, action),
    }
    let contextAndState = { ...calendarContext, ...newState }

    for (let reducer of optionsData.pluginHooks.reducers) {
      __assign(newState, reducer(state, action, contextAndState)) // give the OLD state, for old value
    }

    let wasLoading = computeIsLoading(state, calendarContext)
    let isLoading = computeIsLoading(newState, calendarContext)

    // TODO: use propSetHandlers in plugin system
    if (!wasLoading && isLoading) {
      emitter.trigger('loading', true)
    } else if (wasLoading && !isLoading) {
      emitter.trigger('loading', false)
    }

    this.state = newState

    if (props.onAction) {
      props.onAction(action)
    }
  }

  updateData() {
    let { props, state } = this
    let oldData = this.data

    let optionsData = this.computeOptionsData(
      props.optionOverrides,
      state.dynamicOptionOverrides,
      props.calendarApi,
    )

    let currentViewData = this.computeCurrentViewData(
      state.currentViewType,
      optionsData,
      props.optionOverrides,
      state.dynamicOptionOverrides,
    )

    let data: CalendarData = this.data = {
      viewTitle: this.buildTitle(state.dateProfile, currentViewData.options, optionsData.dateEnv),
      calendarApi: props.calendarApi,
      dispatch: this.dispatch,
      emitter: this.emitter,
      getCurrentData: this.getCurrentData,
      ...optionsData,
      ...currentViewData,
      ...state,
    }

    let changeHandlers = optionsData.pluginHooks.optionChangeHandlers
    let oldCalendarOptions = oldData && oldData.calendarOptions
    let newCalendarOptions = optionsData.calendarOptions

    if (oldCalendarOptions && oldCalendarOptions !== newCalendarOptions) {
      if (oldCalendarOptions.timeZone !== newCalendarOptions.timeZone) {
        // hack
        state.eventSources = data.eventSources = reduceEventSourcesNewTimeZone(data.eventSources, state.dateProfile, data)
        state.eventStore = data.eventStore = rezoneEventStoreDates(data.eventStore, oldData.dateEnv, data.dateEnv)
      }

      for (let optionName in changeHandlers) {
        if (oldCalendarOptions[optionName] !== newCalendarOptions[optionName]) {
          changeHandlers[optionName](newCalendarOptions[optionName], data)
        }
      }
    }

    if (props.onData) {
      props.onData(data)
    }
  }

  _computeOptionsData(
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
    calendarApi: CalendarApi,
  ): CalendarOptionsData {
    // TODO: blacklist options that are handled by optionChangeHandlers

    let {
      refinedOptions, pluginHooks, localeDefaults, availableLocaleData, extra,
    } = this.processRawCalendarOptions(optionOverrides, dynamicOptionOverrides)

    warnUnknownOptions(extra)

    let dateEnv = this.buildDateEnv(
      refinedOptions.timeZone,
      refinedOptions.locale,
      refinedOptions.weekNumberCalculation,
      refinedOptions.firstDay,
      refinedOptions.weekText,
      pluginHooks,
      availableLocaleData,
      refinedOptions.defaultRangeSeparator,
    )

    let viewSpecs = this.buildViewSpecs(pluginHooks.views, optionOverrides, dynamicOptionOverrides, localeDefaults)
    let theme = this.buildTheme(refinedOptions, pluginHooks)
    let toolbarConfig = this.parseToolbars(refinedOptions, optionOverrides, theme, viewSpecs, calendarApi)

    return {
      calendarOptions: refinedOptions,
      pluginHooks,
      dateEnv,
      viewSpecs,
      theme,
      toolbarConfig,
      localeDefaults,
      availableRawLocales: availableLocaleData.map,
    }
  }

  // always called from behind a memoizer
  processRawCalendarOptions(optionOverrides: CalendarOptions, dynamicOptionOverrides: CalendarOptions) {
    let { locales, locale } = mergeRawOptions([
      BASE_OPTION_DEFAULTS,
      optionOverrides,
      dynamicOptionOverrides,
    ])
    let availableLocaleData = this.organizeRawLocales(locales)
    let availableRawLocales = availableLocaleData.map
    let localeDefaults = this.buildLocale(locale || availableLocaleData.defaultCode, availableRawLocales).options
    let pluginHooks = this.buildPluginHooks(optionOverrides.plugins || [], globalPlugins)
    let refiners = this.currentCalendarOptionsRefiners = {
      ...BASE_OPTION_REFINERS,
      ...CALENDAR_LISTENER_REFINERS,
      ...CALENDAR_OPTION_REFINERS,
      ...pluginHooks.listenerRefiners,
      ...pluginHooks.optionRefiners,
    }
    let extra = {}

    let raw = mergeRawOptions([
      BASE_OPTION_DEFAULTS,
      localeDefaults,
      optionOverrides,
      dynamicOptionOverrides,
    ])
    let refined: Partial<CalendarOptionsRefined> = {}
    let currentRaw = this.currentCalendarOptionsInput
    let currentRefined = this.currentCalendarOptionsRefined
    let anyChanges = false

    for (let optionName in raw) {
      if (optionName !== 'plugins') { // because plugins is special-cased
        if (
          raw[optionName] === currentRaw[optionName] ||
          (
            COMPLEX_OPTION_COMPARATORS[optionName] &&
            (optionName in currentRaw) &&
            COMPLEX_OPTION_COMPARATORS[optionName](currentRaw[optionName], raw[optionName])
          )
        ) {
          refined[optionName] = currentRefined[optionName]
        } else if (refiners[optionName]) {
          refined[optionName] = refiners[optionName](raw[optionName])
          anyChanges = true
        } else {
          extra[optionName] = currentRaw[optionName]
        }
      }
    }

    if (anyChanges) {
      this.currentCalendarOptionsInput = raw
      this.currentCalendarOptionsRefined = refined as CalendarOptionsRefined
    }

    return {
      rawOptions: this.currentCalendarOptionsInput,
      refinedOptions: this.currentCalendarOptionsRefined,
      pluginHooks,
      availableLocaleData,
      localeDefaults,
      extra,
    }
  }

  _computeCurrentViewData(
    viewType: string,
    optionsData: CalendarOptionsData,
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
  ): CalendarCurrentViewData {
    let viewSpec = optionsData.viewSpecs[viewType]

    if (!viewSpec) {
      throw new Error(`viewType "${viewType}" is not available. Please make sure you've loaded all neccessary plugins`)
    }

    let { refinedOptions, extra } = this.processRawViewOptions(
      viewSpec,
      optionsData.pluginHooks,
      optionsData.localeDefaults,
      optionOverrides,
      dynamicOptionOverrides,
    )

    warnUnknownOptions(extra)

    let dateProfileGenerator = this.buildDateProfileGenerator({
      dateProfileGeneratorClass: viewSpec.optionDefaults.dateProfileGeneratorClass as any,
      duration: viewSpec.duration,
      durationUnit: viewSpec.durationUnit,
      usesMinMaxTime: viewSpec.optionDefaults.usesMinMaxTime as any,
      dateEnv: optionsData.dateEnv,
      calendarApi: this.props.calendarApi, // should come from elsewhere?
      slotMinTime: refinedOptions.slotMinTime,
      slotMaxTime: refinedOptions.slotMaxTime,
      showNonCurrentDates: refinedOptions.showNonCurrentDates,
      dayCount: refinedOptions.dayCount,
      dateAlignment: refinedOptions.dateAlignment,
      dateIncrement: refinedOptions.dateIncrement,
      hiddenDays: refinedOptions.hiddenDays,
      weekends: refinedOptions.weekends,
      nowInput: refinedOptions.now,
      validRangeInput: refinedOptions.validRange,
      visibleRangeInput: refinedOptions.visibleRange,
      monthMode: refinedOptions.monthMode,
      fixedWeekCount: refinedOptions.fixedWeekCount,
    })

    let viewApi = this.buildViewApi(viewType, this.getCurrentData, optionsData.dateEnv)

    return { viewSpec, options: refinedOptions, dateProfileGenerator, viewApi }
  }

  processRawViewOptions(
    viewSpec: ViewSpec,
    pluginHooks: PluginHooks,
    localeDefaults: CalendarOptions,
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
  ) {
    let raw = mergeRawOptions([
      BASE_OPTION_DEFAULTS,
      viewSpec.optionDefaults,
      localeDefaults,
      optionOverrides,
      viewSpec.optionOverrides,
      dynamicOptionOverrides,
    ])
    let refiners = {
      ...BASE_OPTION_REFINERS,
      ...CALENDAR_LISTENER_REFINERS,
      ...CALENDAR_OPTION_REFINERS,
      ...VIEW_OPTION_REFINERS,
      ...pluginHooks.listenerRefiners,
      ...pluginHooks.optionRefiners,
    }
    let refined: Partial<ViewOptionsRefined> = {}
    let currentRaw = this.currentViewOptionsInput
    let currentRefined = this.currentViewOptionsRefined
    let anyChanges = false
    let extra = {}

    for (let optionName in raw) {
      if (raw[optionName] === currentRaw[optionName]) {
        refined[optionName] = currentRefined[optionName]
      } else {
        if (raw[optionName] === this.currentCalendarOptionsInput[optionName]) {
          if (optionName in this.currentCalendarOptionsRefined) { // might be an "extra" prop
            refined[optionName] = this.currentCalendarOptionsRefined[optionName]
          }
        } else if (refiners[optionName]) {
          refined[optionName] = refiners[optionName](raw[optionName])
        } else {
          extra[optionName] = raw[optionName]
        }

        anyChanges = true
      }
    }

    if (anyChanges) {
      this.currentViewOptionsInput = raw
      this.currentViewOptionsRefined = refined as ViewOptionsRefined
    }

    return {
      rawOptions: this.currentViewOptionsInput,
      refinedOptions: this.currentViewOptionsRefined,
      extra,
    }
  }
}

function buildDateEnv(
  timeZone: string,
  explicitLocale: LocaleSingularArg,
  weekNumberCalculation,
  firstDay: number | undefined,
  weekText,
  pluginHooks: PluginHooks,
  availableLocaleData: RawLocaleInfo,
  defaultSeparator: string,
) {
  let locale = buildLocale(explicitLocale || availableLocaleData.defaultCode, availableLocaleData.map)

  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone,
    namedTimeZoneImpl: pluginHooks.namedTimeZonedImpl,
    locale,
    weekNumberCalculation,
    firstDay,
    weekText,
    cmdFormatter: pluginHooks.cmdFormatter,
    defaultSeparator,
  })
}

function buildTheme(options: CalendarOptionsRefined, pluginHooks: PluginHooks) {
  let ThemeClass = pluginHooks.themeClasses[options.themeSystem] || StandardTheme

  return new ThemeClass(options)
}

function buildDateProfileGenerator(props: DateProfileGeneratorProps): DateProfileGenerator {
  let DateProfileGeneratorClass = props.dateProfileGeneratorClass || DateProfileGenerator

  return new DateProfileGeneratorClass(props)
}

function buildViewApi(type: string, getCurrentData: () => CalendarData, dateEnv: DateEnv) {
  return new ViewApi(type, getCurrentData, dateEnv)
}

function buildEventUiBySource(eventSources: EventSourceHash): EventUiHash {
  return mapHash(eventSources, (eventSource) => eventSource.ui)
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

function buildViewUiProps(calendarContext: CalendarContext) {
  let { options } = calendarContext

  return {
    eventUiSingleBase: createEventUi(
      {
        display: options.eventDisplay,
        editable: options.editable, // without "event" at start
        startEditable: options.eventStartEditable,
        durationEditable: options.eventDurationEditable,
        constraint: options.eventConstraint,
        overlap: typeof options.eventOverlap === 'boolean' ? options.eventOverlap : undefined,
        allow: options.eventAllow,
        backgroundColor: options.eventBackgroundColor,
        borderColor: options.eventBorderColor,
        textColor: options.eventTextColor,
        color: options.eventColor,
        // classNames: options.eventClassNames // render hook will handle this
      },
      calendarContext,
    ),
    selectionConfig: createEventUi(
      {
        constraint: options.selectConstraint,
        overlap: typeof options.selectOverlap === 'boolean' ? options.selectOverlap : undefined,
        allow: options.selectAllow,
      },
      calendarContext,
    ),
  }
}

function computeIsLoading(state: CalendarDataManagerState, context: CalendarContext) {
  for (let isLoadingFunc of context.pluginHooks.isLoadingFuncs) {
    if (isLoadingFunc(state)) {
      return true
    }
  }

  return false
}

function parseContextBusinessHours(calendarContext: CalendarContext) {
  return parseBusinessHours(calendarContext.options.businessHours, calendarContext)
}

function warnUnknownOptions(options: any, viewName?: string) {
  for (let optionName in options) {
    console.warn(
      `Unknown option '${optionName}'` +
      (viewName ? ` for view '${viewName}'` : ''),
    )
  }
}

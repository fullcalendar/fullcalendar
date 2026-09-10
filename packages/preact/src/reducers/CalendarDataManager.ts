import { buildLocale, RawLocaleInfo, organizeRawLocales, LocaleSingularArg } from '../datelib/locale'
import { memoize, memoizeObjArg } from '../util/memoize'
import { Action } from './Action'
import { buildBuildPluginHooks } from '../plugin-system'
import { PluginHooks } from '../plugin-system-struct'
import { DateEnv, DateMarker } from '@full-ui/headless-calendar'
import { CalendarApiImpl } from '../api/CalendarApiImpl'
import { EventSourceHash } from '../structs/event-source'
import { buildViewSpecs, ViewSpec } from '../structs/view-spec'
import { mapHash, isPropsEqualShallow } from '../util/object'
import { DateProfile, DateProfileGenerator, DateProfileGeneratorProps } from '../DateProfileGenerator'
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
import { EventUiHash, EventUi, createEventUi } from '../component-util/event-ui'
import { EventDefHash } from '../structs/event-def'
import { parseToolbars } from '../toolbar-parse'
import {
  CalendarOptionsRefined, CalendarOptions,
  CALENDAR_ONLY_OPTION_REFINERS, COMPLEX_OPTION_COMPARATORS,
  ViewOptions, ViewOptionsRefined,
  BASE_OPTION_DEFAULTS,
  BASE_OPTION_REFINERS, VIEW_ONLY_OPTION_REFINERS,
  CalendarListeners, CALENDAR_LISTENER_REFINERS, Dictionary,
} from '../options'
import { isMergedPropsEqual, mergeCalendarOptions } from '../options-manip'
import { rangeContainsMarker } from '@full-ui/headless-calendar'
import { ViewImpl } from '../api/ViewImpl'
import { parseBusinessHours } from '../structs/business-hours'
import { globalPlugins } from '../global-plugins'
import { createEmptyEventStore } from '../structs/event-store'
import { CalendarContext } from '../CalendarContext'
import { CalendarDataManagerState, CalendarOptionsData, CalendarCurrentViewData, CalendarData } from './data-types'
import { buildTitle } from './title-formatting'
import { CalendarNowManager } from './CalendarNowManager'
import { NowTimerRunner } from '../NowTimerRunner'
import { warn } from '../util/warn'

export interface CalendarDataManagerConfig {
  calendarApi: CalendarApiImpl
  onDataChange?: (data: CalendarData, actionsComplete: Action[]) => void
}

export type ReducerFunc = (
  currentState: Dictionary | undefined,
  action: Action | undefined,
  context: CalendarContext & CalendarDataManagerState // more than just context
) => Dictionary

export class CalendarDataManager {
  private computeCurrentViewData = memoize(this._computeCurrentViewData)
  private organizeRawLocales = memoize(organizeRawLocales)
  private buildLocale = memoize(buildLocale)
  private buildPluginHooks = buildBuildPluginHooks()
  private buildDateEnv = memoize(buildDateEnv)
  private parseToolbars = memoize(parseToolbars)
  private buildViewSpecs = memoize(buildViewSpecs)
  private buildDateProfileGenerator = memoizeObjArg(buildDateProfileGenerator)
  private buildViewApi = memoize(buildViewApi)
  private buildViewUiProps = memoizeObjArg(buildViewUiProps)
  private buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqualShallow)
  private buildEventUiBases = memoize(buildEventUiBases)
  private parseContextBusinessHours = memoizeObjArg(parseContextBusinessHours)
  private buildToolbarProps = memoize(buildToolbarProps)
  private buildTitle = memoize(buildTitle)

  private nowManager = new CalendarNowManager()
  private nowTimer: NowTimerRunner

  private isDrainingActionQueue = false
  private actionQueue: Action[] = []

  private optionOverrides: CalendarOptions = {}
  private config: CalendarDataManagerConfig
  private state: CalendarDataManagerState // internal state
  private data: CalendarData // internal state + computed

  // used by CalendarApiImpl
  public emitter = new Emitter<Required<CalendarListeners>>()
  public currentCalendarOptionsRefiners: any = {}
  public currentCalendarOptionsInput: CalendarOptions = {}

  private currentCalendarOptionsRefined: CalendarOptionsRefined = ({} as any)
  private currentViewOptionsInput: ViewOptions = {}
  private currentViewOptionsRefined: ViewOptionsRefined = ({} as any)

  private stableOptionOverrides: CalendarOptions
  private stableDynamicOptionOverrides: CalendarOptions
  private stableCalendarOptionsData: CalendarOptionsData
  private optionsForRefining: string[] = []
  private optionsForHandling: string[] = []

  constructor(config: CalendarDataManagerConfig) {
    this.config = config
    this.nowManager = new CalendarNowManager()
    this.nowTimer = new NowTimerRunner(this.handleNowChange)
  }

  destroy() {
    this.nowTimer.destroy()
  }

  /*
  Will NOT trigger onDataChange unless there were other actions in the queue
  */
  update(optionOverrides: CalendarOptions): CalendarData {
    this.optionOverrides = optionOverrides
    this.actionQueue.push({ type: 'IDLE' }) // ensure reducer gets called
    this.drainActionQueue()

    return this.data
  }

  /*
  WILL trigger onDataChange
  */
  resetOptions(optionOverrides: CalendarOptions, changedOptionNames?: string[]) {
    if (changedOptionNames === undefined) {
      this.optionOverrides = optionOverrides
    } else {
      this.optionOverrides = { ...this.optionOverrides, ...optionOverrides }
      this.optionsForRefining.push(...changedOptionNames)
    }

    this.dispatch({ type: 'RESET_OPTIONS' })
  }

  getCurrentData = () => this.data

  private handleNowChange = () => {
    this.dispatch({ type: 'UPDATE_NOW' })
  }

  dispatch = (action: Action) => {
    this.actionQueue.push(action)

    if (!this.isDrainingActionQueue) {
      this.drainActionQueue()
    }
  }

  private drainActionQueue() {
    let calendarContext: CalendarContext
    let { state, data } = this
    const isInit = !state

    const { actionQueue } = this
    const actionsComplete: Action[] = [] // non-idle

    this.isDrainingActionQueue = true

    while (actionQueue.length) {
      const action = actionQueue.shift()

      ;({ state, data, calendarContext } = this.reduce(state, data, action))
      this.state = state
      this.data = data

      if (action.type !== 'IDLE') {
        actionsComplete.push(action)
      }
    }

    this.isDrainingActionQueue = false

    if (isInit) {
      const controllerOption = calendarContext.options.controller
      if (controllerOption) {
        controllerOption._setApi(this.config.calendarApi)
      }
    }

    if (!isInit && actionsComplete.length) {
      const { onDataChange } = this.config
      if (onDataChange) {
        onDataChange(this.data, actionsComplete)
      }
    }
  }

  private reduce(
    prevState: CalendarDataManagerState | undefined,
    prevData: CalendarData | undefined,
    action: Action,
  ): { state: CalendarDataManagerState; data: CalendarData; calendarContext: CalendarContext } {
    let { config } = this
    let isInit = !prevState

    // === Compute options and view data ===
    let dynamicOptionOverrides = isInit
      ? {}
      : reduceDynamicOptionOverrides(prevState.dynamicOptionOverrides, action)

    let optionsData = this.computeOptionsData(
      this.optionOverrides,
      dynamicOptionOverrides,
      config.calendarApi,
    )

    let currentViewType = isInit
      ? (optionsData.calendarOptions.initialView || optionsData.pluginHooks.initialView)
      : reduceViewType(prevState.currentViewType, action)

    let currentViewData = this.computeCurrentViewData(
      currentViewType,
      optionsData,
      this.optionOverrides,
      dynamicOptionOverrides,
    )

    // === Wire things up ===
    config.calendarApi.currentDataManager = this
    this.emitter.setThisContext(config.calendarApi)
    this.emitter.setOptions(currentViewData.options)

    // === Build calendarContext ===
    let calendarContext: CalendarContext = {
      nowManager: this.nowManager,
      dateEnv: optionsData.dateEnv,
      options: optionsData.calendarOptions,
      pluginHooks: optionsData.pluginHooks,
      calendarApi: config.calendarApi,
      dispatch: this.dispatch,
      emitter: this.emitter,
      getCurrentData: this.getCurrentData,
    }

    // === Update now timer ===
    let { nowDate } = this.nowTimer.update({
      unit: 'day',
      unitValue: 1,
      nowIndicatorSnap: 'auto',
      nowManager: this.nowManager,
      dateEnv: optionsData.dateEnv,
    })

    // === Compute currentDate ===
    let currentDate = isInit
      ? getInitialDate(optionsData.calendarOptions, optionsData.dateEnv, this.nowManager)
      : reduceCurrentDate(prevState.currentDate, action)

    // === Compute dateProfile ===
    let dateProfile: DateProfile
    if (isInit) {
      dateProfile = currentViewData.dateProfileGenerator.build(currentDate, nowDate)
    } else {
      dateProfile = prevState.dateProfile
      // Check for generator change
      if (prevData && prevData.dateProfileGenerator !== currentViewData.dateProfileGenerator) {
        dateProfile = currentViewData.dateProfileGenerator.build(currentDate, nowDate)
      }
      dateProfile = reduceDateProfile(dateProfile, action, currentDate, nowDate, currentViewData.dateProfileGenerator)
    }

    // === Adjust currentDate if out of range ===
    if (
      (action && (action.type === 'PREV' || action.type === 'NEXT')) ||
      !rangeContainsMarker(dateProfile.activeRange, currentDate)
    ) {
      currentDate = dateProfile.currentDate
    }

    // === Compute eventSources, eventStore ===
    let eventSources = isInit
      ? initEventSources(optionsData.calendarOptions, dateProfile, calendarContext)
      : reduceEventSources(prevState.eventSources, action, dateProfile, calendarContext)

    let eventStore = isInit
      ? createEmptyEventStore()
      : reduceEventStore(prevState.eventStore, action, eventSources, dateProfile, calendarContext)

    // === Compute renderableEventStore ===
    let isEventsLoading = computeEventSourcesLoading(eventSources)
    let renderableEventStore = isInit
      ? createEmptyEventStore()
      : (isEventsLoading && !currentViewData.options.progressiveEventRendering)
        ? (prevState.renderableEventStore || eventStore)
        : eventStore

    // === UI computation ===
    let { eventUiSingleBase, selectionConfig } = this.buildViewUiProps(calendarContext)
    let eventUiBySource = this.buildEventUiBySource(eventSources)
    let eventUiBases = isInit
      ? {}
      : this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    // === Build new state ===
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
      businessHours: this.parseContextBusinessHours(calendarContext),
      dateSelection: isInit ? null : reduceDateSelection(prevState.dateSelection, action),
      eventSelection: isInit ? '' : reduceSelectedEvent(prevState.eventSelection, action),
      eventDrag: isInit ? null : reduceEventDrag(prevState.eventDrag, action),
      eventResize: isInit ? null : reduceEventResize(prevState.eventResize, action),
      nowDate,
    }

    // === Plugin reducers ===
    let contextAndState = { ...calendarContext, ...newState }
    for (let reducer of optionsData.pluginHooks.reducers) {
      Object.assign(newState, reducer(prevState, action, contextAndState))
    }

    // === Loading state emission ===
    let wasLoading = prevState ? computeIsLoading(prevState, calendarContext) : false
    let isLoading = computeIsLoading(newState, calendarContext)

    if (!wasLoading && isLoading) {
      this.emitter.trigger('loading', true)
    } else if (wasLoading && !isLoading) {
      this.emitter.trigger('loading', false)
    }

    // === Build CalendarData ===
    let viewTitle = this.buildTitle(dateProfile, currentViewData.options, optionsData.dateEnv)

    let toolbarProps = this.buildToolbarProps(
      currentViewData.viewSpec,
      dateProfile,
      currentViewData.dateProfileGenerator,
      currentDate,
      nowDate,
      viewTitle,
    )

    let newData: CalendarData = {
      viewTitle,
      nowManager: this.nowManager,
      calendarApi: config.calendarApi,
      dispatch: this.dispatch,
      emitter: this.emitter,
      getCurrentData: this.getCurrentData,
      toolbarProps,
      ...optionsData,
      ...currentViewData,
      ...newState,
    }

    // === Handle option changes ===
    let changeHandlers = optionsData.pluginHooks.optionChangeHandlers
    let prevCalendarOptions = prevData && prevData.calendarOptions
    let newCalendarOptions = optionsData.calendarOptions

    if (prevCalendarOptions && prevCalendarOptions !== newCalendarOptions) {
      if (prevCalendarOptions.timeZone !== newCalendarOptions.timeZone) {
        // HACK
        newState.eventSources = newData.eventSources = reduceEventSourcesNewTimeZone(newData.eventSources, dateProfile, newData)
        newState.eventStore = newData.eventStore = rezoneEventStoreDates(newData.eventStore, prevData!.dateEnv, newData.dateEnv)
        newState.renderableEventStore = newData.renderableEventStore = rezoneEventStoreDates(newData.renderableEventStore, prevData!.dateEnv, newData.dateEnv)
      }

      for (let optionName in changeHandlers) {
        if (
          this.optionsForHandling.indexOf(optionName) !== -1 ||
          prevCalendarOptions[optionName] !== newCalendarOptions[optionName]
        ) {
          changeHandlers[optionName](newCalendarOptions[optionName], newData)
        }
      }
    }

    this.optionsForHandling = []

    return { state: newState, data: newData, calendarContext }
  }

  private computeOptionsData(
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
    calendarApi: CalendarApiImpl,
  ): CalendarOptionsData {
    // TODO: blacklist options that are handled by optionChangeHandlers

    if (
      !this.optionsForRefining.length &&
      optionOverrides === this.stableOptionOverrides &&
      dynamicOptionOverrides === this.stableDynamicOptionOverrides
    ) {
      return this.stableCalendarOptionsData
    }

    let {
      refinedOptions, pluginHooks, localeDefaults, availableLocaleData,
    } = this.processRawCalendarOptions(optionOverrides, dynamicOptionOverrides)

    let dateEnv = this.buildDateEnv(
      refinedOptions.timeZone,
      refinedOptions.locale,
      refinedOptions.weekNumberCalculation,
      refinedOptions.firstDay,
      refinedOptions.weekTextLong,
      refinedOptions.weekTextShort,
      pluginHooks,
      availableLocaleData,
    )

    let viewSpecs = this.buildViewSpecs(pluginHooks.views, this.stableOptionOverrides, this.stableDynamicOptionOverrides)
    let toolbarConfig = this.parseToolbars(refinedOptions, viewSpecs, calendarApi)

    return this.stableCalendarOptionsData = {
      calendarOptions: refinedOptions,
      pluginHooks,
      dateEnv,
      viewSpecs,
      toolbarConfig,
      localeDefaults,
      availableRawLocales: availableLocaleData.map,
    }
  }

  // always called from behind a memoizer
  private processRawCalendarOptions(optionOverrides: CalendarOptions, dynamicOptionOverrides: CalendarOptions) {
    let { locales, locale } = mergeCalendarOptions(
      BASE_OPTION_DEFAULTS as any,
      optionOverrides,
      dynamicOptionOverrides,
    )
    let availableLocaleData = this.organizeRawLocales(locales)
    let availableRawLocales = availableLocaleData.map
    let localeDefaults = this.buildLocale(locale || availableLocaleData.defaultCode, availableRawLocales).options
    let pluginHooks = this.buildPluginHooks(optionOverrides.plugins || [], globalPlugins)

    let refiners = this.currentCalendarOptionsRefiners = {
      ...BASE_OPTION_REFINERS,
      ...CALENDAR_LISTENER_REFINERS,
      ...CALENDAR_ONLY_OPTION_REFINERS,
      ...pluginHooks.listenerRefiners,
      ...pluginHooks.optionRefiners,
    }
    let raw = mergeCalendarOptions(
      BASE_OPTION_DEFAULTS as any,
      ...pluginHooks.optionDefaults,
      localeDefaults,
      filterKnownOptions(
        mergeCalendarOptions(
          optionOverrides,
          dynamicOptionOverrides,
        ),
        refiners,
      )
    )

    let refined: Partial<CalendarOptionsRefined> = {}
    let currentRaw = this.currentCalendarOptionsInput
    let currentRefined = this.currentCalendarOptionsRefined
    let anyChanges = false

    for (let optionName in raw) {
      if (
        this.optionsForRefining.indexOf(optionName) === -1 && (
          raw[optionName] === currentRaw[optionName] || (
            COMPLEX_OPTION_COMPARATORS[optionName] &&
            (optionName in currentRaw) &&
            COMPLEX_OPTION_COMPARATORS[optionName](currentRaw[optionName], raw[optionName])
          ) || isMergedPropsEqual(currentRaw[optionName], raw[optionName])
        )
      ) {
        refined[optionName] = currentRefined[optionName]
      } else if (refiners[optionName]) {
        refined[optionName] = refiners[optionName](raw[optionName], optionName)
        anyChanges = true
      }
    }

    if (anyChanges) {
      this.currentCalendarOptionsInput = raw
      this.currentCalendarOptionsRefined = refined as CalendarOptionsRefined

      this.stableOptionOverrides = optionOverrides
      this.stableDynamicOptionOverrides = dynamicOptionOverrides
    }

    this.optionsForHandling.push(...this.optionsForRefining)
    this.optionsForRefining = []

    return {
      rawOptions: this.currentCalendarOptionsInput,
      refinedOptions: this.currentCalendarOptionsRefined,
      pluginHooks,
      availableLocaleData,
      localeDefaults,
    }
  }

  private _computeCurrentViewData(
    viewType: string,
    optionsData: CalendarOptionsData,
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
  ): CalendarCurrentViewData {
    let viewSpec = optionsData.viewSpecs[viewType]

    if (!viewSpec) {
      throw new Error(`viewType "${viewType}" is not available. Please make sure you've loaded all neccessary plugins`)
    }

    let { refinedOptions } = this.processRawViewOptions(
      viewSpec,
      optionsData.pluginHooks,
      optionsData.localeDefaults,
      optionOverrides,
      dynamicOptionOverrides,
    )

    this.nowManager.handleInput(optionsData.dateEnv, refinedOptions.now)

    let dateProfileGenerator = this.buildDateProfileGenerator({
      dateProfileGeneratorClass: viewSpec.optionDefaults.dateProfileGeneratorClass as any,
      duration: viewSpec.duration,
      durationUnit: viewSpec.durationUnit,
      usesMinMaxTime: viewSpec.optionDefaults.usesMinMaxTime as any,
      dateEnv: optionsData.dateEnv,
      calendarApi: this.config.calendarApi,
      slotMinTime: refinedOptions.slotMinTime,
      slotMaxTime: refinedOptions.slotMaxTime,
      showNonCurrentDates: refinedOptions.showNonCurrentDates,
      dayCount: refinedOptions.dayCount,
      dateAlignment: refinedOptions.dateAlignment,
      dateIncrement: refinedOptions.dateIncrement,
      hiddenDays: refinedOptions.hiddenDays,
      weekends: refinedOptions.weekends,
      validRangeInput: refinedOptions.validRange,
      visibleRangeInput: refinedOptions.visibleRange,
      fixedWeekCount: refinedOptions.fixedWeekCount,
    })

    let viewApi = this.buildViewApi(viewType, this.getCurrentData, optionsData.dateEnv)

    return { viewSpec, options: refinedOptions, dateProfileGenerator, viewApi }
  }

  private processRawViewOptions(
    viewSpec: ViewSpec,
    pluginHooks: PluginHooks,
    localeDefaults: CalendarOptions,
    optionOverrides: CalendarOptions,
    dynamicOptionOverrides: CalendarOptions,
  ) {
    let refiners = {
      ...BASE_OPTION_REFINERS,
      ...CALENDAR_LISTENER_REFINERS,
      ...CALENDAR_ONLY_OPTION_REFINERS,
      ...VIEW_ONLY_OPTION_REFINERS,
      ...pluginHooks.listenerRefiners,
      ...pluginHooks.optionRefiners,
    }
    let raw = mergeCalendarOptions(
      BASE_OPTION_DEFAULTS as any,
      ...pluginHooks.optionDefaults,
      viewSpec.optionDefaults,
      localeDefaults,
      filterKnownOptions(
        mergeCalendarOptions(
          optionOverrides,
          viewSpec.optionOverrides,
          dynamicOptionOverrides,
        ),
        refiners,
      ),
    )
    let refined: Partial<ViewOptionsRefined> = {}
    let currentRaw = this.currentViewOptionsInput
    let currentRefined = this.currentViewOptionsRefined
    let anyChanges = false

    for (let optionName in raw) {
      if (
        raw[optionName] === currentRaw[optionName] || (
          COMPLEX_OPTION_COMPARATORS[optionName] &&
          COMPLEX_OPTION_COMPARATORS[optionName](raw[optionName], currentRaw[optionName])
        ) || isMergedPropsEqual(currentRaw[optionName], raw[optionName])
      ) {
        refined[optionName] = currentRefined[optionName]
      } else {
        if (
          raw[optionName] === this.currentCalendarOptionsInput[optionName] ||
          (COMPLEX_OPTION_COMPARATORS[optionName] &&
            COMPLEX_OPTION_COMPARATORS[optionName](raw[optionName], this.currentCalendarOptionsInput[optionName]))
        ) {
          if (optionName in this.currentCalendarOptionsRefined) { // might be an "extra" prop
            refined[optionName] = this.currentCalendarOptionsRefined[optionName]
          }
        } else if (refiners[optionName]) {
          refined[optionName] = refiners[optionName](raw[optionName], optionName)
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
    }
  }
}

function buildDateEnv(
  timeZone: string,
  explicitLocale: LocaleSingularArg,
  weekNumberCalculation,
  firstDay: number | undefined,
  weekTextLong,
  weekTextShort,
  pluginHooks: PluginHooks,
  availableLocaleData: RawLocaleInfo,
) {
  let locale = buildLocale(explicitLocale || availableLocaleData.defaultCode, availableLocaleData.map)

  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone,
    locale,
    weekNumberCalculation,
    firstDay,
    weekTextLong,
    weekTextShort,
    cmdFormatter: pluginHooks.cmdFormatter,
  })
}

function buildDateProfileGenerator(props: DateProfileGeneratorProps): DateProfileGenerator {
  let DateProfileGeneratorClass = props.dateProfileGeneratorClass || DateProfileGenerator

  return new DateProfileGeneratorClass(props)
}

function buildViewApi(type: string, getCurrentData: () => CalendarData, dateEnv: DateEnv) {
  return new ViewImpl(type, getCurrentData, dateEnv)
}

function buildEventUiBySource(eventSources: EventSourceHash): EventUiHash {
  return mapHash(eventSources, (eventSource) => eventSource.ui)
}

/*
The result of this is processed by compileEventUi
*/
function buildEventUiBases(
  eventDefs: EventDefHash,
  eventUiSingleBase: EventUi,
  eventUiBySource: EventUiHash,
) {
  let eventUiBases: EventUiHash = {
    '': eventUiSingleBase, // fallback
  }

  for (let defId in eventDefs) {
    let def = eventDefs[defId]

    if (def.sourceId && eventUiBySource[def.sourceId]) {
      eventUiBases[defId] = eventUiBySource[def.sourceId]
    }
  }

  return eventUiBases
}

function buildViewUiProps(calendarContext: CalendarContext) {
  const { options } = calendarContext

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
        // color: options.eventColor, // StandardEvent/BgEvent will handle this
        // contrastColor: options.eventContrastColor, // StandardEvent/BgEvent will handle this
        // className: options.eventClass // render hook will handle this
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

const warnedUnknownOptions: { [optionName: string]: true } = {}

function filterKnownOptions(options: any, optionRefiners: any): any {
  const knownOptions: any = {}

  for (const optionName in options) {
    if (optionRefiners[optionName]) {
      knownOptions[optionName] = options[optionName]
    } else if (!warnedUnknownOptions[optionName]) {
      warn(`Unknown option \`${optionName}\`.`)
      warnedUnknownOptions[optionName] = true
    }
  }

  return knownOptions
}

export interface CalendarToolbarProps {
  title: string
  selectedButton: string
  navUnit: string
  isTodayEnabled: boolean
  isPrevEnabled: boolean
  isNextEnabled: boolean
}

function buildToolbarProps(
  viewSpec: ViewSpec,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  currentDate: DateMarker,
  nowDate: DateMarker,
  title: string,
): CalendarToolbarProps {
  // don't force any date-profiles to valid date profiles (the `false`) so that we can tell if it's invalid
  let todayInfo = dateProfileGenerator.build(nowDate, nowDate, undefined, /* forceToValid = */ false)
  let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate, nowDate, /* forceToValid = */ false)
  let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate, nowDate, /* forceToValid = */ false)

  return {
    title,
    selectedButton: viewSpec.type,
    navUnit: viewSpec.singleUnit,
    isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, nowDate),
    isPrevEnabled: prevInfo.isValid,
    isNextEnabled: nextInfo.isValid,
  }
}

import { listenBySelector } from './util/dom-event'
import { capitaliseFirstLetter, debounce } from './util/misc'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import OptionsManager from './OptionsManager'
import View from './View'
import Theme from './theme/Theme'
import { OptionsInput, EventHandlerName, EventHandlerArgs } from './types/input-types'
import { Locale, buildLocale, parseRawLocales, RawLocaleMap } from './datelib/locale'
import { DateEnv, DateInput } from './datelib/env'
import { DateMarker, startOfDay } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { Duration, createDuration, DurationInput } from './datelib/duration'
import reduce from './reducers/main'
import { parseDateSpan, DateSpanInput, DateSpan, buildDateSpanApi, DateSpanApi, buildDatePointApi, DatePointApi } from './structs/date-span'
import { memoize, memoizeOutput } from './util/memoize'
import { mapHash, isPropsEqual } from './util/object'
import { DateRangeInput } from './datelib/date-range'
import DateProfileGenerator from './DateProfileGenerator'
import { EventSourceInput, parseEventSource, EventSourceHash } from './structs/event-source'
import { EventInput, parseEvent, EventDefHash } from './structs/event'
import { CalendarState, Action } from './reducers/types'
import EventSourceApi from './api/EventSourceApi'
import EventApi from './api/EventApi'
import { createEmptyEventStore, EventStore, eventTupleToStore } from './structs/event-store'
import { processScopedUiProps, EventUiHash, EventUi } from './component/event-ui'
import { buildViewSpecs, ViewSpecHash, ViewSpec } from './structs/view-spec'
import { PluginSystem } from './plugin-system'
import CalendarComponent from './CalendarComponent'
import { __assign } from 'tslib'
import { refinePluginDefs } from './options'
import DateComponent from './component/DateComponent'
import { PointerDragEvent } from './interactions/pointer'
import { InteractionSettingsInput, parseInteractionSettings, Interaction, interactionSettingsStore, InteractionClass } from './interactions/interaction'
import EventClicking from './interactions/EventClicking'
import EventHovering from './interactions/EventHovering'
import StandardTheme from './theme/StandardTheme'
import { CmdFormatterFunc } from './datelib/formatting-cmd'
import { NamedTimeZoneImplClass } from './datelib/timezone'
import { ComponentContext } from './component/Component'

export interface DateClickApi extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: UIEvent
  view: View
}

export interface DateSelectionApi extends DateSpanApi {
  jsEvent: UIEvent
  view: View
}

export type DatePointTransform = (dateSpan: DateSpan, calendar: Calendar) => any
export type DateSpanTransform = (dateSpan: DateSpan, calendar: Calendar) => any

export type CalendarInteraction = { destroy() }
export type CalendarInteractionClass = { new(calendar: Calendar): CalendarInteraction }

export type OptionChangeHandler = (propValue: any, calendar: Calendar, deepEqual) => void
export type OptionChangeHandlerMap = { [propName: string]: OptionChangeHandler }

export default class Calendar {

  // global handler registry
  static on: EmitterInterface['on']
  static off: EmitterInterface['off']
  static trigger: EmitterInterface['trigger']

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  private buildComponentContext = memoize(buildComponentContext)
  private parseRawLocales = memoize(parseRawLocales)
  private buildLocale = memoize(buildLocale)
  private buildDateEnv = memoize(buildDateEnv)
  private buildTheme = memoize(buildTheme)
  private buildEventUiSingleBase = memoize(this._buildEventUiSingleBase)
  private buildSelectionConfig = memoize(this._buildSelectionConfig)
  private buildEventUiBySource = memoizeOutput(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)

  eventUiBases: EventUiHash // solely for validation system
  selectionConfig: EventUi // doesn't need all the info EventUi provides. only validation-related. TODO: separate data structs

  optionsManager: OptionsManager
  viewSpecs: ViewSpecHash
  dateProfileGenerators: { [viewName: string]: DateProfileGenerator }
  theme: Theme
  dateEnv: DateEnv
  availableRawLocales: RawLocaleMap
  pluginSystem: PluginSystem
  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration

  calendarInteractions: CalendarInteraction[]
  interactionsStore: { [componentUid: string]: Interaction[] } = {}
  removeNavLinkListener: any

  windowResizeProxy: any
  isHandlingWindowResize: boolean

  state: CalendarState
  actionQueue = []
  isReducing: boolean = false

  // isDisplaying: boolean = false // installed in DOM? accepting renders?
  needsRerender: boolean = false // needs a render?
  isRendering: boolean = false // currently in the executeRender function?
  renderingPauseDepth: number = 0
  renderableEventStore: EventStore
  buildDelayedRerender = memoize(buildDelayedRerender)
  delayedRerender: any
  afterSizingTriggers: any = {}
  isViewUpdated: boolean = false
  isDatesUpdated: boolean = false
  isEventsUpdated: boolean = false

  el: HTMLElement
  component: CalendarComponent


  constructor(el: HTMLElement, overrides?: OptionsInput) {
    this.el = el

    this.optionsManager = new OptionsManager(overrides || {})
    this.pluginSystem = new PluginSystem()

    // only do once. don't do in handleOptions. because can't remove plugins
    this.addPluginInputs(this.optionsManager.computed.plugins || [])

    this.handleOptions(this.optionsManager.computed)
    this.publiclyTrigger('_init') // for tests
    this.hydrate()

    this.calendarInteractions = this.pluginSystem.hooks.calendarInteractions
      .map((calendarInteractionClass) => {
        return new calendarInteractionClass(this)
      })
  }


  addPluginInputs(pluginInputs) {
    let pluginDefs = refinePluginDefs(pluginInputs)

    for (let pluginDef of pluginDefs) {
      this.pluginSystem.add(pluginDef)
    }
  }


  // public API
  get view(): View {
    return this.component ? this.component.view : null
  }


  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.component) {
      this.component = new CalendarComponent(this.el)
      this.renderableEventStore = createEmptyEventStore()
      this.bindHandlers()
      this.executeRender()
    } else {
      this.requestRerender()
    }
  }


  destroy() {
    if (this.component) {
      this.unbindHandlers()
      this.component.destroy() // don't null-out. in case API needs access
      this.component = null // umm ???

      for (let interaction of this.calendarInteractions) {
        interaction.destroy()
      }

      this.publiclyTrigger('_destroyed')
    }
  }


  // Handlers
  // -----------------------------------------------------------------------------------------------------------------


  bindHandlers() {

    // event delegation for nav links
    this.removeNavLinkListener = listenBySelector(this.el, 'click', 'a[data-goto]', (ev, anchorEl) => {
      let gotoOptions: any = anchorEl.getAttribute('data-goto')
      gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {}

      let { dateEnv } = this
      let dateMarker = dateEnv.createMarker(gotoOptions.date)
      let viewType = gotoOptions.type

      // property like "navLinkDayClick". might be a string or a function
      let customAction = this.viewOpt('navLink' + capitaliseFirstLetter(viewType) + 'Click')

      if (typeof customAction === 'function') {
        customAction(dateEnv.toDate(dateMarker), ev)
      } else {
        if (typeof customAction === 'string') {
          viewType = customAction
        }
        this.zoomTo(dateMarker, viewType)
      }
    })

    if (this.opt('handleWindowResize')) {
      window.addEventListener('resize',
        this.windowResizeProxy = debounce( // prevents rapid calls
          this.windowResize.bind(this),
          this.opt('windowResizeDelay')
        )
      )
    }
  }

  unbindHandlers() {
    this.removeNavLinkListener()

    if (this.windowResizeProxy) {
      window.removeEventListener('resize', this.windowResizeProxy)
      this.windowResizeProxy = null
    }
  }


  // Dispatcher
  // -----------------------------------------------------------------------------------------------------------------


  hydrate() {
    this.state = this.buildInitialState()

    let rawSources = this.opt('eventSources') || []
    let singleRawSource = this.opt('events')
    let sources = [] // parsed

    if (singleRawSource) {
      rawSources.unshift(singleRawSource)
    }

    for (let rawSource of rawSources) {
      let source = parseEventSource(rawSource, this)
      if (source) {
        sources.push(source)
      }
    }

    this.batchRendering(() => {
      this.dispatch({ type: 'INIT' }) // pass in sources here?
      this.dispatch({ type: 'ADD_EVENT_SOURCES', sources })
      this.dispatch({
        type: 'SET_VIEW_TYPE',
        viewType: this.opt('defaultView') || this.pluginSystem.hooks.defaultView
      })
    })
  }


  buildInitialState(): CalendarState {
    return {
      viewType: null,
      loadingLevel: 0,
      eventSourceLoadingLevel: 0,
      currentDate: this.getInitialDate(),
      dateProfile: null,
      eventSources: {},
      eventStore: createEmptyEventStore(),
      dateSelection: null,
      eventSelection: '',
      eventDrag: null,
      eventResize: null
    }
  }


  dispatch(action: Action) {
    this.actionQueue.push(action)

    if (!this.isReducing) {
      this.isReducing = true
      let oldState = this.state

      while (this.actionQueue.length) {
        this.state = this.reduce(
          this.state,
          this.actionQueue.shift(),
          this
        )
      }

      let newState = this.state
      this.isReducing = false

      if (!oldState.loadingLevel && newState.loadingLevel) {
        this.publiclyTrigger('loading', [ true ])
      } else if (oldState.loadingLevel && !newState.loadingLevel) {
        this.publiclyTrigger('loading', [ false ])
      }

      let view = this.component && this.component.view

      if (oldState.eventStore !== newState.eventStore) {
        if (oldState.eventStore) {
          this.isEventsUpdated = true
        }
      }

      if (oldState.dateProfile !== newState.dateProfile) {
        if (oldState.dateProfile && view) { // why would view be null!?
          this.publiclyTrigger('datesDestroy', [
            {
              view,
              el: view.el
            }
          ])
        }
        this.isDatesUpdated = true
      }

      if (oldState.viewType !== newState.viewType) {
        if (oldState.viewType && view) { // why would view be null!?
          this.publiclyTrigger('viewSkeletonDestroy', [
            {
              view,
              el: view.el
            }
          ])
        }
        this.isViewUpdated = true
      }

      this.requestRerender()
    }
  }


  reduce(state: CalendarState, action: Action, calendar: Calendar): CalendarState {
    return reduce(state, action, calendar)
  }


  // Render Queue
  // -----------------------------------------------------------------------------------------------------------------


  requestRerender() {
    this.needsRerender = true
    this.delayedRerender() // will call a debounced-version of tryRerender
  }


  tryRerender() {
    if (
      this.component && // must be accepting renders
      this.needsRerender && // indicates that a rerender was requested
      !this.renderingPauseDepth && // not paused
      !this.isRendering // not currently in the render loop
    ) {
      this.executeRender()
    }
  }


  batchRendering(func) {
    this.renderingPauseDepth++
    func()
    this.renderingPauseDepth--

    if (this.needsRerender) {
      this.requestRerender()
    }
  }


  // Rendering
  // -----------------------------------------------------------------------------------------------------------------

  executeRender() {
    // clear these BEFORE the render so that new values will accumulate during render
    this.needsRerender = false

    this.isRendering = true
    this.renderComponent()
    this.isRendering = false

    // received a rerender request while rendering
    if (this.needsRerender) {
      this.delayedRerender()
    }
  }

  /*
  don't call this directly. use executeRender instead
  */
  renderComponent() {
    let { state, component } = this
    let { viewType } = state
    let viewSpec = this.viewSpecs[viewType]

    if (!viewSpec) {
      throw new Error(`View type "${viewType}" is not valid`)
    }

    // if event sources are still loading and progressive rendering hasn't been enabled,
    // keep rendering the last fully loaded set of events
    let renderableEventStore = this.renderableEventStore =
      (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
        this.renderableEventStore :
        state.eventStore

    let eventUiSingleBase = this.buildEventUiSingleBase(viewSpec.options)
    let eventUiBySource = this.buildEventUiBySource(state.eventSources)
    let eventUiBases = this.eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    component.receiveProps({
      ...state,
      viewSpec,
      dateProfileGenerator: this.dateProfileGenerators[viewType],
      dateProfile: state.dateProfile,
      eventStore: renderableEventStore,
      eventUiBases,
      dateSelection: state.dateSelection,
      eventSelection: state.eventSelection,
      eventDrag: state.eventDrag,
      eventResize: state.eventResize
    }, this.buildComponentContext(
      this.theme,
      this.dateEnv,
      this.optionsManager.computed
    ))

    if (this.isViewUpdated) {
      this.isViewUpdated = false
      this.publiclyTrigger('viewSkeletonRender', [
        {
          view: component.view,
          el: component.view.el
        }
      ])
    }

    if (this.isDatesUpdated) {
      this.isDatesUpdated = false
      this.publiclyTrigger('datesRender', [
        {
          view: component.view,
          el: component.view.el
        }
      ])
    }

    if (this.isEventsUpdated) {
      this.isEventsUpdated = false
    }

    this.releaseAfterSizingTriggers()
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  setOption(name: string, val) {
    this.mutateOptions({ [name]: val }, [], true)
  }


  getOption(name: string) { // getter, used externally
    return this.optionsManager.computed[name]
  }


  opt(name: string) { // getter, used internally
    return this.optionsManager.computed[name]
  }


  viewOpt(name: string) { // getter, used internally
    return this.viewOpts()[name]
  }


  viewOpts() {
    return this.viewSpecs[this.state.viewType].options
  }

  /*
  handles option changes (like a diff)
  */
  mutateOptions(updates, removals: string[], isDynamic?: boolean, deepEqual?) {
    let changeHandlers = this.pluginSystem.hooks.optionChangeHandlers
    let normalUpdates = {}
    let specialUpdates = {}
    let oldDateEnv = this.dateEnv // do this before handleOptions
    let isTimeZoneDirty = false
    let isSizeDirty = false
    let anyDifficultOptions = Boolean(removals.length)

    for (let name in updates) {
      if (changeHandlers[name]) {
        specialUpdates[name] = updates[name]
      } else {
        normalUpdates[name] = updates[name]
      }
    }

    for (let name in normalUpdates) {
      if (/^(height|contentHeight|aspectRatio)$/.test(name)) {
        isSizeDirty = true
      } else if (/^(defaultDate|defaultView)$/.test(name)) {
        // can't change date this way. use gotoDate instead
      } else {
        anyDifficultOptions = true

        if (name === 'timeZone') {
          isTimeZoneDirty = true
        }
      }
    }

    this.optionsManager.mutate(normalUpdates, removals, isDynamic)

    if (anyDifficultOptions) {
      this.handleOptions(this.optionsManager.computed)
    }

    this.batchRendering(() => {

      if (anyDifficultOptions) {

        if (isTimeZoneDirty) {
          this.dispatch({
            type: 'CHANGE_TIMEZONE',
            oldDateEnv
          })
        }

        /* HACK
        has the same effect as calling this.requestRerender()
        but recomputes the state's dateProfile
        */
        this.dispatch({
          type: 'SET_VIEW_TYPE',
          viewType: this.state.viewType
        })

      } else if (isSizeDirty) {
        this.updateSize()
      }

      // special updates
      if (deepEqual) {
        for (let name in specialUpdates) {
          changeHandlers[name](specialUpdates[name], this, deepEqual)
        }
      }

    })
  }

  /*
  rebuilds things based off of a complete set of refined options
  */
  handleOptions(options) {
    let pluginHooks = this.pluginSystem.hooks

    this.defaultAllDayEventDuration = createDuration(options.defaultAllDayEventDuration)
    this.defaultTimedEventDuration = createDuration(options.defaultTimedEventDuration)
    this.delayedRerender = this.buildDelayedRerender(options.rerenderDelay)
    this.theme = this.buildTheme(options)

    let available = this.parseRawLocales(options.locales)
    this.availableRawLocales = available.map
    let locale = this.buildLocale(options.locale || available.defaultCode, available.map)

    this.dateEnv = this.buildDateEnv(
      locale,
      options.timeZone,
      pluginHooks.namedTimeZonedImpl,
      options.firstDay,
      options.weekNumberCalculation,
      options.weekLabel,
      pluginHooks.cmdFormatter
    )

    this.selectionConfig = this.buildSelectionConfig(options) // needs dateEnv. do after :(

    // ineffecient to do every time?
    this.viewSpecs = buildViewSpecs(
      pluginHooks.views,
      this.optionsManager
    )

    // ineffecient to do every time?
    this.dateProfileGenerators = mapHash(this.viewSpecs, (viewSpec) => {
      return new viewSpec.class.prototype.dateProfileGeneratorClass(viewSpec, this)
    })
  }


  getAvailableLocaleCodes() {
    return Object.keys(this.availableRawLocales)
  }


  _buildSelectionConfig(rawOpts) {
    return processScopedUiProps('select', rawOpts, this)
  }


  _buildEventUiSingleBase(rawOpts) {
    if (rawOpts.editable) { // so 'editable' affected events
      rawOpts = { ...rawOpts, eventEditable: true }
    }
    return processScopedUiProps('event', rawOpts, this)
  }


  // Trigger
  // -----------------------------------------------------------------------------------------------------------------


  hasPublicHandlers<T extends EventHandlerName>(name: T): boolean {
    return this.hasHandlers(name) ||
      this.opt(name) // handler specified in options
  }


  publiclyTrigger<T extends EventHandlerName>(name: T, args?: EventHandlerArgs<T>) {
    let optHandler = this.opt(name)

    this.triggerWith(name, this, args)

    if (optHandler) {
      return optHandler.apply(this, args)
    }
  }


  publiclyTriggerAfterSizing<T extends EventHandlerName>(name: T, args: EventHandlerArgs<T>) {
    let { afterSizingTriggers } = this;

    (afterSizingTriggers[name] || (afterSizingTriggers[name] = [])).push(args)
  }


  releaseAfterSizingTriggers() {
    let { afterSizingTriggers } = this

    for (let name in afterSizingTriggers) {
      for (let args of afterSizingTriggers[name]) {
        this.publiclyTrigger(name as EventHandlerName, args)
      }
    }

    this.afterSizingTriggers = {}
  }


  // View
  // -----------------------------------------------------------------------------------------------------------------


  // Returns a boolean about whether the view is okay to instantiate at some point
  isValidViewType(viewType: string): boolean {
    return Boolean(this.viewSpecs[viewType])
  }


  changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput) {
    let dateMarker = null

    if (dateOrRange) {
      if ((dateOrRange as DateRangeInput).start && (dateOrRange as DateRangeInput).end) { // a range
        this.optionsManager.mutate({ visibleRange: dateOrRange }, []) // will not rerender
        this.handleOptions(this.optionsManager.computed) // ...but yuck
      } else { // a date
        dateMarker = this.dateEnv.createMarker(dateOrRange as DateInput) // just like gotoDate
      }
    }

    this.unselect()
    this.dispatch({
      type: 'SET_VIEW_TYPE',
      viewType,
      dateMarker
    })
  }


  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  // needs to change
  zoomTo(dateMarker: DateMarker, viewType?: string) {
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = this.viewSpecs[viewType] ||
      this.getUnitViewSpec(viewType)

    this.unselect()

    if (spec) {
      this.dispatch({
        type: 'SET_VIEW_TYPE',
        viewType: spec.type,
        dateMarker
      })
    } else {
      this.dispatch({
        type: 'SET_DATE',
        dateMarker
      })
    }
  }


  // Given a duration singular unit, like "week" or "day", finds a matching view spec.
  // Preference is given to views that have corresponding buttons.
  getUnitViewSpec(unit: string): ViewSpec | null {
    let { component } = this
    let viewTypes = []
    let i
    let spec

    // put views that have buttons first. there will be duplicates, but oh
    if (component.header) {
      viewTypes.push(...component.header.viewsWithButtons)
    }
    if (component.footer) {
      viewTypes.push(...component.footer.viewsWithButtons)
    }

    for (let viewType in this.viewSpecs) {
      viewTypes.push(viewType)
    }

    for (i = 0; i < viewTypes.length; i++) {
      spec = this.viewSpecs[viewTypes[i]]
      if (spec) {
        if (spec.singleUnit === unit) {
          return spec
        }
      }
    }
  }


  // Current Date
  // -----------------------------------------------------------------------------------------------------------------


  getInitialDate() {
    let defaultDateInput = this.opt('defaultDate')

    // compute the initial ambig-timezone date
    if (defaultDateInput != null) {
      return this.dateEnv.createMarker(defaultDateInput)
    } else {
      return this.getNow() // getNow already returns unzoned
    }
  }


  prev() {
    this.unselect()
    this.dispatch({ type: 'PREV' })
  }


  next() {
    this.unselect()
    this.dispatch({ type: 'NEXT' })
  }


  prevYear() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.dateEnv.addYears(this.state.currentDate, -1)
    })
  }


  nextYear() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.dateEnv.addYears(this.state.currentDate, 1)
    })
  }


  today() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.getNow()
    })
  }


  gotoDate(zonedDateInput) {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.dateEnv.createMarker(zonedDateInput)
    })
  }


  incrementDate(deltaInput) { // is public facing
    let delta = createDuration(deltaInput)

    if (delta) { // else, warn about invalid input?
      this.unselect()
      this.dispatch({
        type: 'SET_DATE',
        dateMarker: this.dateEnv.add(this.state.currentDate, delta)
      })
    }
  }


  // for external API
  getDate(): Date {
    return this.dateEnv.toDate(this.state.currentDate)
  }


  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------


  formatDate(d: DateInput, formatter): string {
    const { dateEnv } = this
    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter)
    )
  }


  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings) {
    const { dateEnv } = this
    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings, this.opt('defaultRangeSeparator')),
      settings
    )
  }


  formatIso(d: DateInput, omitTime?: boolean) {
    const { dateEnv } = this
    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  windowResize(ev: Event) {
    if (
      !this.isHandlingWindowResize &&
      this.component && // why?
      (ev as any).target === window // not a jqui resize event
    ) {
      this.isHandlingWindowResize = true
      this.updateSize()
      this.publiclyTrigger('windowResize', [ this.view ])
      this.isHandlingWindowResize = false
    }
  }


  updateSize() { // public
    if (this.component) { // when?
      this.component.updateSize(true)
    }
  }


  // Component Registration
  // -----------------------------------------------------------------------------------------------------------------


  registerInteractiveComponent(component: DateComponent<any>, settingsInput: InteractionSettingsInput) {
    let settings = parseInteractionSettings(component, settingsInput)
    let DEFAULT_INTERACTIONS: InteractionClass[] = [
      EventClicking,
      EventHovering
    ]
    let interactionClasses: InteractionClass[] = DEFAULT_INTERACTIONS.concat(
      this.pluginSystem.hooks.componentInteractions
    )
    let interactions = interactionClasses.map((interactionClass) => {
      return new interactionClass(settings)
    })

    this.interactionsStore[component.uid] = interactions
    interactionSettingsStore[component.uid] = settings
  }


  unregisterInteractiveComponent(component: DateComponent<any>) {

    for (let listener of this.interactionsStore[component.uid]) {
      listener.destroy()
    }

    delete this.interactionsStore[component.uid]
    delete interactionSettingsStore[component.uid]
  }


  // Date Selection / Event Selection / DayClick
  // -----------------------------------------------------------------------------------------------------------------


  // this public method receives start/end dates in any format, with any timezone
  // NOTE: args were changed from v3
  select(dateOrObj: DateInput | any, endDate?: DateInput) {
    let selectionInput: DateSpanInput

    if (endDate == null) {
      if (dateOrObj.start != null) {
        selectionInput = dateOrObj as DateSpanInput
      } else {
        selectionInput = {
          start: dateOrObj,
          end: null
        }
      }
    } else {
      selectionInput = {
        start: dateOrObj,
        end: endDate
      } as DateSpanInput
    }

    let selection = parseDateSpan(
      selectionInput,
      this.dateEnv,
      createDuration({ days: 1 }) // TODO: cache this?
    )

    if (selection) { // throw parse error otherwise?
      this.dispatch({ type: 'SELECT_DATES', selection })
      this.triggerDateSelect(selection)
    }
  }


  // public method
  unselect(pev?: PointerDragEvent) {
    if (this.state.dateSelection) {
      this.dispatch({ type: 'UNSELECT_DATES' })
      this.triggerDateUnselect(pev)
    }
  }


  triggerDateSelect(selection: DateSpan, pev?: PointerDragEvent) {
    const arg = {
      ...this.buildDateSpanApi(selection),
      jsEvent: pev ? pev.origEvent as MouseEvent : null, // Is this always a mouse event? See #4655
      view: this.view
    }
    this.publiclyTrigger('select', [ arg ])
  }


  triggerDateUnselect(pev?: PointerDragEvent) {
    this.publiclyTrigger('unselect', [
      {
        jsEvent: pev ? pev.origEvent : null,
        view: this.view
      }
    ])
  }


  // TODO: receive pev?
  triggerDateClick(dateSpan: DateSpan, dayEl: HTMLElement, view: View, ev: UIEvent) {
    const arg = {
      ...this.buildDatePointApi(dateSpan),
      dayEl,
      jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
      view
    }

    this.publiclyTrigger('dateClick', [ arg ])
  }


  buildDatePointApi(dateSpan: DateSpan) {
    let props = {} as DatePointApi

    for (let transform of this.pluginSystem.hooks.datePointTransforms) {
      __assign(props, transform(dateSpan, this))
    }

    __assign(props, buildDatePointApi(dateSpan, this.dateEnv))

    return props
  }


  buildDateSpanApi(dateSpan: DateSpan) {
    let props = {} as DateSpanApi

    for (let transform of this.pluginSystem.hooks.dateSpanTransforms) {
      __assign(props, transform(dateSpan, this))
    }

    __assign(props, buildDateSpanApi(dateSpan, this.dateEnv))

    return props
  }


  // Date Utils
  // -----------------------------------------------------------------------------------------------------------------


  // Returns a DateMarker for the current date, as defined by the client's computer or from the `now` option
  getNow(): DateMarker {
    let now = this.opt('now')

    if (typeof now === 'function') {
      now = now()
    }

    if (now == null) {
      return this.dateEnv.createNowMarker()
    }

    return this.dateEnv.createMarker(now)
  }


  // Event-Date Utilities
  // -----------------------------------------------------------------------------------------------------------------


  // Given an event's allDay status and start date, return what its fallback end date should be.
  // TODO: rename to computeDefaultEventEnd
  getDefaultEventEnd(allDay: boolean, marker: DateMarker): DateMarker {
    let end = marker

    if (allDay) {
      end = startOfDay(end)
      end = this.dateEnv.add(end, this.defaultAllDayEventDuration)
    } else {
      end = this.dateEnv.add(end, this.defaultTimedEventDuration)
    }

    return end
  }


  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------


  addEvent(eventInput: EventInput, sourceInput?: EventSourceApi | string | number): EventApi | null {

    if (eventInput instanceof EventApi) {
      let def = eventInput._def
      let instance = eventInput._instance

      // not already present? don't want to add an old snapshot
      if (!this.state.eventStore.defs[def.defId]) {
        this.dispatch({
          type: 'ADD_EVENTS',
          eventStore: eventTupleToStore({ def, instance }) // TODO: better util for two args?
        })
      }

      return eventInput
    }

    let sourceId
    if (sourceInput instanceof EventSourceApi) {
      sourceId = sourceInput.internalEventSource.sourceId
    } else if (sourceInput != null) {
      let sourceApi = this.getEventSourceById(sourceInput) // TODO: use an internal function

      if (!sourceApi) {
        console.warn('Could not find an event source with ID "' + sourceInput + '"') // TODO: test
        return null
      } else {
        sourceId = sourceApi.internalEventSource.sourceId
      }
    }

    let tuple = parseEvent(eventInput, sourceId, this)

    if (tuple) {

      this.dispatch({
        type: 'ADD_EVENTS',
        eventStore: eventTupleToStore(tuple)
      })

      return new EventApi(
        this,
        tuple.def,
        tuple.def.recurringDef ? null : tuple.instance
      )
    }

    return null
  }


  // TODO: optimize
  getEventById(id: string): EventApi | null {
    let { defs, instances } = this.state.eventStore

    id = String(id)

    for (let defId in defs) {
      let def = defs[defId]

      if (def.publicId === id) {

        if (def.recurringDef) {
          return new EventApi(this, def, null)
        } else {

          for (let instanceId in instances) {
            let instance = instances[instanceId]

            if (instance.defId === def.defId) {
              return new EventApi(this, def, instance)
            }
          }
        }
      }
    }

    return null
  }


  getEvents(): EventApi[] {
    let { defs, instances } = this.state.eventStore
    let eventApis: EventApi[] = []

    for (let id in instances) {
      let instance = instances[id]
      let def = defs[instance.defId]

      eventApis.push(new EventApi(this, def, instance))
    }

    return eventApis
  }


  removeAllEvents() {
    this.dispatch({ type: 'REMOVE_ALL_EVENTS' })
  }


  rerenderEvents() { // API method. destroys old events if previously rendered.
    this.dispatch({ type: 'RESET_EVENTS' })
  }


  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------


  getEventSources(): EventSourceApi[] {
    let sourceHash = this.state.eventSources
    let sourceApis: EventSourceApi[] = []

    for (let internalId in sourceHash) {
      sourceApis.push(new EventSourceApi(this, sourceHash[internalId]))
    }

    return sourceApis
  }


  getEventSourceById(id: string | number): EventSourceApi | null {
    let sourceHash = this.state.eventSources

    id = String(id)

    for (let sourceId in sourceHash) {
      if (sourceHash[sourceId].publicId === id) {
        return new EventSourceApi(this, sourceHash[sourceId])
      }
    }

    return null
  }


  addEventSource(sourceInput: EventSourceInput): EventSourceApi {

    if (sourceInput instanceof EventSourceApi) {

      // not already present? don't want to add an old snapshot
      if (!this.state.eventSources[sourceInput.internalEventSource.sourceId]) {
        this.dispatch({
          type: 'ADD_EVENT_SOURCES',
          sources: [ sourceInput.internalEventSource ]
        })
      }

      return sourceInput
    }

    let eventSource = parseEventSource(sourceInput, this)

    if (eventSource) { // TODO: error otherwise?
      this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [ eventSource ] })

      return new EventSourceApi(this, eventSource)
    }

    return null
  }


  removeAllEventSources() {
    this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' })
  }


  refetchEvents() {
    this.dispatch({ type: 'FETCH_EVENT_SOURCES' })
  }


  // Scroll
  // -----------------------------------------------------------------------------------------------------------------

  scrollToTime(timeInput: DurationInput) {
    let duration = createDuration(timeInput)

    if (duration) {
      this.component.view.scrollToDuration(duration)
    }
  }

}

EmitterMixin.mixInto(Calendar)


// for memoizers
// -----------------------------------------------------------------------------------------------------------------


function buildComponentContext(this: Calendar, theme: Theme, dateEnv: DateEnv, options) {
  return new ComponentContext(this, theme, dateEnv, options, null)
}


function buildDateEnv(locale: Locale, timeZone, namedTimeZoneImpl: NamedTimeZoneImplClass, firstDay, weekNumberCalculation, weekLabel, cmdFormatter: CmdFormatterFunc) {
  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone,
    namedTimeZoneImpl,
    locale,
    weekNumberCalculation,
    firstDay,
    weekLabel,
    cmdFormatter
  })
}


function buildTheme(this: Calendar, calendarOptions) {
  let themeClass = this.pluginSystem.hooks.themeClasses[calendarOptions.themeSystem] || StandardTheme
  return new themeClass(calendarOptions)
}


function buildDelayedRerender(this: Calendar, wait) {
  let func = this.tryRerender.bind(this)

  if (wait != null) {
    func = debounce(func, wait)
  }

  return func
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

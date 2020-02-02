import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import OptionsManager from './OptionsManager'
import View from './View'
import { OptionsInput, EventHandlerName, EventHandlerArgs } from './types/input-types'
import { buildLocale, organizeRawLocales, RawLocaleMap } from './datelib/locale'
import { DateEnv, DateInput } from './datelib/env'
import { DateMarker, startOfDay, diffWholeDays } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { createDuration, DurationInput, Duration } from './datelib/duration'
import reduce from './reducers/main'
import { parseDateSpan, DateSpanInput, DateSpan, buildDateSpanApi, DateSpanApi, buildDatePointApi, DatePointApi } from './structs/date-span'
import { memoize } from './util/memoize'
import { mapHash, isPropsEqual } from './util/object'
import { DateRangeInput, DateRange } from './datelib/date-range'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { EventSourceInput, parseEventSource, EventSourceHash } from './structs/event-source'
import { EventInput, parseEvent, EventDefHash } from './structs/event'
import { CalendarState, Action } from './reducers/types'
import EventSourceApi from './api/EventSourceApi'
import EventApi from './api/EventApi'
import { createEmptyEventStore, eventTupleToStore, EventStore } from './structs/event-store'
import { processScopedUiProps, EventUiHash, EventUi } from './component/event-ui'
import { buildViewSpecs, ViewSpecHash, ViewSpec } from './structs/view-spec'
import { PluginSystem, PluginHooks, PluginDef } from './plugin-system'
import CalendarComponent from './CalendarComponent'
import { __assign } from 'tslib'
import DateComponent from './component/DateComponent'
import { PointerDragEvent } from './interactions/pointer'
import { InteractionSettingsInput, parseInteractionSettings, Interaction, interactionSettingsStore, InteractionClass } from './interactions/interaction'
import EventClicking from './interactions/EventClicking'
import EventHovering from './interactions/EventHovering'
import StandardTheme from './theme/StandardTheme'
import ComponentContext, { ComponentContextType, buildContext } from './component/ComponentContext'
import { render, h, createRef, flushToDom } from './vdom'
import { TaskRunner, DelayedRunner } from './util/runner'
import ViewApi from './ViewApi'
import { globalPlugins } from './global-plugins'
import { removeExact } from './util/array'


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

export type ResizeHandler = (force: boolean) => void


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

  // option-processing internals
  // TODO: make these all private
  public pluginSystem: PluginSystem
  public optionsManager: OptionsManager
  public viewSpecs: ViewSpecHash
  public dateProfileGenerators: { [viewName: string]: DateProfileGenerator }

  // derived state
  // TODO: make these all private
  private organizeRawLocales = memoize(organizeRawLocales)
  private buildDateEnv = memoize(buildDateEnv)
  private computeTitle = memoize(computeTitle)
  private buildTheme = memoize(buildTheme)
  private buildContext = memoize(buildContext)
  private buildEventUiSingleBase = memoize(buildEventUiSingleBase)
  private buildSelectionConfig = memoize(buildSelectionConfig)
  private buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)
  private renderableEventStore: EventStore
  public eventUiBases: EventUiHash // needed for validation system
  public selectionConfig: EventUi // needed for validation system. doesn't need all the info EventUi provides. only validation-related
  private availableRawLocales: RawLocaleMap
  public context: ComponentContext
  public dateEnv: DateEnv
  public defaultAllDayEventDuration: Duration
  public defaultTimedEventDuration: Duration
  private resizeHandlers: ResizeHandler[] = []

  // interaction
  calendarInteractions: CalendarInteraction[]
  interactionsStore: { [componentUid: string]: Interaction[] } = {}

  state: CalendarState
  isRendering = false
  isRendered = false
  renderRunner: DelayedRunner
  actionRunner: TaskRunner<Action> // for reducer. bad name
  afterSizingTriggers: any = {}
  isViewUpdated: boolean = false
  isDatesUpdated: boolean = false
  isEventsUpdated: boolean = false
  el: HTMLElement
  componentRef = createRef<CalendarComponent>()
  view: ViewApi // public API

  get component() { return this.componentRef.current }


  constructor(el: HTMLElement, overrides?: OptionsInput) {
    this.el = el

    let optionsManager = this.optionsManager = new OptionsManager(overrides || {})
    this.pluginSystem = new PluginSystem()

    let renderRunner = this.renderRunner = new DelayedRunner(
      this.updateComponent.bind(this)
    )

    let actionRunner = this.actionRunner = new TaskRunner(
      this.runAction.bind(this),
      () => {
        this.updateDerivedState()
        renderRunner.request(optionsManager.computed.rerenderDelay)
      }
    )
    actionRunner.pause()

    // only do once. don't do in onOptionsChange. because can't remove plugins
    this.addPluginDefs(
      globalPlugins.concat(optionsManager.computed.plugins || [])
    )

    this.onOptionsChange()

    this.publiclyTrigger('_init') // for tests
    this.hydrate()
    actionRunner.resume()

    this.calendarInteractions = this.pluginSystem.hooks.calendarInteractions
      .map((calendarInteractionClass) => {
        return new calendarInteractionClass(this)
      })
  }


  addPluginDefs(pluginDefs: PluginDef[]) {
    for (let pluginDef of pluginDefs) {
      this.pluginSystem.add(pluginDef)
    }
  }


  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.isRendering) {
      this.isRendering = true
      this.renderableEventStore = createEmptyEventStore()
      this.renderRunner.request()
      flushToDom()
      window.addEventListener('resize', this.handleWindowResize)
    }
  }


  destroy() {
    if (this.isRendering) {
      this.isRendering = false
      this.renderRunner.request()
      this.resizeRunner.clear()
      window.removeEventListener('resize', this.handleWindowResize)
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

    this.dispatch({ type: 'INIT' }) // pass in sources here?
    this.dispatch({ type: 'ADD_EVENT_SOURCES', sources })
    this.dispatch({
      type: 'SET_VIEW_TYPE',
      viewType: this.opt('defaultView') || this.pluginSystem.hooks.defaultView
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
    this.actionRunner.request(action)

    // actions we know we want to render immediately. TODO: another param in dispatch instead?
    switch (action.type) {
      case 'SET_EVENT_DRAG':
      case 'SET_EVENT_RESIZE':
        this.renderRunner.drain()
    }
  }


  runAction(action: Action) {
    let oldState = this.state
    let newState = this.state = reduce(this.state, action, this)

    if (!oldState.loadingLevel && newState.loadingLevel) {
      this.publiclyTrigger('loading', [ true ])
    } else if (oldState.loadingLevel && !newState.loadingLevel) {
      this.publiclyTrigger('loading', [ false ])
    }

    let calendarComponent = this.component
    let viewComponent = calendarComponent && calendarComponent.view
    let viewApi = this.view // bad name

    if (oldState.eventStore !== newState.eventStore) {
      if (oldState.eventStore) {
        this.isEventsUpdated = true
      }
    }

    if (oldState.dateProfile !== newState.dateProfile) {
      if (oldState.dateProfile && viewComponent) { // why would view be null!?
        this.publiclyTrigger('datesDestroy', [
          {
            view: viewApi,
            el: viewComponent.base as HTMLElement
          }
        ])
      }
      this.isDatesUpdated = true
    }

    if (oldState.viewType !== newState.viewType) {
      if (oldState.viewType && viewComponent) { // why would view be null!?
        this.publiclyTrigger('viewSkeletonDestroy', [
          {
            view: viewApi,
            el: viewComponent.base as HTMLElement
          }
        ])
      }
      this.isViewUpdated = true
    }
  }


  // Rendering
  // -----------------------------------------------------------------------------------------------------------------


  batchRendering(func) {
    this.renderRunner.whilePaused(func)
  }


  updateComponent() {
    if (this.isRendering) {
      this.renderComponent()
      this.isRendered = true
    } else {
      if (this.isRendered) {
        this.destroyComponent()
        this.isRendered = false
      }
    }
  }


  renderComponent() {
    let { context, state } = this
    let { viewType } = state
    let viewSpec = this.viewSpecs[viewType]
    let viewApi = context.view

    // if event sources are still loading and progressive rendering hasn't been enabled,
    // keep rendering the last fully loaded set of events
    let renderableEventStore = this.renderableEventStore =
      (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
        this.renderableEventStore :
        state.eventStore

    let eventUiSingleBase = this.buildEventUiSingleBase(viewSpec.options)
    let eventUiBySource = this.buildEventUiBySource(state.eventSources)
    let eventUiBases = this.eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    render(
      <ComponentContextType.Provider value={context}>
        <CalendarComponent
          ref={this.componentRef}
          rootEl={this.el}
          { ...state }
          viewSpec={viewSpec}
          dateProfileGenerator={this.dateProfileGenerators[viewType]}
          dateProfile={state.dateProfile}
          eventStore={renderableEventStore}
          eventUiBases={eventUiBases}
          dateSelection={state.dateSelection}
          eventSelection={state.eventSelection}
          eventDrag={state.eventDrag}
          eventResize={state.eventResize}
          title={viewApi.title}
          />
      </ComponentContextType.Provider>,
      this.el
    )

    let calendarComponent = this.component
    let viewComponent = calendarComponent.view

    if (this.isViewUpdated) {
      this.isViewUpdated = false
      this.publiclyTrigger('viewSkeletonRender', [
        {
          view: viewApi,
          el: viewComponent.base as HTMLElement
        }
      ])
    }

    if (this.isDatesUpdated) {
      this.isDatesUpdated = false
      this.publiclyTrigger('datesRender', [
        {
          view: viewApi,
          el: viewComponent.base as HTMLElement
        }
      ])
    }

    if (this.isEventsUpdated) {
      this.isEventsUpdated = false
    }

    this.releaseAfterSizingTriggers()
  }


  destroyComponent() {
    render(null, this.el)

    for (let interaction of this.calendarInteractions) {
      interaction.destroy()
    }

    this.publiclyTrigger('_destroyed')
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
    return this.viewSpecs[this.state.viewType].options[name]
  }

  /*
  handles option changes (like a diff)
  */
  mutateOptions(updates, removals: string[], isDynamic?: boolean, deepEqual?) {
    let changeHandlers = this.pluginSystem.hooks.optionChangeHandlers
    let normalUpdates = {}
    let specialUpdates = {}
    let oldDateEnv = this.dateEnv // do this before onOptionsChange
    let isTimeZoneDirty = false
    let anyDifficultOptions = Boolean(removals.length)

    for (let name in updates) {
      if (changeHandlers[name]) {
        specialUpdates[name] = updates[name]
      } else {
        normalUpdates[name] = updates[name]
      }
    }

    for (let name in normalUpdates) {
      if (/^(defaultDate|defaultView)$/.test(name)) {
        // can't change date this way. use gotoDate instead
      } else {
        anyDifficultOptions = true // I guess all options are "difficult" ?

        if (name === 'timeZone') {
          isTimeZoneDirty = true
        }
      }
    }

    this.optionsManager.mutate(normalUpdates, removals, isDynamic)

    if (anyDifficultOptions) {
      this.onOptionsChange()
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
        has the same effect as calling this.updateComponent()
        but recomputes the state's dateProfile
        */
        this.dispatch({
          type: 'SET_VIEW_TYPE',
          viewType: this.state.viewType
        })

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
  TODO: move all this to updateDerivedState, but hard because reducer depends on some values
  */
  onOptionsChange() {
    let pluginHooks = this.pluginSystem.hooks
    let rawOptions = this.optionsManager.computed

    let availableLocaleData = this.organizeRawLocales(rawOptions.locales)
    let dateEnv = this.buildDateEnv(rawOptions, pluginHooks, availableLocaleData)

    this.availableRawLocales = availableLocaleData.map
    this.dateEnv = dateEnv

    // TODO: don't do every time
    this.viewSpecs = buildViewSpecs(pluginHooks.views, this.optionsManager)

    // needs to happen after dateEnv assigned :( because DateProfileGenerator grabs onto reference
    // TODO: don't do every time
    this.dateProfileGenerators = mapHash(this.viewSpecs, (viewSpec) => {
      return new viewSpec.class.prototype.dateProfileGeneratorClass(viewSpec, this)
    })

    // TODO: don't do every time
    this.defaultAllDayEventDuration = createDuration(rawOptions.defaultAllDayEventDuration)
    this.defaultTimedEventDuration = createDuration(rawOptions.defaultTimedEventDuration)
  }


  /*
  always executes after onOptionsChange
  */
  updateDerivedState() {
    let pluginHooks = this.pluginSystem.hooks
    let rawOptions = this.optionsManager.computed
    let { dateEnv } = this
    let { viewType, dateProfile } = this.state
    let viewSpec = this.viewSpecs[viewType]

    if (!viewSpec) {
      throw new Error(`View type "${viewType}" is not valid`)
    }

    let theme = this.buildTheme(rawOptions, pluginHooks)
    let title = this.computeTitle(dateProfile, dateEnv, viewSpec.options)
    let viewApi = this.buildViewApi(viewType, title, dateProfile, dateEnv)
    let context = this.buildContext(this, pluginHooks, dateEnv, theme, viewApi, rawOptions)

    this.context = context
    this.selectionConfig = this.buildSelectionConfig(rawOptions) // MUST happen after dateEnv assigned :(
  }


  /*
  will only create a new instance when viewType is changed
  */
  buildViewApi(viewType: string, title: string, dateProfile: DateProfile, dateEnv: DateEnv) {
    let { view } = this

    if (!view || view.type !== viewType) {
      view = this.view = { type: viewType } as ViewApi
    }

    view.title = title
    view.activeStart = dateEnv.toDate(dateProfile.activeRange.start)
    view.activeEnd = dateEnv.toDate(dateProfile.activeRange.end)
    view.currentStart = dateEnv.toDate(dateProfile.currentRange.start)
    view.currentEnd = dateEnv.toDate(dateProfile.currentRange.end)

    return view
  }


  getAvailableLocaleCodes() {
    return Object.keys(this.availableRawLocales)
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


  // Post-sizing hacks (kill after updateSize refactor)
  // -----------------------------------------------------------------------------------------------------------------


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
        this.onOptionsChange() // ...but yuck
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
    spec = this.viewSpecs[viewType] || this.getUnitViewSpec(viewType)

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
    let viewTypes = [].concat(this.context.viewsWithButtons)
    let i
    let spec

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
    let { dateEnv } = this
    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter)
    )
  }


  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings) {
    let { dateEnv } = this
    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings, this.opt('defaultRangeSeparator')),
      settings
    )
  }


  formatIso(d: DateInput, omitTime?: boolean) {
    let { dateEnv } = this
    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize() { // public
    this.triggerResizeHandlers(true)
  }


  // RE-Sizing
  // -----------------------------------------------------------------------------------------------------------------


  resizeRunner = new DelayedRunner(() => {
    this.triggerResizeHandlers(true) // should window resizes be considered "forced" ?
    this.publiclyTrigger('windowResize', [ this.context.view ])
  })


  handleWindowResize = (ev: UIEvent) => {
    let { options } = this.context

    if (
      options.handleWindowResize &&
      ev.target === window // avoid jqui events
    ) {
      this.resizeRunner.request(options.windowResizeDelay)
    }
  }


  addResizeHandler = (handler: ResizeHandler) => {
    this.resizeHandlers.push(handler)
  }


  removeResizeHandler = (handler: ResizeHandler) => {
    removeExact(this.resizeHandlers, handler)
  }


  triggerResizeHandlers(forced: boolean) {
    for (let handler of this.resizeHandlers) {
      handler(forced)
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
  triggerDateClick(dateSpan: DateSpan, dayEl: HTMLElement, view: ViewApi, ev: UIEvent) {
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
    let time = createDuration(timeInput)

    if (time) {
      this.trigger('scrollRequest', { time })
    }
  }

}

EmitterMixin.mixInto(Calendar)


// for memoizers
// -----------------------------------------------------------------------------------------------------------------


function buildDateEnv(rawOptions: any, pluginHooks: PluginHooks, availableLocaleData) {
  let locale = buildLocale(rawOptions.locale || availableLocaleData.defaultCode, availableLocaleData.map)

  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone: rawOptions.timeZone,
    namedTimeZoneImpl: pluginHooks.namedTimeZonedImpl,
    locale,
    weekNumberCalculation: rawOptions.weekNumberCalculation,
    firstDay: rawOptions.firstDay,
    weekLabel: rawOptions.weekLabel,
    cmdFormatter: pluginHooks.cmdFormatter
  })
}


function buildTheme(rawOptions, pluginHooks: PluginHooks) {
  let themeClass = pluginHooks.themeClasses[rawOptions.themeSystem] || StandardTheme

  return new themeClass(rawOptions)
}


function buildSelectionConfig(this: Calendar, rawOptions) { // DANGEROUS: `this` context must be a Calendar
  return processScopedUiProps('select', rawOptions, this)
}


function buildEventUiSingleBase(this: Calendar, rawOptions) { // DANGEROUS: `this` context must be a Calendar
  if (rawOptions.editable) { // so 'editable' affected events
    rawOptions = { ...rawOptions, eventEditable: true }
  }
  return processScopedUiProps('event', rawOptions, this)
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


// Title and Date Formatting
// -----------------------------------------------------------------------------------------------------------------


// Computes what the title at the top of the calendar should be for this view
function computeTitle(dateProfile, dateEnv: DateEnv, viewOptions) {
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

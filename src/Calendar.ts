import { elementClosest } from './util/dom-manip'
import { listenBySelector } from './util/dom-event'
import { capitaliseFirstLetter, debounce } from './util/misc'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import OptionsManager from './OptionsManager'
import View from './View'
import Theme from './theme/Theme'
import { getThemeSystemClass } from './theme/ThemeRegistry'
import { OptionsInput } from './types/input-types'
import { getLocale } from './datelib/locale'
import { DateEnv, DateInput } from './datelib/env'
import { DateMarker, startOfDay } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { Duration, createDuration } from './datelib/duration'
import reduce from './reducers/main'
import { parseDateSpan, DateSpanInput, DateSpan, buildDateSpanApi, DateSpanApi, buildDatePointApi, DatePointApi } from './structs/date-span'
import { memoize, memoizeOutput } from './util/memoize'
import { mapHash, assignTo, isPropsEqual } from './util/object'
import { DateRangeInput } from './datelib/date-range'
import DateProfileGenerator from './DateProfileGenerator'
import { EventSourceInput, parseEventSource, EventSourceHash } from './structs/event-source'
import { EventInput, parseEvent, EventDefHash } from './structs/event'
import { CalendarState, Action } from './reducers/types'
import EventSourceApi from './api/EventSourceApi'
import EventApi from './api/EventApi'
import { createEmptyEventStore, EventStore, eventTupleToStore } from './structs/event-store'
import { processScopedUiProps, EventUiHash, EventUi, processUnscopedUiProps } from './component/event-ui'
import PointerDragging, { PointerDragEvent } from './dnd/PointerDragging'
import EventDragging from './interactions/EventDragging'
import { buildViewSpecs, ViewSpecHash, ViewSpec } from './structs/view-spec'
import { PluginSystem, PluginDef } from './plugin-system'
import CalendarComponent from './CalendarComponent'


export interface DateClickApi extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: UIEvent
  view: View
}

export interface DateSelectionApi extends DateSpanApi {
  jsEvent: UIEvent
  view: View
}

export type dateClickApiTransformer = (dateClick: DateClickApi, dateSpan: DateSpan, calendar: Calendar) => void
export type dateSelectionApiTransformer = (dateSelection: DateSelectionApi, dateSpan: DateSpan, calendar: Calendar) => void

export default class Calendar {

  // global handler registry
  static on: EmitterInterface['on']
  static off: EmitterInterface['off']
  static trigger: EmitterInterface['trigger']

  static defaultPlugins: PluginDef[] = []

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  private buildDateEnv = memoize(buildDateEnv)
  private buildTheme = memoize(buildTheme)
  private buildEventUiSingleBase = memoize(processScopedUiProps.bind(null, 'event') as typeof processUnscopedUiProps) // hack for ts
  private buildSelectionConfig = memoize(processScopedUiProps.bind(null, 'select') as typeof processUnscopedUiProps) // hack for ts
  private buildEventUiBySource = memoizeOutput(buildEventUiBySource, isPropsEqual)
  private buildEventUiBases = memoize(buildEventUiBases)

  eventUiBases: EventUiHash // solely for validation system
  selectionConfig: EventUi // doesn't need all the info EventUi provides. only validation-related. TODO: separate data structs

  optionsManager: OptionsManager
  viewSpecs: ViewSpecHash
  dateProfileGenerators: { [viewName: string]: DateProfileGenerator }
  theme: Theme
  dateEnv: DateEnv
  pluginSystem: PluginSystem
  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration

  removeNavLinkListener: any
  documentPointer: PointerDragging // for unfocusing
  isRecentPointerDateSelect = false // wish we could use a selector to detect date selection, but uses hit system

  windowResizeProxy: any
  isResizing: boolean

  state: CalendarState
  actionQueue = []
  isReducing: boolean = false

  // isDisplaying: boolean = false // installed in DOM? accepting renders?
  needsRerender: boolean = false // needs a render?
  needsFullRerender: boolean = false
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


  constructor(el: HTMLElement, overrides: OptionsInput) {
    this.el = el

    this.optionsManager = new OptionsManager(overrides)
    this.pluginSystem = new PluginSystem()

    // only do once. don't do in handleOptions. because can't remove plugins
    let pluginDefs = Calendar.defaultPlugins.concat(
      this.optionsManager.computed.plugins || []
    )
    for (let pluginDef of pluginDefs) {
      this.pluginSystem.add(pluginDef)
    }

    this.handleOptions(this.optionsManager.computed)
    this.publiclyTrigger('_init') // for tests
    this.hydrate()
  }


  // public API
  get view(): View {
    return this.component ? this.component.view : null
  }


  // public API :(
  getView(): View {
    return this.view // calls getter
  }


  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.component) {
      this.renderableEventStore = createEmptyEventStore()
      this.bindHandlers()
      this.executeRender()
    } else {
      this.requestRerender(true)
    }
  }


  destroy() {
    if (this.component) {
      this.unbindHandlers()
      this.component.destroy() // don't null-out. in case API needs access
      this.component = null
    }
  }


  // Handlers
  // -----------------------------------------------------------------------------------------------------------------


  bindHandlers() {

    // event delegation for nav links
    this.removeNavLinkListener = listenBySelector(this.el, 'click', 'a[data-goto]', (ev, anchorEl) => {
      let gotoOptions: any = anchorEl.getAttribute('data-goto')
      gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {}

      let date = this.dateEnv.createMarker(gotoOptions.date)
      let viewType = gotoOptions.type

      // property like "navLinkDayClick". might be a string or a function
      let customAction = this.viewOpt('navLink' + capitaliseFirstLetter(viewType) + 'Click')

      if (typeof customAction === 'function') {
        customAction(date, ev)
      } else {
        if (typeof customAction === 'string') {
          viewType = customAction
        }
        this.zoomTo(date, viewType)
      }
    })

    let documentPointer = this.documentPointer = new PointerDragging(document)
    documentPointer.shouldIgnoreMove = true
    documentPointer.shouldWatchScroll = false
    documentPointer.emitter.on('pointerup', this.onDocumentPointerUp)

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

    this.documentPointer.destroy()

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
        viewType: this.opt('defaultView'),
        dateMarker: this.getInitialDate()
      })
    })
  }


  buildInitialState(): CalendarState {
    return {
      viewType: null,
      loadingLevel: 0,
      eventSourceLoadingLevel: 0,
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

      if (oldState.eventStore !== newState.eventStore || this.needsFullRerender) {
        if (oldState.eventStore) {
          this.isEventsUpdated = true
        }
      }

      if (oldState.dateProfile !== newState.dateProfile || this.needsFullRerender) {
        if (oldState.dateProfile) {
          this.publiclyTrigger('datesDestroy', [
            {
              view,
              el: view.el
            }
          ])
        }
        this.isDatesUpdated = true
      }

      if (oldState.viewType !== newState.viewType || this.needsFullRerender) {
        if (oldState.viewType) {
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


  requestRerender(needsFull = false) {
    this.needsRerender = true
    this.needsFullRerender = this.needsFullRerender || needsFull
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
    this.requestRerender()
  }


  // Rendering
  // -----------------------------------------------------------------------------------------------------------------

  executeRender() {
    let { needsFullRerender } = this // save before clearing

    // clear these BEFORE the render so that new values will accumulate during render
    this.needsRerender = false
    this.needsFullRerender = false

    this.isRendering = true
    this.renderComponent(needsFullRerender)
    this.isRendering = false

    // received a rerender request while rendering
    if (this.needsRerender) {
      this.delayedRerender()
    }
  }

  /*
  don't call this directly. use executeRender instead
  */
  renderComponent(needsFull) {
    let { state, component } = this
    let { viewType } = state
    let viewSpec = this.viewSpecs[viewType]
    let savedScroll = (needsFull && component) ? component.view.queryScroll() : null

    if (!viewSpec) {
      throw new Error(`View type "${viewType}" is not valid`)
    }

    // if event sources are still loading and progressive rendering hasn't been enabled,
    // keep rendering the last fully loaded set of events
    let renderableEventStore = this.renderableEventStore =
      (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
        this.renderableEventStore :
        state.eventStore

    let eventUiSingleBase = this.buildEventUiSingleBase(viewSpec.options, this)
    let eventUiBySource = this.buildEventUiBySource(state.eventSources)
    let eventUiBases = this.eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource)

    if (needsFull || !component) {

      if (component) {
        component.freezeHeight() // next component will unfreeze it
        component.destroy()
      }

      component = this.component = new CalendarComponent({
        calendar: this,
        dateEnv: this.dateEnv,
        theme: this.theme,
        options: this.optionsManager.computed
      }, this.el)
    }

    component.receiveProps(
      assignTo({}, state, {
        viewSpec,
        dateProfile: state.dateProfile,
        dateProfileGenerator: this.dateProfileGenerators[viewType],
        eventStore: renderableEventStore,
        eventUiBases,
        dateSelection: state.dateSelection,
        eventSelection: state.eventSelection,
        eventDrag: state.eventDrag,
        eventResize: state.eventResize
      })
    )

    if (savedScroll) {
      component.view.applyScroll(savedScroll)
    }

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


  setOption(name: string, value: any) {
    let oldDateEnv = this.dateEnv

    this.optionsManager.add(name, value)
    this.handleOptions(this.optionsManager.computed)

    if (name === 'height' || name === 'contentHeight' || name === 'aspectRatio') {
      this.resizeComponent()
    } else if (name === 'timeZone') {
      this.dispatch({
        type: 'CHANGE_TIMEZONE',
        oldDateEnv
      })
    } else if (name === 'defaultDate' || name === 'defaultView') {
      // can't change date this way. use gotoDate instead
    } else if (/^(event|select)(Overlap|Constraint|Allow)$/.test(name)) {
      // doesn't affect rendering. only interactions.
    } else {

      /* HACK
      has the same effect as calling this.requestRerender(true)
      but recomputes the state's dateProfile
      */
      this.needsFullRerender = true
      this.dispatch({
        type: 'SET_VIEW_TYPE',
        viewType: this.state.viewType
      })
    }
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


  handleOptions(options) {
    let pluginHooks = this.pluginSystem.hooks

    this.defaultAllDayEventDuration = createDuration(options.defaultAllDayEventDuration)
    this.defaultTimedEventDuration = createDuration(options.defaultTimedEventDuration)
    this.delayedRerender = this.buildDelayedRerender(options.rerenderDelay)
    this.theme = this.buildTheme(options)

    this.dateEnv = this.buildDateEnv(
      options.locale,
      options.timeZone,
      options.timeZoneImpl,
      options.firstDay,
      options.weekNumberCalculation,
      options.weekLabel,
      options.cmdFormatter
    )

    this.selectionConfig = this.buildSelectionConfig(options, this) // needs dateEnv. do after :(

    // ineffecient to do every time?
    this.viewSpecs = buildViewSpecs(
      pluginHooks.viewConfigs,
      this.optionsManager,
      pluginHooks.viewSpecTransformers
    )

    // ineffecient to do every time?
    this.dateProfileGenerators = mapHash(this.viewSpecs, (viewSpec) => {
      return new viewSpec.class.prototype.dateProfileGeneratorClass(viewSpec, this)
    })
  }


  // Trigger
  // -----------------------------------------------------------------------------------------------------------------


  hasPublicHandlers(name: string): boolean {
    return this.hasHandlers(name) ||
      this.opt(name) // handler specified in options
  }


  publiclyTrigger(name: string, args?) {
    let optHandler = this.opt(name)

    this.triggerWith(name, this, args)

    if (optHandler) {
      return optHandler.apply(this, args)
    }
  }


  publiclyTriggerAfterSizing(name, args) {
    let { afterSizingTriggers } = this;

    (afterSizingTriggers[name] || (afterSizingTriggers[name] = [])).push(args)
  }


  releaseAfterSizingTriggers() {
    let { afterSizingTriggers } = this

    for (let name in afterSizingTriggers) {
      for (let args of afterSizingTriggers[name]) {
        this.publiclyTrigger(name, args)
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
        this.optionsManager.add('visibleRange', dateOrRange) // will not rerender
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
    let viewTypes
    let i
    let spec

    // put views that have buttons first. there will be duplicates, but oh well
    viewTypes = this.component.header.viewsWithButtons // TODO: include footer as well?
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
    this.dispatch({
      type: 'SET_DATE_PROFILE',
      dateProfile: this.dateProfileGenerators[this.state.viewType].buildPrev(this.state.dateProfile)
    })
  }


  next() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE_PROFILE',
      dateProfile: this.dateProfileGenerators[this.state.viewType].buildNext(this.state.dateProfile)
    })
  }


  prevYear() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.dateEnv.addYears(this.state.dateProfile.currentDate, -1)
    })
  }


  nextYear() {
    this.unselect()
    this.dispatch({
      type: 'SET_DATE',
      dateMarker: this.dateEnv.addYears(this.state.dateProfile.currentDate, 1)
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
        dateMarker: this.dateEnv.add(this.state.dateProfile.currentDate, delta)
      })
    }
  }


  // for external API
  getDate(): Date {
    return this.dateEnv.toDate(this.state.dateProfile.currentDate)
  }


  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------


  formatDate(d: Date, formatter): string {
    const { dateEnv } = this
    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter)
    )
  }


  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: Date, d1: Date, settings) {
    const { dateEnv } = this
    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings, this.opt('defaultRangeSeparator')),
      settings
    )
  }


  formatIso(d: Date, omitTime?: boolean) {
    const { dateEnv } = this
    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  windowResize(ev: Event) {
    if ((ev as any).target === window) { // not a jqui resize event
      if (this.resizeComponent()) { // returns true on success
        this.publiclyTrigger('windowResize', [ this.view ])
      }
    }
  }


  updateSize() { // public
    this.resizeComponent()
  }


  resizeComponent(): boolean {

    if (!this.isResizing && this.component) {

      this.isResizing = true
      this.component.updateSize(true) // isResize=true
      this.isResizing = false

      return true // signal success
    }

    return false
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
    let arg = buildDateSpanApi(selection, this.dateEnv) as DateSelectionApi

    arg.jsEvent = pev ? pev.origEvent : null
    arg.view = this.view

    for (let transformer of this.pluginSystem.hooks.dateSelectionApiTransformers) {
      transformer(arg, selection, this)
    }

    this.publiclyTrigger('select', [ arg ])

    if (pev) {
      this.isRecentPointerDateSelect = true
    }
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
    let arg = buildDatePointApi(dateSpan, this.dateEnv) as DateClickApi

    arg.dayEl = dayEl
    arg.jsEvent = ev
    arg.view = view

    for (let transformer of this.pluginSystem.hooks.dateClickApiTransformers) {
      transformer(arg, dateSpan, this)
    }

    this.publiclyTrigger('dateClick', [ arg ])
  }


  // for unfocusing selections
  onDocumentPointerUp = (pev: PointerDragEvent) => {
    let { state, documentPointer } = this

    // touch-scrolling should never unfocus any type of selection
    if (!documentPointer.wasTouchScroll) {

      if (
        state.dateSelection && // an existing date selection?
        !this.isRecentPointerDateSelect // a new pointer-initiated date selection since last onDocumentPointerUp?
      ) {
        let unselectAuto = this.viewOpt('unselectAuto')
        let unselectCancel = this.viewOpt('unselectCancel')

        if (unselectAuto && (!unselectAuto || !elementClosest(documentPointer.downEl, unselectCancel))) {
          this.unselect(pev)
        }
      }

      if (
        state.eventSelection && // an existing event selected?
        !elementClosest(documentPointer.downEl, EventDragging.SELECTOR) // interaction DIDN'T start on an event
      ) {
        this.dispatch({ type: 'UNSELECT_EVENT' })
      }

    }

    this.isRecentPointerDateSelect = false
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


  addEvent(eventInput: EventInput, sourceInput?: any): EventApi | null {

    if (eventInput instanceof EventApi) {

      // not already present? don't want to add an old snapshot
      if (!this.state.eventStore.defs[eventInput.def.defId]) {
        this.dispatch({
          type: 'ADD_EVENTS',
          eventStore: eventTupleToStore(eventInput)
        })
      }

      return eventInput
    }

    let sourceId
    if (sourceInput && sourceInput.sourceId !== undefined) { // can accept a source object
      sourceId = sourceInput.sourceId
    } else if (typeof sourceInput === 'string') { // can accept a sourceId string
      sourceId = sourceInput
    } else {
      sourceId = ''
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


  getEventSourceById(id: string): EventSourceApi | null {
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


}

EmitterMixin.mixInto(Calendar)


// for memoizers
// -----------------------------------------------------------------------------------------------------------------


function buildDateEnv(locale, timeZone, timeZoneImpl, firstDay, weekNumberCalculation, weekLabel, cmdFormatter) {
  return new DateEnv({
    calendarSystem: 'gregory', // TODO: make this a setting
    timeZone,
    timeZoneImpl,
    locale: getLocale(locale),
    weekNumberCalculation,
    firstDay,
    weekLabel,
    cmdFormatter
  })
}


function buildTheme(calendarOptions) {
  let themeClass = getThemeSystemClass(calendarOptions.themeSystem || calendarOptions.theme)
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

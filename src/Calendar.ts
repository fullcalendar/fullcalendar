import { createElement, removeElement, applyStyle, prependToElement } from './util/dom-manip'
import { computeHeightAndMargins } from './util/dom-geom'
import { listenBySelector } from './util/dom-event'
import { capitaliseFirstLetter, debounce } from './util/misc'
import { globalDefaults, rtlDefaults } from './options'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import Toolbar from './Toolbar'
import OptionsManager from './OptionsManager'
import ViewSpecManager from './ViewSpecManager'
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
import { parseDateSpan, DateSpanInput, DateSpan } from './structs/date-span'
import reselector from './util/reselector'
import { assignTo } from './util/object'
import { RenderForceFlags } from './component/Component'
import browserContext from './common/browser-context'
import { DateRangeInput, rangeContainsMarker } from './datelib/date-range'
import { DateProfile } from './DateProfileGenerator'
import { EventSourceInput, parseEventSource, EventSourceHash } from './structs/event-source'
import { EventInput, EventDefHash, parseEvent } from './structs/event'
import { CalendarState, Action } from './reducers/types'
import EventSourceApi from './api/EventSourceApi'
import EventApi from './api/EventApi'
import { createEmptyEventStore, EventStore, eventTupleToStore } from './structs/event-store'
import { computeEventDefUis, EventUiHash } from './component/event-rendering'
import { BusinessHoursInput, parseBusinessHours } from './structs/business-hours'


export default class Calendar {

  // not for internal use. use options module directly instead.
  static defaults: any = globalDefaults
  static rtlDefaults: any = rtlDefaults

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

  buildDateEnv: any
  buildTheme: any
  computeEventDefUis: (eventDefs: EventDefHash, eventSources: EventSourceHash, options: any) => EventUiHash
  parseBusinessHours: (input: BusinessHoursInput) => EventStore

  optionsManager: OptionsManager
  viewSpecManager: ViewSpecManager
  theme: Theme
  dateEnv: DateEnv
  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration

  el: HTMLElement
  elThemeClassName: string
  elDirClassName: string
  contentEl: HTMLElement

  suggestedViewHeight: number
  ignoreUpdateViewSize: number = 0
  removeNavLinkListener: any
  windowResizeProxy: any

  viewsByType: { [viewName: string]: View } // holds all instantiated view instances, current or not
  view: View // the latest view, internal state, regardless of whether rendered or not
  renderedView: View // the view that is currently RENDERED, though it might not be most recent from internal state
  header: Toolbar
  footer: Toolbar

  state: CalendarState
  actionQueue = []
  isReducing: boolean = false

  isDisplaying: boolean = false // installed in DOM? accepting renders?
  isRendering: boolean = false // currently in the _render function?
  isSkeletonRendered: boolean = false // fyi: set within the debounce delay
  renderingPauseDepth: number = 0
  rerenderFlags: RenderForceFlags
  renderableEventStore: EventStore
  buildDelayedRerender: any
  delayedRerender: any
  afterSizingTriggers: any = {}


  constructor(el: HTMLElement, overrides: OptionsInput) {
    this.el = el
    this.viewsByType = {}

    this.optionsManager = new OptionsManager(overrides)
    this.viewSpecManager = new ViewSpecManager(this.optionsManager)

    this.buildDateEnv = reselector(buildDateEnv)
    this.buildTheme = reselector(buildTheme)
    this.buildDelayedRerender = reselector(buildDelayedRerender)
    this.computeEventDefUis = reselector(computeEventDefUis)
    this.parseBusinessHours = reselector((input) => {
      return parseBusinessHours(input, this)
    })

    this.handleOptions(this.optionsManager.computed)
    this.hydrate()
  }


  getView(): View {
    return this.view
  }


  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.isDisplaying) {
      this.isDisplaying = true
      this.renderableEventStore = createEmptyEventStore()
      this.bindGlobalHandlers()
      this.el.classList.add('fc')
      this._render()
    } else if (this.elementVisible()) {
      // mainly for the public API
      this.calcSize()
      this.updateViewSize(true) // force=true
    }
  }


  destroy() {
    if (this.isDisplaying) {
      this.isDisplaying = false
      this.unbindGlobalHandlers()
      this._destroy()
      this.el.classList.remove('fc')
    }
  }


  // General Rendering
  // -----------------------------------------------------------------------------------------------------------------


  _render() {
    let { rerenderFlags } = this
    this.rerenderFlags = null // clear for future requestRerender calls, which might happen during render

    this.isRendering = true

    this.applyElClassNames()

    if (!this.isSkeletonRendered) {
      this.renderSkeleton()
      this.isSkeletonRendered = true
    }

    this.freezeContentHeight() // do after contentEl is created in renderSkeleton

    this.renderView(rerenderFlags)

    if (this.view) { // toolbar rendering heavily depends on view
      this.renderToolbars(rerenderFlags)
    }

    if (this.updateViewSize()) { // success?
      this.renderedView.popScroll()
    }

    this.thawContentHeight()
    this.releaseAfterSizingTriggers()

    this.isRendering = false
    this.trigger('_rendered') // for tests

    // another render requested during this most recent rendering?
    if (this.rerenderFlags) {
      this.delayedRerender()
    }
  }


  _destroy() {
    this.view = null

    if (this.renderedView) {
      this.renderedView.removeElement()
      this.renderedView = null
    }

    if (this.header) {
      this.header.removeElement()
      this.header = null
    }

    if (this.footer) {
      this.footer.removeElement()
      this.footer = null
    }

    this.unrenderSkeleton()
    this.isSkeletonRendered = false

    this.removeElClassNames()
  }


  smash() { // rebuild view and rerender everything
    this.batchRendering(() => {
      let oldView = this.view

      // reinstantiate/rerender the entire view
      if (oldView) {
        this.viewsByType = {} // so that getViewByType will generate fresh views
        this.view = this.getViewByType(oldView.type) // will be rendered in renderView

        // recompute dateProfile
        this.setCurrentDateMarker(this.state.dateProfile.currentDate)

        // transfer scroll from old view
        let scroll = oldView.queryScroll()
        scroll.isLocked = true // will prevent view from computing own values
        this.view.addScroll(scroll)
      }

      this.requestRerender(true) // force=true
    })
  }


  // Classnames on root elements
  // -----------------------------------------------------------------------------------------------------------------


  applyElClassNames() {
    let classList = this.el.classList
    let elDirClassName = this.opt('isRtl') ? 'fc-rtl' : 'fc-ltr'
    let elThemeClassName = this.theme.getClass('widget')

    if (elDirClassName !== this.elDirClassName) {
      if (this.elDirClassName) {
        classList.remove(this.elDirClassName)
      }
      classList.add(elDirClassName)
      this.elDirClassName = elDirClassName
    }

    if (elThemeClassName !== this.elThemeClassName) {
      if (this.elThemeClassName) {
        classList.remove(this.elThemeClassName)
      }
      classList.add(elThemeClassName)
      this.elThemeClassName = elThemeClassName
    }
  }


  removeElClassNames() {
    let classList = this.el.classList

    if (this.elDirClassName) {
      classList.remove(this.elDirClassName)
      this.elDirClassName = null
    }

    if (this.elThemeClassName) {
      classList.remove(this.elThemeClassName)
      this.elThemeClassName = null
    }
  }


  // Skeleton Rendering
  // -----------------------------------------------------------------------------------------------------------------


  renderSkeleton() {

    prependToElement(
      this.el,
      this.contentEl = createElement('div', { className: 'fc-view-container' })
    )

    // event delegation for nav links
    this.removeNavLinkListener = listenBySelector(this.el, 'click', 'a[data-goto]', (ev, anchorEl) => {
      let gotoOptions: any = anchorEl.getAttribute('data-goto')
      gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {}

      let date = this.dateEnv.createMarker(gotoOptions.date)
      let viewType = gotoOptions.type

      // property like "navLinkDayClick". might be a string or a function
      let customAction = this.renderedView.opt('navLink' + capitaliseFirstLetter(viewType) + 'Click')

      if (typeof customAction === 'function') {
        customAction(date, ev)
      } else {
        if (typeof customAction === 'string') {
          viewType = customAction
        }
        this.zoomTo(date, viewType)
      }
    })
  }

  unrenderSkeleton() {
    removeElement(this.contentEl)
    this.removeNavLinkListener()
  }


  // Global Handlers
  // -----------------------------------------------------------------------------------------------------------------


  bindGlobalHandlers() {
    if (this.opt('handleWindowResize')) {
      window.addEventListener('resize',
        this.windowResizeProxy = debounce( // prevents rapid calls
          this.windowResize.bind(this),
          this.opt('windowResizeDelay')
        )
      )
    }
  }

  unbindGlobalHandlers() {
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

    this.dispatch({ type: 'ADD_EVENT_SOURCES', sources })
    this.setViewType(this.opt('defaultView'), this.getInitialDate())
  }


  buildInitialState(): CalendarState {
    return {
      loadingLevel: 0,
      eventSourceLoadingLevel: 0,
      dateProfile: null,
      eventSources: {},
      eventStore: createEmptyEventStore(),
      eventUis: {},
      businessHours: createEmptyEventStore(), // gets populated when we delegate rendering to View
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
        this.publiclyTrigger('loading', [ true, this.view ])
      } else if (oldState.loadingLevel && !newState.loadingLevel) {
        this.publiclyTrigger('loading', [ false, this.view ])
      }

      this.requestRerender()
    }
  }


  reduce(state: CalendarState, action: Action, calendar: Calendar): CalendarState {
    return reduce(state, action, calendar)
  }


  // Render Queue
  // -----------------------------------------------------------------------------------------------------------------


  /*
  the force flags force certain entities to be rerendered.
  it does not avoid the delay if one is configured.
  */
  requestRerender(forceFlags: RenderForceFlags = {}) {
    if (forceFlags === true || !this.rerenderFlags) {
      this.rerenderFlags = forceFlags // true, or the first object
    } else {
      assignTo(this.rerenderFlags, forceFlags) // merge the objects
    }

    this.delayedRerender() // will call a debounced-version of tryRerender
  }


  tryRerender() {
    if (
      this.isDisplaying && // must be accepting renders
      this.rerenderFlags && // indicates that a rerender was requested
      !this.renderingPauseDepth && // not paused
      !this.isRendering // not currently in the render loop
    ) {
      this._render()
    }
  }


  batchRendering(func) {
    this.renderingPauseDepth++
    func()
    this.renderingPauseDepth--
    this.requestRerender()
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  setOption(name: string, value: any) {
    let oldDateEnv = this.dateEnv

    this.optionsManager.add(name, value)
    this.handleOptions(this.optionsManager.computed)

    if (name === 'height' || name === 'contentHeight' || name === 'aspectRatio') {
      this.updateViewSize(true) // isResize=true
    } else if (name === 'timeZone') {
      this.dispatch({
        type: 'CHANGE_TIMEZONE',
        oldDateEnv
      })
    } else if (name === 'defaultDate') {
      // can't change date this way. use gotoDate instead
    } else if (/^(event|select)(Overlap|Constraint|Allow)$/.test(name)) {
      // doesn't affect rendering. only interactions.
    } else {
      this.smash()
    }
  }


  getOption(name: string) { // getter, used externally
    return this.optionsManager.computed[name]
  }


  opt(name: string) { // getter, used internally
    return this.optionsManager.computed[name]
  }


  handleOptions(options) {
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

    this.viewSpecManager.clearCache()
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


  renderView(forceFlags: RenderForceFlags) {
    let { state, renderedView } = this

    if (renderedView !== this.view) {
      if (renderedView) {
        renderedView.removeElement()
      }
      renderedView = this.renderedView = this.view
    }

    if (!renderedView.el) {
      renderedView.setElement(
        createElement('div', { className: 'fc-view fc-' + renderedView.type + '-view' })
      )
    } else {
      // because removeElement must have been called previously, which unbinds global handlers
      renderedView.bindGlobalHandlers()
    }

    if (!renderedView.el.parentNode) {
      this.contentEl.appendChild(renderedView.el)
    } else {
      renderedView.addScroll(renderedView.queryScroll())
    }

    // if event sources are still loading and progressive rendering hasn't been enabled,
    // keep rendering the last fully loaded set of events
    let renderableEventStore = this.renderableEventStore =
      (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
        this.renderableEventStore :
        state.eventStore

    // setting state here, eek
    let eventUis = this.state.eventUis = this.computeEventDefUis(
      renderableEventStore.defs,
      state.eventSources,
      renderedView.options
    )

    renderedView.render({
      dateProfile: state.dateProfile,
      eventStore: renderableEventStore,
      eventUis: eventUis,
      businessHours: this.parseBusinessHours(renderedView.opt('businessHours')),
      dateSelection: state.dateSelection,
      eventSelection: state.eventSelection,
      eventDrag: state.eventDrag,
      eventResize: state.eventResize
    }, forceFlags)
  }


  getViewByType(viewType: string) {
    return this.viewsByType[viewType] ||
      (this.viewsByType[viewType] = this.instantiateView(viewType))
  }


  // Given a view name for a custom view or a standard view, creates a ready-to-go View object
  instantiateView(viewType: string): View {
    let spec = this.viewSpecManager.getViewSpec(viewType)

    if (!spec) {
      throw new Error(`View type "${viewType}" is not valid`)
    }

    return new spec['class'](this, spec)
  }


  // Returns a boolean about whether the view is okay to instantiate at some point
  isValidViewType(viewType: string): boolean {
    return Boolean(this.viewSpecManager.getViewSpec(viewType))
  }


  changeView(viewType: string, dateOrRange: DateRangeInput | DateInput) {
    let dateMarker = null

    if (dateOrRange) {
      if ((dateOrRange as DateRangeInput).start && (dateOrRange as DateRangeInput).end) { // a range
        this.optionsManager.add('visibleRange', dateOrRange) // will not rerender
      } else { // a date
        dateMarker = this.dateEnv.createMarker(dateOrRange as DateInput) // just like gotoDate
      }
    }

    this.setViewType(viewType, dateMarker)
  }


  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  // needs to change
  zoomTo(dateMarker: DateMarker, viewType?: string) {
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = this.viewSpecManager.getViewSpec(viewType) ||
      this.viewSpecManager.getUnitViewSpec(viewType, this)

    if (spec) {
      this.setViewType(spec.type, dateMarker)
    } else {
      this.setCurrentDateMarker(dateMarker)
    }
  }


  // internal use only
  // does not cause a render
  setViewType(viewType: string, dateMarker?: DateMarker) {
    if (!this.view || this.view.type !== viewType) {
      this.view = this.getViewByType(viewType)

      // luckily, will always cause a rerender
      this.setCurrentDateMarker(dateMarker || this.state.dateProfile.currentDate)
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
    this.setDateProfile(
      this.view.dateProfileGenerator.buildPrev(this.state.dateProfile)
    )
  }


  next() {
    this.setDateProfile(
      this.view.dateProfileGenerator.buildNext(this.state.dateProfile)
    )
  }


  prevYear() {
    this.setCurrentDateMarker(
      this.dateEnv.addYears(this.state.dateProfile.currentDate, -1)
    )
  }


  nextYear() {
    this.setCurrentDateMarker(
      this.dateEnv.addYears(this.state.dateProfile.currentDate, 1)
    )
  }


  today() {
    this.setCurrentDateMarker(this.getNow())
  }


  gotoDate(zonedDateInput) {
    this.setCurrentDateMarker(
      this.dateEnv.createMarker(zonedDateInput)
    )
  }


  incrementDate(deltaInput) { // is public facing
    let delta = createDuration(deltaInput)

    if (delta) { // else, warn about invalid input?
      this.setCurrentDateMarker(
        this.dateEnv.add(this.state.dateProfile.currentDate, delta)
      )
    }
  }


  // for external API
  getDate(): Date {
    return this.dateEnv.toDate(this.state.dateProfile.currentDate)
  }


  setCurrentDateMarker(date: DateMarker) { // internal use only
    this.setDateProfile(
      this.view.computeDateProfile(date)
    )
  }


  setDateProfile(dateProfile: DateProfile) {
    this.dispatch({
      type: 'SET_DATE_PROFILE',
      dateProfile: dateProfile
    })
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


  formatRange(d0: Date, d1: Date, formatter, isEndExclusive?: boolean) {
    const { dateEnv } = this
    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(formatter, this.opt('defaultRangeSeparator')),
      { isEndExclusive }
    )
  }


  formatIso(d: Date, omitTime?: boolean) {
    const { dateEnv } = this
    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }


  // Resizing
  // -----------------------------------------------------------------------------------------------------------------


  getSuggestedViewHeight(): number {
    if (this.suggestedViewHeight == null) {
      this.calcSize()
    }
    return this.suggestedViewHeight
  }


  isHeightAuto(): boolean {
    return this.opt('contentHeight') === 'auto' || this.opt('height') === 'auto'
  }


  updateViewSize(isResize: boolean = false) {
    let { renderedView } = this
    let scroll

    if (!this.ignoreUpdateViewSize && renderedView) {

      if (isResize) {
        this.calcSize()
        scroll = renderedView.queryScroll()
      }

      this.ignoreUpdateViewSize++

      renderedView.updateSize(
        this.getSuggestedViewHeight(),
        this.isHeightAuto(),
        isResize
      )

      this.ignoreUpdateViewSize--

      if (isResize) {
        renderedView.applyScroll(scroll)
      }

      return true // signal success
    }
  }


  calcSize() {
    if (this.elementVisible()) {
      this._calcSize()
    }
  }


  _calcSize() { // assumes elementVisible
    let contentHeightInput = this.opt('contentHeight')
    let heightInput = this.opt('height')

    if (typeof contentHeightInput === 'number') { // exists and not 'auto'
      this.suggestedViewHeight = contentHeightInput
    } else if (typeof contentHeightInput === 'function') { // exists and is a function
      this.suggestedViewHeight = contentHeightInput()
    } else if (typeof heightInput === 'number') { // exists and not 'auto'
      this.suggestedViewHeight = heightInput - this.queryToolbarsHeight()
    } else if (typeof heightInput === 'function') { // exists and is a function
      this.suggestedViewHeight = heightInput() - this.queryToolbarsHeight()
    } else if (heightInput === 'parent') { // set to height of parent element
      this.suggestedViewHeight = (this.el.parentNode as HTMLElement).offsetHeight - this.queryToolbarsHeight()
    } else {
      this.suggestedViewHeight = Math.round(
        this.contentEl.offsetWidth /
        Math.max(this.opt('aspectRatio'), .5)
      )
    }
  }


  elementVisible(): boolean {
    return Boolean(this.el.offsetWidth)
  }


  windowResize(ev: Event) {
    if (
      // the purpose: so we don't process jqui "resize" events that have bubbled up
      // cast to any because .target, which is Element, can't be compared to window for some reason.
      (ev as any).target === window &&
      this.renderedView &&
      this.renderedView.renderedFlags.dates
    ) {
      if (this.updateViewSize(true)) { // force=true, returns true on success
        this.publiclyTrigger('windowResize', [ this.renderedView ])
      }
    }
  }


  // Height "Freezing"
  // -----------------------------------------------------------------------------------------------------------------


  freezeContentHeight() {
    applyStyle(this.contentEl, {
      width: '100%',
      height: this.contentEl.offsetHeight,
      overflow: 'hidden'
    })
  }


  thawContentHeight() {
    applyStyle(this.contentEl, {
      width: '',
      height: '',
      overflow: ''
    })
  }


  // Toolbar
  // -----------------------------------------------------------------------------------------------------------------


  renderToolbars(forceFlags: RenderForceFlags) {
    let headerLayout = this.opt('header')
    let footerLayout = this.opt('footer')
    let now = this.getNow()
    let dateProfile = this.state.dateProfile
    let view = this.view // use the view that intends to be rendered
    let todayInfo = view.dateProfileGenerator.build(now)
    let prevInfo = view.dateProfileGenerator.buildPrev(dateProfile)
    let nextInfo = view.dateProfileGenerator.buildNext(dateProfile)
    let props = {
      title: view.title,
      activeButton: view.type,
      isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
      isPrevEnabled: prevInfo.isValid,
      isNextEnabled: nextInfo.isValid
    }

    if ((!headerLayout || forceFlags === true) && this.header) {
      this.header.removeElement()
      this.header = null
    }

    if (headerLayout) {
      if (!this.header) {
        this.header = new Toolbar(this, 'fc-header-toolbar')
        prependToElement(this.el, this.header.el)
      }
      this.header.render(
        assignTo({ layout: headerLayout }, props),
        forceFlags
      )
    }

    if ((!footerLayout || forceFlags === true) && this.footer) {
      this.footer.removeElement()
      this.footer = null
    }

    if (footerLayout) {
      if (!this.footer) {
        this.footer = new Toolbar(this, 'fc-footer-toolbar')
        prependToElement(this.el, this.footer.el)
      }
      this.footer.render(
        assignTo({ layout: footerLayout }, props),
        forceFlags
      )
    }
  }


  queryToolbarsHeight() {
    let height = 0

    if (this.header) {
      height += computeHeightAndMargins(this.header.el)
    }

    if (this.footer) {
      height += computeHeightAndMargins(this.footer.el)
    }

    return height
  }


  // DateSpan / DayClick
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
      this.dispatch({
        type: 'SELECT_DATES',
        selection: selection
      })
      browserContext.reportDateSelection(this, selection)
    }
  }


  // public method
  unselect(ev?: UIEvent) {
    if (browserContext.dateSelectedCalendar === this) {
      browserContext.unselectDates()
    }
  }


  // TODO: receive pev?
  triggerDayClick(dateSpan: DateSpan, dayEl: HTMLElement, view: View, ev: UIEvent) {
    this.publiclyTrigger('dateClick', [
      {
        date: this.dateEnv.toDate(dateSpan.range.start),
        dateStr: this.dateEnv.formatIso(dateSpan.range.start, { omitTime: dateSpan.isAllDay }),
        isAllDay: dateSpan.isAllDay,
        dayEl,
        jsEvent: ev,
        view
      }
    ])
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
    this.requestRerender({ events: true }) // TODO: test this
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


// for reselectors
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

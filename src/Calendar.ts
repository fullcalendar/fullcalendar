import { createElement, removeElement, applyStyle, prependToElement } from './util/dom-manip'
import { computeHeightAndMargins } from './util/dom-geom'
import { listenBySelector } from './util/dom-event'
import { capitaliseFirstLetter, debounce } from './util/misc'
import { globalDefaults, rtlDefaults } from './options'
import GlobalEmitter from './common/GlobalEmitter'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import Toolbar from './Toolbar'
import OptionsManager from './OptionsManager'
import ViewSpecManager from './ViewSpecManager'
import View from './View'
import Theme from './theme/Theme'
import UnzonedRange from './models/UnzonedRange'
import { getThemeSystemClass } from './theme/ThemeRegistry'
import { RangeInput, OptionsInput, EventObjectInput, EventSourceInput } from './types/input-types'
import { getLocale } from './datelib/locale'
import { DateEnv, DateInput } from './datelib/env'
import { DateMarker, startOfDay } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { Duration, createDuration } from './datelib/duration'
import { CalendarState, reduce } from './reducers/main'
import { parseSelection, SelectionInput } from './reducers/selection'
import reselector from './util/reselector'
import { assignTo } from './util/object'
import { RenderForceFlags } from './component/Component'


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

  isRendered: boolean = false
  isSkeletonRendered: boolean = false

  viewsByType: { [viewName: string]: View } // holds all instantiated view instances, current or not
  view: View // the latest view, internal state, regardless of whether rendered or not
  renderedView: View // the view that is currently RENDERED, though it might not be most recent from internal state
  header: Toolbar
  footer: Toolbar

  state: CalendarState
  actionQueue = []
  isReducing: boolean = false

  renderingPauseDepth: number = 0
  rerenderFlags: RenderForceFlags
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

    this.handleOptions(this.optionsManager.computed)
    this.constructed()
    this.hydrate()
  }


  constructed() {
    // useful for monkeypatching. used?
  }


  getView(): View {
    return this.view
  }


  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.isRendered) {
      this.bindGlobalHandlers()
      this.el.classList.add('fc')
      this._render()
      this.isRendered = true
      this.trigger('initialRender')
      Calendar.trigger('initialRender', this)
    } else if (this.elementVisible()) {
      // mainly for the public API
      this.calcSize()
      this.updateViewSize()
    }
  }


  destroy() {
    if (this.isRendered) {
      this._destroy()
      this.el.classList.remove('fc')
      this.isRendered = false
      this.unbindGlobalHandlers()
      this.trigger('destroy')
      Calendar.trigger('destroy', this)
    }
  }


  // General Rendering
  // -----------------------------------------------------------------------------------------------------------------


  _render(forceFlags: RenderForceFlags = {}) {
    this.applyElClassNames()

    if (!this.isSkeletonRendered) {
      this.renderSkeleton()
      this.isSkeletonRendered = true
    }

    this.freezeContentHeight() // do after contentEl is created in renderSkeleton
    this.renderToolbars(forceFlags)
    this.renderView(forceFlags)
    this.thawContentHeight()
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


  // Classnames on root elements
  // -----------------------------------------------------------------------------------------------------------------


  applyElClassNames() {
    let classList = this.el.classList
    let elDirClassName = this.opt('isRTL') ? 'fc-rtl' : 'fc-ltr'
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
    this.contentEl = null

    this.removeNavLinkListener()
  }


  // Global Handlers
  // -----------------------------------------------------------------------------------------------------------------


  bindGlobalHandlers() {
    GlobalEmitter.needed()

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
    GlobalEmitter.unneeded()

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

    if (singleRawSource) {
      rawSources.unshift(singleRawSource)
    }

    for (let rawSource of rawSources) {
      this.dispatch({ type: 'ADD_EVENT_SOURCE', rawSource })
    }

    this.dispatch({ type: 'SET_VIEW_TYPE', viewType: this.opt('defaultView') })
  }


  buildInitialState(): CalendarState {
    return {
      loadingLevel: 0,
      currentDate: this.getInitialDate(),
      dateProfile: null,
      eventSources: {},
      eventStore: {
        defs: {},
        instances: {}
      },
      selection: null,
      dragState: null,
      eventResizeState: null,
      businessHoursDef: false,
      selectedEventInstanceId: null
    }
  }


  dispatch(action) {
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


  reduce(state: CalendarState, action: object, calendar: Calendar): CalendarState {
    return reduce(state, action, calendar)
  }


  // Render Queue
  // -----------------------------------------------------------------------------------------------------------------


  requestRerender(forceFlags: RenderForceFlags = {}) {
    if (forceFlags === true || !this.rerenderFlags) {
      this.rerenderFlags = forceFlags // true, or the first object
    } else {
      assignTo(this.rerenderFlags, forceFlags) // merge the objects
    }

    this.delayedRerender()
  }


  tryRerender() {
    if (
      !this.renderingPauseDepth && // not paused
      this.isRendered && // must be currently rendered
      this.rerenderFlags // indicates that a rerender was requested
    ) {
      this._render(this.rerenderFlags)
      this.rerenderFlags = null
      this.releaseAfterSizingTriggers()
      this.trigger('_rendered')
    }
  }


  pauseRendering() {
    this.renderingPauseDepth++
  }


  resumeRendering() {
    this.renderingPauseDepth--
    this.requestRerender()
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  // public getter/setter
  option(name: string | object, value?) {
    if (typeof name === 'string') {
      if (value === undefined) { // getter
        return this.opt(name)
      } else { // setter for individual option
        this.setOptions({
          [name]: value
        })
      }
    } else if (typeof name === 'object' && name) { // compound setter with object input (non-null)
      this.setOptions(name)
    }
  }


  setOptions(optionsHash) {
    this.optionsManager.add(optionsHash)
    this.handleOptions(this.optionsManager.computed)

    let optionCnt = 0
    let optionName

    for (optionName in optionsHash) {
      optionCnt++
    }

    if (optionCnt === 1) {
      if (optionName === 'height' || optionName === 'contentHeight' || optionName === 'aspectRatio') {
        this.updateViewSize(true) // isResize=true
        return
      } else if (optionName === 'defaultDate') {
        return // can't change date this way. use gotoDate instead
      } else if (/^(event|select)(Overlap|Constraint|Allow)$/.test(optionName)) {
        return // doesn't affect rendering. only interactions.
      }
    }

    this.viewsByType = {}
    this.requestRerender(true) // force=true
  }


  handleOptions(options) {
    this.defaultAllDayEventDuration = createDuration(options.defaultAllDayEventDuration)
    this.defaultTimedEventDuration = createDuration(options.defaultTimedEventDuration)
    this.delayedRerender = this.buildDelayedRerender(options.eventRenderWait) // TODO: rename settings
    this.theme = this.buildTheme(options)
    this.dateEnv = this.buildDateEnv(
      options.locale,
      options.timezone,
      options.firstDay,
      options.weekNumberCalculation,
      options.weekLabel
    )

    this.viewSpecManager.clearCache()
  }


  opt(optName) {
    return this.optionsManager.computed[optName]
  }


  // Trigger
  // -----------------------------------------------------------------------------------------------------------------


  hasPublicHandlers(name: string): boolean {
    return this.hasHandlers(name) ||
      this.opt(name) // handler specified in options
  }


  publiclyTrigger(name: string, args) {
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
    }

    if (!renderedView.el.parentNode) {
      this.contentEl.appendChild(renderedView.el)
    } else {
      renderedView.addScroll(renderedView.queryScroll())
    }

    renderedView.render({
      dateProfile: state.dateProfile,
      eventStore: state.eventStore,
      selection: state.selection,
      dragState: state.dragState,
      eventResizeState: state.eventResizeState,
      businessHoursDef: renderedView.opt('businessHours'),
      selectedEventInstanceId: state.selectedEventInstanceId
    }, forceFlags)

    if (this.updateViewSize()) { // success?
      renderedView.popScroll()
    }
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


  changeView(viewType: string, dateOrRange: RangeInput | DateInput) {
    let dateMarker = null

    if (dateOrRange) {
      if ((dateOrRange as RangeInput).start && (dateOrRange as RangeInput).end) { // a range
        this.optionsManager.add({ // will not rerender
          visibleRange: dateOrRange
        })
      } else { // a date
        dateMarker = this.dateEnv.createMarker(dateOrRange as DateInput) // just like gotoDate
      }
    }

    this.dispatch({ type: 'SET_VIEW_TYPE', viewType, dateMarker })
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
      this.dispatch({ type: 'SET_VIEW_TYPE', viewType: spec.type, dateMarker })
    } else {
      this.dispatch({ type: 'NAVIGATE_DATE', dateMarker })
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
    this.dispatch({ type: 'NAVIGATE_PREV' })
  }


  next() {
    this.dispatch({ type: 'NAVIGATE_NEXT' })
  }


  prevYear() {
    this.dispatch({ type: 'NAVIGATE_PREV_YEAR' })
  }


  nextYear() {
    this.dispatch({ type: 'NAVIGATE_NEXT_YEAR' })
  }


  today() {
    this.dispatch({ type: 'NAVIGATE_TODAY' })
  }


  gotoDate(zonedDateInput) {
    this.dispatch({
      type: 'NAVIGATE_DATE',
      dateMarker: this.dateEnv.createMarker(zonedDateInput)
    })
  }


  incrementDate(delta) { // is public facing
    this.dispatch({
      type: 'NAVIGATE_DELTA',
      delta: createDuration(delta)
    })
  }


  // for external API
  getDate(): Date {
    return this.dateEnv.toDate(this.state.currentDate)
  }


  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------


  formatDate(d: Date, formatter): string {
    const { dateEnv } = this
    return dateEnv.format(dateEnv.createMarker(d), createFormatter(formatter))
  }


  formatRange(d0: Date, d1: Date, formatter, isEndExclusive?: boolean) {
    const { dateEnv } = this
    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(formatter),
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
      this.renderedView.isDatesRendered
    ) {
      if (this.updateViewSize(true)) { // isResize=true, returns true on success
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
      isTodayEnabled: todayInfo.isValid && !dateProfile.currentUnzonedRange.containsDate(now),
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


  // Selection
  // -----------------------------------------------------------------------------------------------------------------


  // this public method receives start/end dates in any format, with any timezone
  //
  // args were changed
  //
  select(dateOrObj: DateInput | object, endDate?: DateInput) {
    let selectionInput: SelectionInput

    if (endDate == null) {
      selectionInput = dateOrObj as SelectionInput
    } else {
      selectionInput = {
        start: dateOrObj,
        end: endDate
      } as SelectionInput
    }

    let selection = parseSelection(selectionInput, this.dateEnv)

    // TODO: use dispatch
    console.log(selection)
  }


  unselect() { // safe to be called before renderView
    // TODO: use dispatch
  }


  // External Dragging
  // -----------------------------------------------------------------------------------------------------------------


  handlExternalDragStart(ev, el, skipBinding) {
    if (this.renderedView) {
      this.renderedView.handlExternalDragStart(ev, el, skipBinding)
    }
  }


  handleExternalDragMove(ev) {
    if (this.renderedView) {
      this.renderedView.handleExternalDragMove(ev)
    }
  }


  handleExternalDragStop(ev) {
    if (this.renderedView) {
      this.renderedView.handleExternalDragStop(ev)
    }
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


  // will return `null` if invalid range
  parseUnzonedRange(rangeInput: RangeInput): UnzonedRange {
    let start = null
    let end = null

    if (rangeInput.start) {
      start = this.dateEnv.createMarker(rangeInput.start)
    }

    if (rangeInput.end) {
      end = this.dateEnv.createMarker(rangeInput.end)
    }

    if (!start && !end) {
      return null
    }

    if (start && end && end < start) {
      return null
    }

    return new UnzonedRange(start, end)
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


  rerenderEvents() { // API method. destroys old events if previously rendered.
    this.requestRerender({ events: true }) // TODO: test this
  }


  renderEvent(eventInput: EventObjectInput, isSticky: boolean = false) {
    // TODO
  }


  // legacyQuery operates on legacy event instance objects
  removeEvents(legacyQuery) {
    // TODO
  }


  // legacyQuery operates on legacy event instance objects
  clientEvents(legacyQuery) {
    // TODO
  }


  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------


  getEventSources(): EventSource {
    return null // TODO
  }


  getEventSourceById(id): EventSource {
    return null // TODO
  }


  addEventSource(sourceInput: EventSourceInput) {
    this.dispatch({ type: 'ADD_EVENT_SOURCE', rawSource: sourceInput })
  }


  removeEventSources(sourceMultiQuery) {
    // TODO
  }


  removeEventSource(sourceQuery) {
    // TODO
  }


  refetchEvents() {
    this.dispatch({ type: 'FETCH_ALL_EVENT_SOURCES' })
  }


  refetchEventSources(sourceMultiQuery) {
    // TODO
  }


}

EmitterMixin.mixIntoObj(Calendar) // for global registry
EmitterMixin.mixInto(Calendar)


// for reselectors
// -----------------------------------------------------------------------------------------------------------------


function buildDateEnv(locale, timezone, firstDay, weekNumberCalculation, weekLabel) {
  return new DateEnv({
    calendarSystem: 'gregory',
    timeZone: timezone,
    locale: getLocale(locale),
    weekNumberCalculation: weekNumberCalculation,
    firstDay: firstDay,
    weekLabel: weekLabel
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

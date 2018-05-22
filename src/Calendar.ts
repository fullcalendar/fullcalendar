import { createElement, removeElement, applyStyle, prependToElement, forceClassName } from './util/dom-manip'
import { computeHeightAndMargins } from './util/dom-geom'
import { listenBySelector } from './util/dom-event'
import { capitaliseFirstLetter, debounce } from './util/misc'
import { globalDefaults, rtlDefaults } from './options'
import Iterator from './common/Iterator'
import GlobalEmitter from './common/GlobalEmitter'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { default as ListenerMixin, ListenerInterface } from './common/ListenerMixin'
import Toolbar from './Toolbar'
import OptionsManager from './OptionsManager'
import ViewSpecManager from './ViewSpecManager'
import View from './View'
import Theme from './theme/Theme'
import Constraints from './Constraints'
import UnzonedRange from './models/UnzonedRange'
import ComponentFootprint from './models/ComponentFootprint'
import EventDateProfile from './models/event/EventDateProfile'
import EventManager from './models/EventManager'
import BusinessHourGenerator from './models/BusinessHourGenerator'
import EventSourceParser from './models/event-source/EventSourceParser'
import EventDefParser from './models/event/EventDefParser'
import SingleEventDef from './models/event/SingleEventDef'
import EventDefMutation from './models/event/EventDefMutation'
import EventSource from './models/event-source/EventSource'
import { getThemeSystemClass } from './theme/ThemeRegistry'
import { RangeInput, OptionsInput, EventObjectInput, EventSourceInput } from './types/input-types'
import { getLocale } from './datelib/locale'
import { DateEnv, DateInput } from './datelib/env'
import { DateMarker, startOfDay } from './datelib/marker'
import { Duration, createDuration } from './datelib/duration'

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
  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  view: View // current View object
  viewsByType: { [viewName: string]: View } // holds all instantiated view instances, current or not
  currentDate: DateMarker // private (public API should use getDate instead)
  theme: Theme
  eventManager: EventManager
  constraints: Constraints
  optionsManager: OptionsManager
  viewSpecManager: ViewSpecManager
  businessHourGenerator: BusinessHourGenerator
  loadingLevel: number = 0 // number of simultaneous loading tasks

  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration
  dateEnv: DateEnv

  el: HTMLElement
  contentEl: HTMLElement
  suggestedViewHeight: number
  ignoreUpdateViewSize: number = 0
  freezeContentHeightDepth: number = 0
  removeNavLinkListener: any
  windowResizeProxy: any

  header: Toolbar
  footer: Toolbar
  toolbarsManager: Iterator


  constructor(el: HTMLElement, overrides: OptionsInput) {

    // declare the current calendar instance relies on GlobalEmitter. needed for garbage collection.
    // unneeded() is called in destroy.
    GlobalEmitter.needed()

    this.el = el
    this.viewsByType = {}

    this.optionsManager = new OptionsManager(this, overrides)
    this.viewSpecManager = new ViewSpecManager(this.optionsManager, this)
    this.initDateEnv() // needs to happen after options hash initialized
    this.initCurrentDate()
    this.initEventManager()
    this.constraints = new Constraints(this.eventManager, this)

    this.constructed()
  }


  constructed() {
    // useful for monkeypatching. used?
  }


  getView(): View {
    return this.view
  }


  publiclyTrigger(name: string, triggerInfo) {
    let optHandler = this.opt(name)
    let context
    let args

    if (Array.isArray(triggerInfo)) {
      args = triggerInfo
    } else if (typeof triggerInfo === 'object' && triggerInfo) { // non-null object
      context = triggerInfo.context
      args = triggerInfo.args
    }

    if (context == null) {
      context = this.el // fallback context
    }

    if (!args) {
      args = []
    }

    this.triggerWith(name, context, args) // Emitter's method

    if (optHandler) {
      return optHandler.apply(context, args)
    }
  }


  hasPublicHandlers(name: string): boolean {
    return this.hasHandlers(name) ||
      this.opt(name) // handler specified in options
  }


  // Options Public API
  // -----------------------------------------------------------------------------------------------------------------


  // public getter/setter
  option(name: string | object, value?) {
    let newOptionHash

    if (typeof name === 'string') {
      if (value === undefined) { // getter
        return this.optionsManager.get(name)
      } else { // setter for individual option
        newOptionHash = {}
        newOptionHash[name] = value
        this.optionsManager.add(newOptionHash)
      }
    } else if (typeof name === 'object' && name) { // compound setter with object input (non-null)
      this.optionsManager.add(name)
    }
  }


  // private getter
  opt(name: string) {
    return this.optionsManager.get(name)
  }


  // View
  // -----------------------------------------------------------------------------------------------------------------


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


  changeView(viewName: string, dateOrRange: RangeInput | DateInput) {

    if (dateOrRange) {
      if ((dateOrRange as RangeInput).start && (dateOrRange as RangeInput).end) { // a range
        this.optionsManager.recordOverrides({ // will not rerender
          visibleRange: dateOrRange
        })
      } else { // a date
        this.currentDate = this.dateEnv.createMarker(dateOrRange as DateInput) // just like gotoDate
      }
    }

    this.renderView(viewName)
  }


  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  // needs to change
  zoomTo(newDate: DateMarker, viewType?: string) {
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = this.viewSpecManager.getViewSpec(viewType) ||
      this.viewSpecManager.getUnitViewSpec(viewType)

    this.currentDate = newDate
    this.renderView(spec ? spec.type : null)
  }


  // Current Date
  // -----------------------------------------------------------------------------------------------------------------


  initCurrentDate() {
    let defaultDateInput = this.opt('defaultDate')

    // compute the initial ambig-timezone date
    if (defaultDateInput != null) {
      this.currentDate = this.dateEnv.createMarker(defaultDateInput)
    } else {
      this.currentDate = this.getNow() // getNow already returns unzoned
    }
  }


  prev() {
    let view = this.view
    let prevInfo = view.dateProfileGenerator.buildPrev(view.get('dateProfile'))

    if (prevInfo.isValid) {
      this.currentDate = prevInfo.date
      this.renderView()
    }
  }


  next() {
    let view = this.view
    let nextInfo = view.dateProfileGenerator.buildNext(view.get('dateProfile'))

    if (nextInfo.isValid) {
      this.currentDate = nextInfo.date
      this.renderView()
    }
  }


  prevYear() {
    this.currentDate = this.dateEnv.addYears(this.currentDate, -1)
    this.renderView()
  }


  nextYear() {
    this.currentDate = this.dateEnv.addYears(this.currentDate, 1)
    this.renderView()
  }


  today() {
    this.currentDate = this.getNow() // should deny like prev/next?
    this.renderView()
  }


  gotoDate(zonedDateInput) {
    this.currentDate = this.dateEnv.createMarker(zonedDateInput)
    this.renderView()
  }


  incrementDate(delta) { // is public facing
    this.currentDate = this.dateEnv.add(this.currentDate, createDuration(delta))
    this.renderView()
  }


  // for external API
  getDate(): Date {
    return this.dateEnv.toDate(this.currentDate)
  }


  // Loading Triggering
  // -----------------------------------------------------------------------------------------------------------------


  // Should be called when any type of async data fetching begins
  pushLoading() {
    if (!(this.loadingLevel++)) {
      this.publiclyTrigger('loading', [ true, this.view ])
    }
  }


  // Should be called when any type of async data fetching completes
  popLoading() {
    if (!(--this.loadingLevel)) {
      this.publiclyTrigger('loading', [ false, this.view ])
    }
  }


  // High-level Rendering
  // -----------------------------------------------------------------------------------


  render() {
    if (!this.contentEl) {
      this.initialRender()
    } else if (this.elementVisible()) {
      // mainly for the public API
      this.calcSize()
      this.updateViewSize()
    }
  }

  initialRender() {
    let el = this.el

    el.classList.add('fc')

    // event delegation for nav links
    this.removeNavLinkListener = listenBySelector(el, 'click', 'a[data-goto]', (ev, anchorEl) => {
      let gotoOptions: any = anchorEl.getAttribute('data-goto')
      gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {}

      let date = this.dateEnv.createMarker(gotoOptions.date)
      let viewType = gotoOptions.type

      // property like "navLinkDayClick". might be a string or a function
      let customAction = this.view.opt('navLink' + capitaliseFirstLetter(viewType) + 'Click')

      if (typeof customAction === 'function') {
        customAction(date, ev)
      } else {
        if (typeof customAction === 'string') {
          viewType = customAction
        }
        this.zoomTo(date, viewType)
      }
    })

    // called immediately, and upon option change
    this.optionsManager.watch('settingTheme', [ '?theme', '?themeSystem' ], (opts) => {
      let themeClass = getThemeSystemClass(opts.themeSystem || opts.theme)
      let theme = new themeClass(this.optionsManager)
      let widgetClass = theme.getClass('widget')

      this.theme = theme

      if (widgetClass) {
        el.classList.add(widgetClass)
      }
    }, () => {
      let widgetClass = this.theme.getClass('widget')

      this.theme = null

      if (widgetClass) {
        el.classList.remove(widgetClass)
      }
    })

    this.optionsManager.watch('settingBusinessHourGenerator', [ '?businessHours' ], (deps) => {
      this.businessHourGenerator = new BusinessHourGenerator(deps.businessHours, this)

      if (this.view) {
        this.view.set('businessHourGenerator', this.businessHourGenerator)
      }
    }, () => {
      this.businessHourGenerator = null
    })

    // called immediately, and upon option change.
    // HACK: locale often affects isRTL, so we explicitly listen to that too.
    this.optionsManager.watch('applyingDirClasses', [ '?isRTL', '?locale' ], (opts) => {
      forceClassName(el, 'fc-ltr', !opts.isRTL)
      forceClassName(el, 'fc-rtl', opts.isRTL)
    })

    prependToElement(el, this.contentEl = createElement('div', { className: 'fc-view-container' }))

    this.initToolbars()
    this.renderHeader()
    this.renderFooter()
    this.renderView(this.opt('defaultView'))

    if (this.opt('handleWindowResize')) {
      window.addEventListener('resize',
        this.windowResizeProxy = debounce( // prevents rapid calls
          this.windowResize.bind(this),
          this.opt('windowResizeDelay')
        )
      )
    }

    this.trigger('initialRender')
    Calendar.trigger('initialRender', this)
  }


  destroy() {
    let wasRendered = Boolean(this.contentEl && this.contentEl.parentNode)

    if (this.view) {
      this.clearView()
    }

    this.toolbarsManager.proxyCall('removeElement')
    removeElement(this.contentEl)
    this.el.classList.remove('fc')
    this.el.classList.remove('fc-ltr')
    this.el.classList.remove('fc-rtl')

    // removes theme-related root className
    this.optionsManager.unwatch('settingTheme')
    this.optionsManager.unwatch('settingBusinessHourGenerator')

    if (this.removeNavLinkListener) {
      this.removeNavLinkListener()
      this.removeNavLinkListener = null
    }

    if (this.windowResizeProxy) {
      window.removeEventListener('resize', this.windowResizeProxy)
      this.windowResizeProxy = null
    }

    if (wasRendered) {
      GlobalEmitter.unneeded()

      this.trigger('destroy')
      Calendar.trigger('destroy', this)
    }
  }


  elementVisible(): boolean {
    return Boolean(this.el.offsetWidth)
  }


  // Render Queue
  // -----------------------------------------------------------------------------------------------------------------


  bindViewHandlers(view) {

    view.watch('titleForCalendar', [ 'title' ], (deps) => { // TODO: better system
      if (view === this.view) { // hack
        this.setToolbarsTitle(deps.title)
      }
    })

    view.watch('dateProfileForCalendar', [ 'dateProfile' ], (deps) => {
      if (view === this.view) { // hack
        this.currentDate = deps.dateProfile.date // might have been constrained by view dates
        this.updateToolbarButtons(deps.dateProfile)
      }
    })
  }


  unbindViewHandlers(view) {
    view.unwatch('titleForCalendar')
    view.unwatch('dateProfileForCalendar')
  }


  // View Rendering
  // -----------------------------------------------------------------------------------


  // Renders a view because of a date change, view-type change, or for the first time.
  // If not given a viewType, keep the current view but render different dates.
  // Accepts an optional scroll state to restore to.
  renderView(viewType?: string) {
    let oldView = this.view
    let newView

    this.freezeContentHeight()

    if (oldView && viewType && oldView.type !== viewType) {
      this.clearView()
    }

    // if viewType changed, or the view was never created, create a fresh view
    if (!this.view && viewType) {
      newView = this.view =
        this.viewsByType[viewType] ||
        (this.viewsByType[viewType] = this.instantiateView(viewType))

      this.bindViewHandlers(newView)

      newView.startBatchRender() // so that setElement+setDate rendering are joined

      let viewEl = createElement('div', { className: 'fc-view fc-' + viewType + '-view' })
      this.contentEl.appendChild(viewEl)
      newView.setElement(viewEl)

      this.toolbarsManager.proxyCall('activateButton', viewType)
    }

    if (this.view) {

      // prevent unnecessary change firing
      if (this.view.get('businessHourGenerator') !== this.businessHourGenerator) {
        this.view.set('businessHourGenerator', this.businessHourGenerator)
      }

      this.view.setDate(this.currentDate)

      if (newView) {
        newView.stopBatchRender()
      }
    }

    this.thawContentHeight()
  }


  // Unrenders the current view and reflects this change in the Header.
  // Unregsiters the `view`, but does not remove from viewByType hash.
  clearView() {
    let currentView = this.view

    this.toolbarsManager.proxyCall('deactivateButton', currentView.type)

    this.unbindViewHandlers(currentView)

    currentView.removeElement()
    currentView.unsetDate() // so bindViewHandlers doesn't fire with old values next time

    this.view = null
  }


  // Destroys the view, including the view object. Then, re-instantiates it and renders it.
  // Maintains the same scroll state.
  // TODO: maintain any other user-manipulated state.
  reinitView() {
    let oldView = this.view
    let scroll = oldView.queryScroll() // wouldn't be so complicated if Calendar owned the scroll
    this.freezeContentHeight()

    this.clearView()
    this.calcSize()
    this.renderView(oldView.type) // needs the type to freshly render

    this.view.applyScroll(scroll)
    this.thawContentHeight()
  }


  // Resizing
  // -----------------------------------------------------------------------------------


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
    let view = this.view
    let scroll

    if (!this.ignoreUpdateViewSize && view) {

      if (isResize) {
        this.calcSize()
        scroll = view.queryScroll()
      }

      this.ignoreUpdateViewSize++

      view.updateSize(
        this.getSuggestedViewHeight(),
        this.isHeightAuto(),
        isResize
      )

      this.ignoreUpdateViewSize--

      if (isResize) {
        view.applyScroll(scroll)
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


  windowResize(ev: Event) {
    if (
      // the purpose: so we don't process jqui "resize" events that have bubbled up
      // cast to any because .target, which is Element, can't be compared to window for some reason.
      (ev as any).target === window &&
      this.view &&
      this.view.isDatesRendered
    ) {
      if (this.updateViewSize(true)) { // isResize=true, returns true on success
        this.publiclyTrigger('windowResize', [ this.view ])
      }
    }
  }


  /* Height "Freezing"
  -----------------------------------------------------------------------------*/


  freezeContentHeight() {
    if (!(this.freezeContentHeightDepth++)) {
      this.forceFreezeContentHeight()
    }
  }


  forceFreezeContentHeight() {
    applyStyle(this.contentEl, {
      width: '100%',
      height: this.contentEl.offsetHeight,
      overflow: 'hidden'
    })
  }


  thawContentHeight() {
    this.freezeContentHeightDepth--

    // always bring back to natural height
    applyStyle(this.contentEl, {
      width: '',
      height: '',
      overflow: ''
    })

    // but if there are future thaws, re-freeze
    if (this.freezeContentHeightDepth) {
      this.forceFreezeContentHeight()
    }
  }


  // Toolbar
  // -----------------------------------------------------------------------------------------------------------------


  initToolbars() {
    this.header = new Toolbar(this, this.computeHeaderOptions())
    this.footer = new Toolbar(this, this.computeFooterOptions())
    this.toolbarsManager = new Iterator([ this.header, this.footer ])
  }


  computeHeaderOptions() {
    return {
      extraClasses: 'fc-header-toolbar',
      layout: this.opt('header')
    }
  }


  computeFooterOptions() {
    return {
      extraClasses: 'fc-footer-toolbar',
      layout: this.opt('footer')
    }
  }


  // can be called repeatedly and Header will rerender
  renderHeader() {
    let header = this.header

    header.setToolbarOptions(this.computeHeaderOptions())
    header.render()

    if (header.el) {
      prependToElement(this.el, header.el)
    }
  }


  // can be called repeatedly and Footer will rerender
  renderFooter() {
    let footer = this.footer

    footer.setToolbarOptions(this.computeFooterOptions())
    footer.render()

    if (footer.el) {
      this.el.appendChild(footer.el)
    }
  }


  setToolbarsTitle(title: string) {
    this.toolbarsManager.proxyCall('updateTitle', title)
  }


  updateToolbarButtons(dateProfile) {
    let now = this.getNow()
    let view = this.view
    let todayInfo = view.dateProfileGenerator.build(now)
    let prevInfo = view.dateProfileGenerator.buildPrev(view.get('dateProfile'))
    let nextInfo = view.dateProfileGenerator.buildNext(view.get('dateProfile'))

    this.toolbarsManager.proxyCall(
      (todayInfo.isValid && !dateProfile.currentUnzonedRange.containsDate(now)) ?
        'enableButton' :
        'disableButton',
      'today'
    )

    this.toolbarsManager.proxyCall(
      prevInfo.isValid ?
        'enableButton' :
        'disableButton',
      'prev'
    )

    this.toolbarsManager.proxyCall(
      nextInfo.isValid ?
        'enableButton' :
        'disableButton',
      'next'
    )
  }


  queryToolbarsHeight() {
    return this.toolbarsManager.items.reduce(function(accumulator, toolbar) {
      let toolbarHeight = toolbar.el ?
        computeHeightAndMargins(toolbar.el) :
        0

      return accumulator + toolbarHeight
    }, 0)
  }


  // Selection
  // -----------------------------------------------------------------------------------------------------------------


  // this public method receives start/end dates in any format, with any timezone
  select(zonedStartInput: DateInput, zonedEndInput?: DateInput) {
    this.view.select(
      this.buildSelectFootprint.apply(this, arguments)
    )
  }


  unselect() { // safe to be called before renderView
    if (this.view) {
      this.view.unselect()
    }
  }


  // Given arguments to the select method in the API, returns a span (unzoned start/end and other info)
  buildSelectFootprint(zonedStartInput: DateInput, zonedEndInput?: DateInput): ComponentFootprint {
    let startMeta = this.dateEnv.createMarkerMeta(zonedStartInput)
    let start = startMeta.marker
    let end

    if (zonedEndInput) {
      end = this.dateEnv.createMarker(zonedEndInput)
    } else if (startMeta.isTimeUnspecified) {
      end = this.dateEnv.add(start, this.defaultAllDayEventDuration)
    } else {
      end = this.dateEnv.add(start, this.defaultTimedEventDuration)
    }

    return new ComponentFootprint(
      new UnzonedRange(start, end),
      startMeta.isTimeUnspecified
    )
  }


  // External Dragging
  // -----------------------------------------------------------------------------------------------------------------


  handlExternalDragStart(ev, el, skipBinding) {
    if (this.view) {
      this.view.handlExternalDragStart(ev, el, skipBinding)
    }
  }


  handleExternalDragMove(ev) {
    if (this.view) {
      this.view.handleExternalDragMove(ev)
    }
  }


  handleExternalDragStop(ev) {
    if (this.view) {
      this.view.handleExternalDragStop(ev)
    }
  }


  // Date Utils
  // -----------------------------------------------------------------------------------------------------------------


  initDateEnv() {

    // not really date-env
    this.defaultAllDayEventDuration = createDuration(this.opt('defaultAllDayEventDuration'))
    this.defaultTimedEventDuration = createDuration(this.opt('defaultTimedEventDuration'))

    this.optionsManager.watch('buildDateEnv', [
      '?locale', '?timezone',
      '?firstDay', '?weekNumberCalculation'
    ], (opts) => {
      this.dateEnv = new DateEnv({
        calendarSystem: 'gregory',
        timeZone: opts.timezone,
        locale: getLocale(opts.locale),
        weekNumberCalculation: opts.weekNumberCalculation,
        firstDay: opts.firstDay
      })
    })
  }


  /*
  Assumes the footprint is non-open-ended.
  */
  footprintToDateProfile(componentFootprint, ignoreEnd = false) {
    let startMarker = componentFootprint.unzonedRange.start
    let endMarker

    if (!ignoreEnd) {
      endMarker = componentFootprint.unzonedRange.end
    }

    if (componentFootprint.isAllDay) {
      startMarker = startOfDay(startMarker)

      if (endMarker) {
        endMarker = startOfDay(endMarker)
      }
    }

    return new EventDateProfile(startMarker, endMarker, componentFootprint.isAllDay, this)
  }


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

    if (start && end && end.isBefore(start)) {
      return null
    }

    return new UnzonedRange(start, end)
  }


  // Event-Date Utilities
  // -----------------------------------------------------------------------------------------------------------------


  initEventManager() {
    let eventManager = new EventManager(this)
    let rawSources = this.opt('eventSources') || []
    let singleRawSource = this.opt('events')

    this.eventManager = eventManager

    if (singleRawSource) {
      rawSources.unshift(singleRawSource)
    }

    eventManager.on('release', (eventsPayload) => {
      this.trigger('eventsReset', eventsPayload)
    })

    eventManager.freeze()

    rawSources.forEach((rawSource) => {
      let source = EventSourceParser.parse(rawSource, this)

      if (source) {
        eventManager.addSource(source)
      }
    })

    eventManager.thaw()
  }


  requestEvents(start: DateMarker, end: DateMarker, callback) {
    return this.eventManager.requestEvents(
      start,
      end,
      this.dateEnv,
      !this.opt('lazyFetching'),
      callback
    )
  }


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
    this.view.flash('displayingEvents')
  }


  refetchEvents() {
    this.eventManager.refetchAllSources()
  }


  renderEvents(eventInputs: EventObjectInput[], isSticky?: boolean) {
    this.eventManager.freeze()

    for (let i = 0; i < eventInputs.length; i++) {
      this.renderEvent(eventInputs[i], isSticky)
    }

    this.eventManager.thaw()
  }


  renderEvent(eventInput: EventObjectInput, isSticky: boolean = false) {
    let eventManager = this.eventManager
    let eventDef = EventDefParser.parse(
      eventInput,
      eventInput.source || eventManager.stickySource
    )

    if (eventDef) {
      eventManager.addEventDef(eventDef, isSticky)
    }
  }


  // legacyQuery operates on legacy event instance objects
  removeEvents(legacyQuery) {
    let eventManager = this.eventManager
    let legacyInstances = []
    let idMap = {}
    let eventDef
    let i

    if (legacyQuery == null) { // shortcut for removing all
      eventManager.removeAllEventDefs() // persist=true
    } else {
      eventManager.getEventInstances().forEach((eventInstance) => {
        legacyInstances.push(eventInstance.toLegacy(this))
      })

      legacyInstances = filterLegacyEventInstances(legacyInstances, legacyQuery)

      // compute unique IDs
      for (i = 0; i < legacyInstances.length; i++) {
        eventDef = eventManager.getEventDefByUid(legacyInstances[i]._id)
        idMap[eventDef.id] = true
      }

      eventManager.freeze()

      for (i in idMap) { // reuse `i` as an "id"
        eventManager.removeEventDefsById(i) // persist=true
      }

      eventManager.thaw()
    }
  }


  // legacyQuery operates on legacy event instance objects
  clientEvents(legacyQuery) {
    let legacyEventInstances = []

    this.eventManager.getEventInstances().forEach((eventInstance) => {
      legacyEventInstances.push(eventInstance.toLegacy(this))
    })

    return filterLegacyEventInstances(legacyEventInstances, legacyQuery)
  }


  updateEvents(eventPropsArray: EventObjectInput[]) {
    this.eventManager.freeze()

    for (let i = 0; i < eventPropsArray.length; i++) {
      this.updateEvent(eventPropsArray[i])
    }

    this.eventManager.thaw()
  }


  updateEvent(eventProps: EventObjectInput) {
    let eventDef = this.eventManager.getEventDefByUid(eventProps._id)
    let eventInstance
    let eventDefMutation

    if (eventDef instanceof SingleEventDef) {
      eventInstance = eventDef.buildInstance()

      eventDefMutation = EventDefMutation.createFromRawProps(
        eventInstance,
        eventProps, // raw props
        null, // largeUnit -- who uses it?
        this
      )

      this.eventManager.mutateEventsWithId(eventDef.id, eventDefMutation) // will release
    }
  }


  // Public Event Sources API
  // ------------------------------------------------------------------------------------


  getEventSources(): EventSource {
    return this.eventManager.otherSources.slice() // clone
  }


  getEventSourceById(id): EventSource {
    return this.eventManager.getSourceById(
      EventSource.normalizeId(id)
    )
  }


  addEventSource(sourceInput: EventSourceInput) {
    let source = EventSourceParser.parse(sourceInput, this)

    if (source) {
      this.eventManager.addSource(source)
    }
  }


  removeEventSources(sourceMultiQuery) {
    let eventManager = this.eventManager
    let sources
    let i

    if (sourceMultiQuery == null) {
      eventManager.removeAllSources()
    } else {
      sources = eventManager.multiQuerySources(sourceMultiQuery)

      eventManager.freeze()

      for (i = 0; i < sources.length; i++) {
        eventManager.removeSource(sources[i])
      }

      eventManager.thaw()
    }
  }


  removeEventSource(sourceQuery) {
    let eventManager = this.eventManager
    let sources = eventManager.querySources(sourceQuery)
    let i

    eventManager.freeze()

    for (i = 0; i < sources.length; i++) {
      eventManager.removeSource(sources[i])
    }

    eventManager.thaw()
  }


  refetchEventSources(sourceMultiQuery) {
    let eventManager = this.eventManager
    let sources = eventManager.multiQuerySources(sourceMultiQuery)
    let i

    eventManager.freeze()

    for (i = 0; i < sources.length; i++) {
      eventManager.refetchSource(sources[i])
    }

    eventManager.thaw()
  }


}

EmitterMixin.mixIntoObj(Calendar) // for global registry
EmitterMixin.mixInto(Calendar)
ListenerMixin.mixInto(Calendar)


function filterLegacyEventInstances(legacyEventInstances, legacyQuery) {
  if (legacyQuery == null) {
    return legacyEventInstances
  } else if (typeof legacyQuery === 'function') {
    return legacyEventInstances.filter(legacyQuery)
  } else { // an event ID
    legacyQuery += '' // normalize to string

    return legacyEventInstances.filter(function(legacyEventInstance) {
      // soft comparison because id not be normalized to string
      // tslint:disable-next-line
      return legacyEventInstance.id == legacyQuery ||
        legacyEventInstance._id === legacyQuery // can specify internal id, but must exactly match
    })
  }
}

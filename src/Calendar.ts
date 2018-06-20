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
  theme: Theme
  optionsManager: OptionsManager
  viewSpecManager: ViewSpecManager

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

  state: CalendarState
  isReducing: boolean = false
  actionQueue = []
  isSkeletonRendered: boolean = false
  renderingPauseDepth: number = 0


  constructor(el: HTMLElement, overrides: OptionsInput) {

    // declare the current calendar instance relies on GlobalEmitter. needed for garbage collection.
    // unneeded() is called in destroy.
    GlobalEmitter.needed()

    this.el = el
    this.viewsByType = {}

    this.optionsManager = new OptionsManager(this, overrides)
    this.viewSpecManager = new ViewSpecManager(this.optionsManager, this)
    this.initDateEnv() // needs to happen after options hash initialized
    this.initToolbars()

    this.constructed()
    this.hydrate()
  }


  constructed() {
    // useful for monkeypatching. used?
  }


  getView(): View {
    return this.view
  }


  publiclyTrigger(name: string, args) {
    let optHandler = this.opt(name)

    this.triggerWith(name, this, args) // Emitter's method

    if (optHandler) {
      return optHandler.apply(this, args)
    }
  }


  hasPublicHandlers(name: string): boolean {
    return this.hasHandlers(name) ||
      this.opt(name) // handler specified in options
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

    this.pauseRendering()

    for (let rawSource of rawSources) {
      this.dispatch({ type: 'ADD_EVENT_SOURCE', rawSource })
    }

    this.dispatch({ type: 'SET_VIEW_TYPE', viewType: this.opt('defaultView') })

    this.resumeRendering()
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
      businessHoursDef: false
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

      if (!this.renderingPauseDepth) {
        this.renderView()
      }
    }
  }


  pauseRendering() {
    this.renderingPauseDepth++
  }


  resumeRendering() {
    if (!(--this.renderingPauseDepth)) {
      this.renderView()
    }
  }


  reduce(state: CalendarState, action: object, calendar: Calendar): CalendarState {
    return reduce(state, action, calendar)
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


  installNewView(viewType) {

    if (this.view) {
      this.view.removeElement()
      this.toolbarsManager.proxyCall('deactivateButton', this.view.type)
    }

    this.view =
      this.viewsByType[viewType] ||
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
        this.optionsManager.recordOverrides({ // will not rerender
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
      this.viewSpecManager.getUnitViewSpec(viewType)

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


  // Rendering
  // -----------------------------------------------------------------------------------


  render() {
    if (!this.isSkeletonRendered) {
      this.renderSkeleton()
      this.renderHeader()
      this.renderFooter()
      this.isSkeletonRendered = true
      this.renderView()
      this.trigger('initialRender')
      Calendar.trigger('initialRender', this)
    } else if (this.elementVisible()) {
      // mainly for the public API
      this.calcSize()
      this.updateViewSize()
    }
  }


  renderView(forces?) {
    let { view } = this

    if (view && this.isSkeletonRendered) {
      let viewScroll

      if (!view.el) {
        view.setElement(
          createElement('div', { className: 'fc-view fc-' + view.type + '-view' })
        )
      }

      if (!view.el.parentNode) {
        this.contentEl.appendChild(view.el)
      } else {
        viewScroll = view.queryScroll()
      }

      this.freezeContentHeight()

      // toolbar (updates every time unforunately)
      this.setToolbarsTitle(this.view.title) // view.title set via updateMiscDateProps
      this.updateToolbarButtons(this.state.dateProfile)
      this.toolbarsManager.proxyCall('activateButton', view.type)

      view.render(this.state, forces)

      this.thawContentHeight()
      this.updateViewSize() // TODO: respect isSizeDirty

      if (viewScroll) {
        this.view.applyScroll(viewScroll)
      }
    }
  }


  destroy() {
    if (this.isSkeletonRendered) {
      this.unrenderSkeleton()
      this.isSkeletonRendered = false
      this.view.removeElement()
      this.view = null
      this.trigger('destroy')
      Calendar.trigger('destroy', this)
    }
  }


  renderSkeleton() {
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

    // called immediately, and upon option change.
    // HACK: locale often affects isRTL, so we explicitly listen to that too.
    this.optionsManager.watch('applyingDirClasses', [ '?isRTL', '?locale' ], (opts) => {
      forceClassName(el, 'fc-ltr', !opts.isRTL)
      forceClassName(el, 'fc-rtl', opts.isRTL)
    })

    prependToElement(el, this.contentEl = createElement('div', { className: 'fc-view-container' }))

    if (this.opt('handleWindowResize')) {
      window.addEventListener('resize',
        this.windowResizeProxy = debounce( // prevents rapid calls
          this.windowResize.bind(this),
          this.opt('windowResizeDelay')
        )
      )
    }
  }


  unrenderSkeleton() {

    this.toolbarsManager.proxyCall('removeElement')
    removeElement(this.contentEl)
    this.el.classList.remove('fc')
    this.el.classList.remove('fc-ltr')
    this.el.classList.remove('fc-rtl')

    // removes theme-related root className
    this.optionsManager.unwatch('settingTheme')

    if (this.removeNavLinkListener) {
      this.removeNavLinkListener()
      this.removeNavLinkListener = null
    }

    if (this.windowResizeProxy) {
      window.removeEventListener('resize', this.windowResizeProxy)
      this.windowResizeProxy = null
    }

    GlobalEmitter.unneeded()
  }


  elementVisible(): boolean {
    return Boolean(this.el.offsetWidth)
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
    let prevInfo = view.dateProfileGenerator.buildPrev(dateProfile)
    let nextInfo = view.dateProfileGenerator.buildNext(dateProfile)

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

    if (selection) {
      this.view.select(selection)
    }
  }


  unselect() { // safe to be called before renderView
    if (this.view) {
      this.view.unselect()
    }
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
      '?locale', '?timezone', '?firstDay', '?weekNumberCalculation', '?weekLabel'
    ], (opts) => {
      this.dateEnv = new DateEnv({
        calendarSystem: 'gregory',
        timeZone: opts.timezone,
        locale: getLocale(opts.locale),
        weekNumberCalculation: opts.weekNumberCalculation,
        firstDay: opts.firstDay,
        weekLabel: opts.weekLabel
      })
    })
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
    this.view.flash('displayingEvents')
  }


  refetchEvents() {
    // TODO
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


  buildMutatedEventRanges(eventDefId, eventDefMutation) { // do it FOR the given def
    return [] // TODO
  }


  getEventInstances() {
  }


  getEventInstancesWithoutId(id) {
  }


  getEventInstancesWithId(id) {
  }


  // Public Event Sources API
  // ------------------------------------------------------------------------------------


  getEventSources(): EventSource {
    return null // TODO
  }


  getEventSourceById(id): EventSource {
    return null // TODO
  }


  addEventSource(sourceInput: EventSourceInput) {
    // TODO
  }


  removeEventSources(sourceMultiQuery) {
    // TODO
  }


  removeEventSource(sourceQuery) {
    // TODO
  }


  refetchEventSources(sourceMultiQuery) {
    // TODO
  }


}

EmitterMixin.mixIntoObj(Calendar) // for global registry
EmitterMixin.mixInto(Calendar)
ListenerMixin.mixInto(Calendar)

import { attrsToStr, htmlEscape } from '../util/html'
import { elementClosest } from '../util/dom-manip'
import { default as Component, RenderForceFlags } from './Component'
import Calendar from '../Calendar'
import View from '../View'
import { DateProfile } from '../DateProfileGenerator'
import { DateMarker, DAY_IDS, addDays, startOfDay, diffWholeDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { DateSpan } from '../structs/date-span'
import { EventRenderRange, sliceEventStore, computeEventDefUi, EventUiHash, computeEventDefUis } from '../component/event-rendering'
import { EventStore, expandRecurring } from '../structs/event-store'
import { DateEnv } from '../datelib/env'
import Theme from '../theme/Theme'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import { assignTo } from '../util/object'
import browserContext from '../common/browser-context'
import { Hit } from '../interactions/HitDragging'
import { DateRange, rangeContainsMarker, rangeContainsRange } from '../datelib/date-range'
import EventApi from '../api/EventApi'
import { createEventInstance, parseEventDef } from '../structs/event'
import EmitterMixin from '../common/EmitterMixin'
import { isEventsValid, isSelectionValid } from '../validation'


export interface DateComponentRenderState {
  dateProfile: DateProfile | null
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

// NOTE: for fg-events, eventRange.range is NOT sliced,
// thus, we need isStart/isEnd
export interface Seg {
  component: DateComponent
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  el?: HTMLElement
  [otherProp: string]: any
}

export type DateComponentHash = { [id: string]: DateComponent }

let uid = 0


export default abstract class DateComponent extends Component {

  // self-config, overridable by subclasses
  isInteractable: boolean = false
  useEventCenter: boolean = true // for dragging geometry
  doesDragMirror: boolean = false // for events that ORIGINATE from this component
  doesDragHighlight: boolean = false // for events that ORIGINATE from this component
  fgSegSelector: string = '.fc-event-container > *' // lets eventRender produce elements without fc-event class
  bgSegSelector: string = '.fc-bgevent'

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

  slicingType: 'timed' | 'all-day' | null = null

  eventRendererClass: any
  mirrorRendererClass: any
  fillRendererClass: any

  uid: any
  childrenByUid: any
  isRtl: boolean = false // frequently accessed options
  nextDayThreshold: Duration // "
  view: View
  emitter: EmitterMixin = new EmitterMixin()

  eventRenderer: any
  mirrorRenderer: any
  fillRenderer: any

  renderedFlags: any = {}
  dirtySizeFlags: any = {}
  needHitsDepth: number = 0

  dateProfile: DateProfile = null
  businessHours: EventStore = null
  eventStore: EventStore = null
  eventUis: EventUiHash = null
  dateSelection: DateSpan = null
  eventSelection: string = ''
  eventDrag: EventInteractionUiState = null
  eventResize: EventInteractionUiState = null


  constructor(_view, _options?) {
    super()

    // hack to set options prior to the this.opt calls
    this.view = _view || this
    if (_options) {
      this['options'] = _options
    }

    this.uid = String(uid++)
    this.childrenByUid = {}

    this.nextDayThreshold = createDuration(this.opt('nextDayThreshold'))
    this.isRtl = this.opt('dir') === 'rtl'

    if (this.fillRendererClass) {
      this.fillRenderer = new this.fillRendererClass(this)
    }

    if (this.eventRendererClass) { // fillRenderer is optional -----v
      this.eventRenderer = new this.eventRendererClass(this, this.fillRenderer)
    }

    if (this.mirrorRendererClass && this.eventRenderer) {
      this.mirrorRenderer = new this.mirrorRendererClass(this, this.eventRenderer)
    }
  }


  addChild(child) {
    if (!this.childrenByUid[child.uid]) {
      this.childrenByUid[child.uid] = child

      return true
    }

    return false
  }


  removeChild(child) {
    if (this.childrenByUid[child.uid]) {
      delete this.childrenByUid[child.uid]

      return true
    }

    return false
  }


  updateSize(totalHeight, isAuto, force) {
    let flags = this.dirtySizeFlags

    if (force || flags.skeleton || flags.dates || flags.events) {
      // sort of the catch-all sizing
      // anything that might cause dimension changes
      this.updateBaseSize(totalHeight, isAuto)
      this.buildPositionCaches()
    }

    if (force || flags.businessHours) {
      this.computeBusinessHoursSize()
    }

    if (force || flags.dateSelection || flags.eventDrag || flags.eventResize) {
      this.computeHighlightSize()
      this.computeMirrorSize()
    }

    if (force || flags.events) {
      this.computeEventsSize()
    }

    if (force || flags.businessHours) {
      this.assignBusinessHoursSize()
    }

    if (force || flags.dateSelection || flags.eventDrag || flags.eventResize) {
      this.assignHighlightSize()
      this.assignMirrorSize()
    }

    if (force || flags.events) {
      this.assignEventsSize()
    }

    this.dirtySizeFlags = {}
    this.callChildren('updateSize', arguments) // always do this at end?
  }


  updateBaseSize(totalHeight, isAuto) {
  }


  buildPositionCaches() {
  }


  requestPrepareHits() {
    if (!(this.needHitsDepth++)) {
      this.prepareHits()
    }
  }


  requestReleaseHits() {
    if (!(--this.needHitsDepth)) {
      this.releaseHits()
    }
  }


  protected prepareHits() {
  }


  protected releaseHits() {
  }


  queryHit(leftOffset, topOffset): Hit | null {
    return null // this should be abstract
  }


  bindGlobalHandlers() {
    if (this.isInteractable) {
      browserContext.registerComponent(this)
    }
  }


  unbindGlobalHandlers() {
    if (this.isInteractable) {
      browserContext.unregisterComponent(this)
    }
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  opt(name) {
    return this.view.options[name]
  }


  // Triggering
  // -----------------------------------------------------------------------------------------------------------------


  publiclyTrigger(name, args) {
    let calendar = this.getCalendar()

    return calendar.publiclyTrigger(name, args)
  }


  publiclyTriggerAfterSizing(name, args) {
    let calendar = this.getCalendar()

    return calendar.publiclyTriggerAfterSizing(name, args)
  }


  hasPublicHandlers(name) {
    let calendar = this.getCalendar()

    return calendar.hasPublicHandlers(name)
  }


  triggerRenderedSegs(segs: Seg[], isMirrors: boolean = false) {
    if (this.hasPublicHandlers('eventPositioned')) {
      let calendar = this.getCalendar()

      for (let seg of segs) {
        this.publiclyTriggerAfterSizing('eventPositioned', [
          {
            event: new EventApi(
              calendar,
              seg.eventRange.def,
              seg.eventRange.instance
            ),
            isMirror: isMirrors,
            isStart: seg.isStart,
            isEnd: seg.isEnd,
            el: seg.el,
            view: this
          }
        ])
      }
    }
  }


  triggerWillRemoveSegs(segs: Seg[]) {

    for (let seg of segs) {
      this.emitter.trigger('eventElRemove', seg.el)
    }

    if (this.hasPublicHandlers('eventDestroy')) {
      let calendar = this.getCalendar()

      for (let seg of segs) {
        this.publiclyTrigger('eventDestroy', [
          {
            event: new EventApi(
              calendar,
              seg.eventRange.def,
              seg.eventRange.instance
            ),
            el: seg.el,
            view: this
          }
        ])
      }
    }
  }


  // Root Rendering
  // -----------------------------------------------------------------------------------------------------------------


  render(renderState: DateComponentRenderState, forceFlags: RenderForceFlags) {
    let { renderedFlags } = this
    let dirtyFlags = {
      skeleton: false,
      dates: renderState.dateProfile !== this.dateProfile,
      events: renderState.eventStore !== this.eventStore || renderState.eventUis !== this.eventUis,
      businessHours: renderState.businessHours !== this.businessHours,
      dateSelection: renderState.dateSelection !== this.dateSelection,
      eventSelection: renderState.eventSelection !== this.eventSelection,
      eventDrag: renderState.eventDrag !== this.eventDrag,
      eventResize: renderState.eventResize !== this.eventResize
    }

    assignTo(dirtyFlags, forceFlags)

    if (forceFlags === true) {
      // everthing must be marked as dirty when doing a forced resize
      for (let name in dirtyFlags) {
        dirtyFlags[name] = true
      }
    } else {

      // mark things that are still not rendered as dirty
      for (let name in dirtyFlags) {
        if (!renderedFlags[name]) {
          dirtyFlags[name] = true
        }
      }

      // when the dates are dirty, mark nearly everything else as dirty too
      if (dirtyFlags.dates) {
        for (let name in dirtyFlags) {
          if (name !== 'skeleton') {
            dirtyFlags[name] = true
          }
        }
      }
    }

    this.unrender(dirtyFlags) // only unrender dirty things
    assignTo(this, renderState) // assign incoming state to local state
    this.renderByFlag(renderState, dirtyFlags) // only render dirty things
    this.renderChildren(renderState, forceFlags)
  }


  renderByFlag(renderState: DateComponentRenderState, flags) {
    let { renderedFlags, dirtySizeFlags } = this

    if (flags.skeleton) {
      this.renderSkeleton()
      this.afterSkeletonRender()
      renderedFlags.skeleton = true
      dirtySizeFlags.skeleton = true
    }

    if (flags.dates && renderState.dateProfile) {
      this.renderDates(renderState.dateProfile)
      this.afterDatesRender()
      renderedFlags.dates = true
      dirtySizeFlags.dates = true
    }

    if (flags.businessHours && renderState.businessHours) {
      this.renderBusinessHours(renderState.businessHours)
      renderedFlags.businessHours = true
      dirtySizeFlags.businessHours = true
    }

    if (flags.dateSelection && renderState.dateSelection) {
      this.renderDateSelection(renderState.dateSelection)
      renderedFlags.dateSelection = true
      dirtySizeFlags.dateSelection = true
    }

    if (flags.events && renderState.eventStore) {
      this.renderEvents(renderState.eventStore, renderState.eventUis)
      renderedFlags.events = true
      dirtySizeFlags.events = true
    }

    if (flags.eventSelection) {
      this.selectEventsByInstanceId(renderState.eventSelection)
      renderedFlags.eventSelection = true
      dirtySizeFlags.eventSelection = true
    }

    if (flags.eventDrag && renderState.eventDrag) {
      this.renderEventDragState(renderState.eventDrag)
      renderedFlags.eventDrag = true
      dirtySizeFlags.eventDrag = true
    }

    if (flags.eventResize && renderState.eventResize) {
      this.renderEventResizeState(renderState.eventResize)
      renderedFlags.eventResize = true
      dirtySizeFlags.eventResize = true
    }
  }


  unrender(flags?: any) {
    let { renderedFlags } = this

    if ((!flags || flags.eventResize) && renderedFlags.eventResize) {
      this.unrenderEventResizeState()
      renderedFlags.eventResize = false
    }

    if ((!flags || flags.eventDrag) && renderedFlags.eventDrag) {
      this.unrenderEventDragState()
      renderedFlags.eventDrag = false
    }

    if ((!flags || flags.eventSelection) && renderedFlags.eventSelection) {
      this.unselectAllEvents()
      renderedFlags.eventSelection = false
    }

    if ((!flags || flags.events) && renderedFlags.events) {
      this.unrenderEvents()
      renderedFlags.events = false
    }

    if ((!flags || flags.dateSelection) && renderedFlags.dateSelection) {
      this.unrenderDateSelection()
      renderedFlags.dateSelection = false
    }

    if ((!flags || flags.businessHours) && renderedFlags.businessHours) {
      this.unrenderBusinessHours()
      renderedFlags.businessHours = false
    }

    if ((!flags || flags.dates) && renderedFlags.dates) {
      this.beforeDatesUnrender()
      this.unrenderDates()
      renderedFlags.dates = false
    }

    if ((!flags || flags.skeleton) && renderedFlags.skeleton) {
      this.beforeSkeletonUnrender()
      this.unrenderSkeleton()
      renderedFlags.skeleton = false
    }
  }


  renderChildren(renderState: DateComponentRenderState, forceFlags: RenderForceFlags) {
    this.callChildren('render', arguments)
  }


  removeElement() {
    this.unrender()
    this.dirtySizeFlags = {}
    super.removeElement()
  }


  // Skeleton
  // -----------------------------------------------------------------------------------------------------------------


  renderSkeleton() {
    // subclasses should implement
  }


  afterSkeletonRender() { }
  beforeSkeletonUnrender() { }


  unrenderSkeleton() {
    // subclasses should implement
  }


  // Date
  // -----------------------------------------------------------------------------------------------------------------


  // date-cell content only
  renderDates(dateProfile: DateProfile) {
    // subclasses should implement
  }


  afterDatesRender() { }
  beforeDatesUnrender() { }


  // date-cell content only
  unrenderDates() {
    // subclasses should override
  }



  // Now-Indicator
  // -----------------------------------------------------------------------------------------------------------------


  // Returns a string unit, like 'second' or 'minute' that defined how often the current time indicator
  // should be refreshed. If something falsy is returned, no time indicator is rendered at all.
  getNowIndicatorUnit() {
    // subclasses should implement
  }


  // Renders a current time indicator at the given datetime
  renderNowIndicator(date) {
    this.callChildren('renderNowIndicator', arguments)
  }


  // Undoes the rendering actions from renderNowIndicator
  unrenderNowIndicator() {
    this.callChildren('unrenderNowIndicator', arguments)
  }


  // Business Hours
  // ---------------------------------------------------------------------------------------------------------------


  renderBusinessHours(businessHours: EventStore) {
    if (this.slicingType) { // can use eventStoreToRanges?
      let expandedStore = expandRecurring(businessHours, this.dateProfile.activeRange, this.getCalendar())

      this.renderBusinessHourRanges(
        this.eventStoreToRanges(
          expandedStore,
          computeEventDefUis(expandedStore.defs, {}, {})
        )
      )
    }
  }


  renderBusinessHourRanges(eventRanges: EventRenderRange[]) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs(
        'businessHours',
        this.eventRangesToSegs(eventRanges),
        {
          getClasses(seg) {
            return [ 'fc-bgevent' ].concat(seg.eventRange.def.classNames)
          }
        }
      )
    }
  }


  // Unrenders previously-rendered business-hours
  unrenderBusinessHours() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('businessHours')
    }
  }


  computeBusinessHoursSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSize('businessHours')
    }
  }


  assignBusinessHoursSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSize('businessHours')
    }
  }


  // Event Displaying
  // -----------------------------------------------------------------------------------------------------------------


  renderEvents(eventStore: EventStore, eventUis: EventUiHash) {
    if (this.slicingType) { // can use eventStoreToRanges?
      this.renderEventRanges(
        this.eventStoreToRanges(eventStore, eventUis)
      )
    }
  }


  renderEventRanges(eventRanges: EventRenderRange[]) {
    if (this.eventRenderer) {
      this.eventRenderer.rangeUpdated() // poorly named now
      this.eventRenderer.renderSegs(
        this.eventRangesToSegs(eventRanges)
      )

      let calendar = this.getCalendar()
      if (!calendar.state.loadingLevel) { // avoid initial empty state while pending
        calendar.afterSizingTriggers._eventsPositioned = [ null ] // fire once
      }
    }
  }


  unrenderEvents() {
    if (this.eventRenderer) {
      this.triggerWillRemoveSegs(this.eventRenderer.getSegs())
      this.eventRenderer.unrender()
    }
  }


  computeEventsSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSize('bgEvent')
    }
    if (this.eventRenderer) {
      this.eventRenderer.computeFgSize()
    }
  }


  assignEventsSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSize('bgEvent')
    }
    if (this.eventRenderer) {
      this.eventRenderer.assignFgSize()
    }
  }


  // Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------


  renderEventDragState(state: EventInteractionUiState) {
    this.hideSegsByHash(state.affectedEvents.instances)
    this.renderEventDrag(
      state.mutatedEvents,
      state.eventUis,
      state.isEvent,
      state.origSeg
    )
  }


  unrenderEventDragState() {
    this.showSegsByHash(this.eventDrag.affectedEvents.instances)
    this.unrenderEventDrag()
  }


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  renderEventDrag(eventStore: EventStore, eventUis: EventUiHash, isEvent: boolean, origSeg: Seg | null) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(eventStore, eventUis)
    )

    // if the user is dragging something that is considered an event with real event data,
    // and this component likes to do drag mirrors OR the component where the seg came from
    // likes to do drag mirrors, then render a drag mirror.
    if (isEvent && (this.doesDragMirror || origSeg && origSeg.component.doesDragMirror)) {
      if (this.mirrorRenderer) {
        this.mirrorRenderer.renderEventDraggingSegs(segs, origSeg)
      }
    }

    // if it would be impossible to render a drag mirror OR this component likes to render
    // highlights, then render a highlight.
    if (!isEvent || this.doesDragHighlight) {
      this.renderHighlightSegs(segs)
    }
  }


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderEventDrag() {
    this.unrenderHighlight()

    if (this.mirrorRenderer) {
      this.mirrorRenderer.unrender()
    }
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  renderEventResizeState(state: EventInteractionUiState) {
    this.hideSegsByHash(state.affectedEvents.instances)
    this.renderEventResize(
      state.mutatedEvents,
      state.eventUis,
      state.origSeg
    )
  }


  unrenderEventResizeState() {
    this.showSegsByHash(this.eventResize.affectedEvents.instances)
    this.unrenderEventResize()
  }


  // Renders a visual indication of an event being resized.
  renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg: any) {
    // subclasses can implement
  }


  // Unrenders a visual indication of an event being resized.
  unrenderEventResize() {
    // subclasses can implement
  }


  // Seg Utils
  // -----------------------------------------------------------------------------------------------------------------


  hideSegsByHash(hash) {
    this.getAllEventSegs().forEach(function(seg) {
      if (hash[seg.eventRange.instance.instanceId]) {
        seg.el.style.visibility = 'hidden'
      }
    })
  }


  showSegsByHash(hash) {
    this.getAllEventSegs().forEach(function(seg) {
      if (hash[seg.eventRange.instance.instanceId]) {
        seg.el.style.visibility = ''
      }
    })
  }


  getAllEventSegs(): Seg[] {
    if (this.eventRenderer) {
      return this.eventRenderer.getSegs()
    } else {
      return []
    }
  }


  // Event Instance Selection (aka long-touch focus)
  // -----------------------------------------------------------------------------------------------------------------
  // TODO: show/hide according to groupId?


  selectEventsByInstanceId(instanceId) {
    this.getAllEventSegs().forEach(function(seg) {
      let eventInstance = seg.eventRange.instance
      if (
        eventInstance && eventInstance.instanceId === instanceId &&
        seg.el // necessary?
      ) {
        seg.el.classList.add('fc-selected')
      }
    })
  }


  unselectAllEvents() {
    this.getAllEventSegs().forEach(function(seg) {
      if (seg.el) { // necessary?
        seg.el.classList.remove('fc-selected')
      }
    })
  }



  // EXTERNAL Drag-n-Drop
  // ---------------------------------------------------------------------------------------------------------------
  // Doesn't need to implement a response, but must pass to children


  handlExternalDragStart(ev, el, skipBinding) {
    this.callChildren('handlExternalDragStart', arguments)
  }


  handleExternalDragMove(ev) {
    this.callChildren('handleExternalDragMove', arguments)
  }


  handleExternalDragStop(ev) {
    this.callChildren('handleExternalDragStop', arguments)
  }


  // DateSpan
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of the selection
  renderDateSelection(selection: DateSpan) {
    this.renderHighlightSegs(this.selectionToSegs(selection, false))
  }


  // Unrenders a visual indication of selection
  unrenderDateSelection() {
    this.unrenderHighlight()
  }


  // Highlight
  // ---------------------------------------------------------------------------------------------------------------


  // Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
  renderHighlightSegs(segs) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('highlight', segs, {
        getClasses() {
          return [ 'fc-highlight' ]
        }
      })
    }
  }


  // Unrenders the emphasis on a date range
  unrenderHighlight() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }
  }


  computeHighlightSize() {
    if (this.fillRenderer) {
      this.fillRenderer.computeSize('highlight')
    }
  }


  assignHighlightSize() {
    if (this.fillRenderer) {
      this.fillRenderer.assignSize('highlight')
    }
  }


  /*
  ------------------------------------------------------------------------------------------------------------------*/


  computeMirrorSize() {
    if (this.mirrorRenderer) {
      this.mirrorRenderer.computeSize()
    }
  }


  assignMirrorSize() {
    if (this.mirrorRenderer) {
      this.mirrorRenderer.assignSize()
    }
  }


  /* Converting selection/eventRanges -> segs
  ------------------------------------------------------------------------------------------------------------------*/


  eventStoreToRanges(eventStore: EventStore, eventUis: EventUiHash): EventRenderRange[] {
    return sliceEventStore(
      eventStore,
      eventUis,
      this.dateProfile.activeRange,
      this.slicingType === 'all-day' ? this.nextDayThreshold : null
    )
  }


  eventRangesToSegs(eventRenderRanges: EventRenderRange[]): Seg[] {
    let allSegs: Seg[] = []

    for (let eventRenderRange of eventRenderRanges) {
      let segs = this.rangeToSegs(eventRenderRange.range, eventRenderRange.def.allDay)

      for (let seg of segs) {
        seg.eventRange = eventRenderRange
        seg.isStart = seg.isStart && eventRenderRange.isStart
        seg.isEnd = seg.isEnd && eventRenderRange.isEnd

        allSegs.push(seg)
      }
    }

    return allSegs
  }


  selectionToSegs(selection: DateSpan, fabricateEvents: boolean): Seg[] {
    let segs = this.rangeToSegs(selection.range, selection.allDay)

    if (fabricateEvents) {

      // fabricate an eventRange. important for mirror
      // TODO: make a separate utility for this?
      let def = parseEventDef(
        { editable: false },
        '', // sourceId
        selection.allDay,
        true, // hasEnd
        this.getCalendar()
      )
      let eventRange = {
        def,
        ui: computeEventDefUi(def, {}, {}),
        instance: createEventInstance(def.defId, selection.range),
        range: selection.range,
        isStart: true,
        isEnd: true
      }

      for (let seg of segs) {
        seg.eventRange = eventRange
      }
    }

    return segs
  }


  // must implement if want to use many of the rendering utils
  rangeToSegs(range: DateRange, allDay: boolean): Seg[] {
    return []
  }


  // Utils
  // ---------------------------------------------------------------------------------------------------------------


  callChildren(methodName, args) {
    this.iterChildren(function(child) {
      child[methodName].apply(child, args)
    })
  }


  iterChildren(func) {
    let childrenByUid = this.childrenByUid
    let uid

    for (uid in childrenByUid) {
      func(childrenByUid[uid])
    }
  }


  getCalendar(): Calendar {
    return this.view.calendar
  }


  getDateEnv(): DateEnv {
    return this.getCalendar().dateEnv
  }


  getTheme(): Theme {
    return this.getCalendar().theme
  }


  // Generates HTML for an anchor to another view into the calendar.
  // Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
  // `gotoOptions` can either be a date input, or an object with the form:
  // { date, type, forceOff }
  // `type` is a view-type like "day" or "week". default value is "day".
  // `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
  buildGotoAnchorHtml(gotoOptions, attrs, innerHtml) {
    let dateEnv = this.getDateEnv()
    let date
    let type
    let forceOff
    let finalOptions

    if (gotoOptions instanceof Date || typeof gotoOptions !== 'object') {
      date = gotoOptions // a single date-like input
    } else {
      date = gotoOptions.date
      type = gotoOptions.type
      forceOff = gotoOptions.forceOff
    }
    date = dateEnv.createMarker(date) // if a string, parse it

    finalOptions = { // for serialization into the link
      date: dateEnv.formatIso(date, { omitTime: true }),
      type: type || 'day'
    }

    if (typeof attrs === 'string') {
      innerHtml = attrs
      attrs = null
    }

    attrs = attrs ? ' ' + attrsToStr(attrs) : '' // will have a leading space
    innerHtml = innerHtml || ''

    if (!forceOff && this.opt('navLinks')) {
      return '<a' + attrs +
        ' data-goto="' + htmlEscape(JSON.stringify(finalOptions)) + '">' +
        innerHtml +
        '</a>'
    } else {
      return '<span' + attrs + '>' +
        innerHtml +
        '</span>'
    }
  }


  getAllDayHtml() {
    return this.opt('allDayHtml') || htmlEscape(this.opt('allDayText'))
  }


  // Computes HTML classNames for a single-day element
  getDayClasses(date: DateMarker, noThemeHighlight?) {
    let view = this.view
    let classes = []
    let todayStart: DateMarker
    let todayEnd: DateMarker

    if (!rangeContainsMarker(this.dateProfile.activeRange, date)) {
      classes.push('fc-disabled-day') // TODO: jQuery UI theme?
    } else {
      classes.push('fc-' + DAY_IDS[date.getUTCDay()])

      if (view.isDateInOtherMonth(date, this.dateProfile)) { // TODO: use DateComponent subclass somehow
        classes.push('fc-other-month')
      }

      todayStart = startOfDay(view.calendar.getNow())
      todayEnd = addDays(todayStart, 1)

      if (date < todayStart) {
        classes.push('fc-past')
      } else if (date >= todayEnd) {
        classes.push('fc-future')
      } else {
        classes.push('fc-today')

        if (noThemeHighlight !== true) {
          classes.push(view.calendar.theme.getClass('today'))
        }
      }
    }

    return classes
  }


  // Compute the number of the give units in the "current" range.
  // Won't go more precise than days.
  // Will return `0` if there's not a clean whole interval.
  currentRangeAs(unit) { // PLURAL :(
    let dateEnv = this.getDateEnv()
    let range = this.dateProfile.currentRange
    let res = null

    if (unit === 'years') {
      res = dateEnv.diffWholeYears(range.start, range.end)
    } else if (unit === 'months') {
      res = dateEnv.diffWholeMonths(range.start, range.end)
    } else if (unit === 'weeks') {
      res = dateEnv.diffWholeMonths(range.start, range.end)
    } else if (unit === 'days') {
      res = diffWholeDays(range.start, range.end)
    }

    return res || 0
  }


  isValidSegDownEl(el: HTMLElement) {
    return !this.eventDrag && !this.eventResize &&
      !elementClosest(el, '.fc-mirror') &&
      !this.isInPopover(el)
  }


  isValidDateDownEl(el: HTMLElement) {
    let segEl = elementClosest(el, this.fgSegSelector)

    return (!segEl || segEl.classList.contains('fc-mirror')) &&
      !elementClosest(el, '.fc-more') && // a "more.." link
      !elementClosest(el, 'a[data-goto]') && // a clickable nav link
      !this.isInPopover(el)
  }


  // is the element inside of an inner popover?
  isInPopover(el: HTMLElement) {
    let popoverEl = elementClosest(el, '.fc-popover')
    return popoverEl && popoverEl !== this.el // if the current component IS a popover, okay
  }

  isEventsValid(eventStore: EventStore) {
    let { dateProfile } = this
    let instances = eventStore.instances

    if (dateProfile) { // HACK for DayTile
      for (let instanceId in instances) {
        if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
          return false
        }
      }
    }

    return isEventsValid(eventStore, this.getCalendar())
  }

  isSelectionValid(selection: DateSpan): boolean {
    let { dateProfile } = this

    if (
      dateProfile && // HACK for DayTile
      !rangeContainsRange(dateProfile.validRange, selection.range)
    ) {
      return false
    }

    return isSelectionValid(selection, this.getCalendar())
  }

}

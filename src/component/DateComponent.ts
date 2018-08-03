import { attrsToStr, htmlEscape } from '../util/html'
import { elementClosest } from '../util/dom-manip'
import { default as Component, RenderForceFlags } from './Component'
import Calendar from '../Calendar'
import View from '../View'
import { DateProfile } from '../DateProfileGenerator'
import { DateMarker, DAY_IDS, addDays, startOfDay, diffDays, diffWholeDays } from '../datelib/marker'
import { Duration, createDuration } from '../datelib/duration'
import { DateSpan } from '../structs/date-span'
import { EventRenderRange, sliceEventStore } from '../component/event-rendering'
import { EventStore } from '../structs/event-store'
import { BusinessHoursDef, buildBusinessHours } from '../structs/business-hours'
import { DateEnv } from '../datelib/env'
import Theme from '../theme/Theme'
import { EventInteractionState } from '../interactions/event-interaction-state'
import { assignTo } from '../util/object'
import browserContext from '../common/browser-context'
import { Hit } from '../interactions/HitDragging'
import { computeVisibleDayRange } from '../util/misc'
import { DateRange, rangeContainsMarker } from '../datelib/date-range'


export interface DateComponentRenderState {
  dateProfile: DateProfile
  eventStore: EventStore
  selection: DateSpan | null
  dragState: EventInteractionState | null
  eventResizeState: EventInteractionState | null
  businessHoursDef: BusinessHoursDef // BusinessHoursDef's `false` is the empty state
  selectedEventInstanceId: string
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
  doesDragHelper: boolean = false // for events that ORIGINATE from this component
  doesDragHighlight: boolean = false // for events that ORIGINATE from this component
  segSelector: string = '.fc-event-container > *' // what constitutes an event element?

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

  eventRendererClass: any
  helperRendererClass: any
  fillRendererClass: any

  uid: any
  childrenByUid: any
  isRTL: boolean = false // frequently accessed options
  nextDayThreshold: Duration // "
  view: View

  eventRenderer: any
  helperRenderer: any
  fillRenderer: any

  hasAllDayBusinessHours: boolean = false // TODO: unify with largeUnit and isTimeScale?

  renderedFlags: any = {}
  dirtySizeFlags: any = {}

  dateProfile: DateProfile = null
  businessHoursDef: BusinessHoursDef = false
  selection: DateSpan = null
  eventStore: EventStore = null
  dragState: EventInteractionState = null
  eventResizeState: EventInteractionState = null
  interactingEventDefId: string = null
  selectedEventInstanceId: string = null


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
    this.isRTL = this.opt('isRTL')

    if (this.fillRendererClass) {
      this.fillRenderer = new this.fillRendererClass(this)
    }

    if (this.eventRendererClass) { // fillRenderer is optional -----v
      this.eventRenderer = new this.eventRendererClass(this, this.fillRenderer)
    }

    if (this.helperRendererClass && this.eventRenderer) {
      this.helperRenderer = new this.helperRendererClass(this, this.eventRenderer)
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
      this.buildCoordCaches()
    }

    if (force || flags.businessHours) {
      this.computeBusinessHoursSize()
    }

    // don't worry about updating the resize of the helper
    if (force || flags.selection || flags.drag || flags.eventResize) {
      this.computeHighlightSize()
    }

    if (force || flags.drag || flags.eventResize) {
      this.computeHelperSize()
    }

    if (force || flags.events) {
      this.computeEventsSize()
    }

    if (force || flags.businessHours) {
      this.assignBusinessHoursSize()
    }

    if (force || flags.selection || flags.drag || flags.eventResize) {
      this.assignHighlightSize()
    }

    if (force || flags.drag || flags.eventResize) {
      this.assignHelperSize()
    }

    if (force || flags.events) {
      this.assignEventsSize()
    }

    this.dirtySizeFlags = {}
    this.callChildren('updateSize', arguments) // always do this at end?
  }


  updateBaseSize(totalHeight, isAuto) {
  }


  buildCoordCaches() {
  }


  queryHit(leftOffset, topOffset): Hit {
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


  triggerRenderedSegs(segs: Seg[]) {
    if (this.hasPublicHandlers('eventAfterRender')) {
      for (let seg of segs) {
        this.publiclyTriggerAfterSizing('eventAfterRender', [
          {
            event: seg.eventRange, // what to do here?
            el: seg.el,
            view: this
          }
        ])
      }
    }
  }


  triggerWillRemoveSegs(segs: Seg[]) {
    if (this.hasPublicHandlers('eventDestroy')) {
      for (let seg of segs) {
        this.publiclyTrigger('eventDestroy', [
          {
            event: seg.eventRange, // what to do here?
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
      businessHours: renderState.businessHoursDef !== this.businessHoursDef,
      selection: renderState.selection !== this.selection,
      events: renderState.eventStore !== this.eventStore,
      selectedEvent: renderState.selectedEventInstanceId !== this.selectedEventInstanceId,
      drag: renderState.dragState !== this.dragState,
      eventResize: renderState.eventResizeState !== this.eventResizeState
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
            forceFlags = true
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
      renderedFlags.skeleton = true
      dirtySizeFlags.skeleton = true
    }

    if (flags.dates && renderState.dateProfile) {
      this.renderDates() // pass in dateProfile too?
      renderedFlags.dates = true
      dirtySizeFlags.dates = true
    }

    if (flags.businessHours && renderState.businessHoursDef) {
      this.renderBusinessHours(renderState.businessHoursDef)
      renderedFlags.businessHours = true
      dirtySizeFlags.businessHours = true
    }

    if (flags.selection && renderState.selection) {
      this.renderSelection(renderState.selection)
      renderedFlags.selection = true
      dirtySizeFlags.selection = true
    }

    if (flags.events && renderState.eventStore) {
      this.renderEvents(renderState.eventStore)
      renderedFlags.events = true
      dirtySizeFlags.events = true
    }

    if (flags.selectedEvent) {
      this.selectEventsByInstanceId(renderState.selectedEventInstanceId)
      renderedFlags.selectedEvent = true
      dirtySizeFlags.selectedEvent = true
    }

    if (flags.drag && renderState.dragState) {
      this.renderDragState(renderState.dragState)
      renderedFlags.drag = true
      dirtySizeFlags.drag = true
    }

    if (flags.eventResize && renderState.eventResizeState) {
      this.renderEventResizeState(renderState.eventResizeState)
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

    if ((!flags || flags.drag) && renderedFlags.drag) {
      this.unrenderDragState()
      renderedFlags.drag = false
    }

    if ((!flags || flags.selectedEvent) && renderedFlags.selectedEvent) {
      this.unselectAllEvents()
      renderedFlags.selectedEvent = false
    }

    if ((!flags || flags.events) && renderedFlags.events) {
      this.unrenderEvents()
      renderedFlags.events = false
    }

    if ((!flags || flags.selection) && renderedFlags.selection) {
      this.unrenderSelection()
      renderedFlags.selection = false
    }

    if ((!flags || flags.businessHours) && renderedFlags.businessHours) {
      this.unrenderBusinessHours()
      renderedFlags.businessHours = false
    }

    if ((!flags || flags.dates) && renderedFlags.dates) {
      this.unrenderDates()
      renderedFlags.dates = false
    }

    if ((!flags || flags.skeleton) && renderedFlags.skeleton) {
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


  unrenderSkeleton() {
    // subclasses should implement
  }


  // Date
  // -----------------------------------------------------------------------------------------------------------------


  // date-cell content only
  renderDates() {
    // subclasses should implement
  }


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


  renderBusinessHours(businessHoursDef: BusinessHoursDef) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs(
        'businessHours',
        this.eventStoreToSegs(
          buildBusinessHours(
            businessHoursDef,
            this.hasAllDayBusinessHours,
            this.dateProfile.activeRange,
            this.getCalendar()
          )
        ),
        {
          getClasses(seg) {
            return [ 'fc-bgevent' ].concat(seg.eventRange.eventDef.className)
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


  renderEvents(eventStore: EventStore) {
    if (this.eventRenderer) {
      this.eventRenderer.rangeUpdated() // poorly named now
      this.eventRenderer.renderSegs(
        this.eventStoreToSegs(eventStore)
      )
      this.triggerRenderedSegs(this.eventRenderer.getSegs())
    }
  }


  unrenderEvents() {
    if (this.eventRenderer) {
      this.triggerWillRemoveSegs(this.eventRenderer.getSegs())
      this.eventRenderer.unrender()
    }
  }


  computeEventsSize() {
    if (this.eventRenderer) {
      this.eventRenderer.computeFgSize()
    }
  }


  assignEventsSize() {
    if (this.eventRenderer) {
      this.eventRenderer.assignFgSize()
    }
  }


  // Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------


  renderDragState(dragState: EventInteractionState) {
    this.hideSegsByHash(dragState.affectedEvents.instances)
    this.renderDrag(dragState.mutatedEvents, dragState.isEvent, dragState.origSeg)
  }


  unrenderDragState() {
    this.showSegsByHash(this.dragState.affectedEvents.instances)
    this.unrenderDrag()
  }


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  renderDrag(eventStore: EventStore, isEvent: boolean, origSeg: Seg | null) {
    let segs = this.eventStoreToSegs(eventStore)

    // if the user is dragging something that is considered an event with real event data,
    // and this component likes to do drag mirrors OR the component where the seg came from
    // likes to do drag mirrors, then render a drag mirror.
    if (isEvent && (this.doesDragHelper || origSeg && origSeg.component.doesDragHelper)) {
      if (this.helperRenderer) {
        this.helperRenderer.renderEventDraggingSegs(segs, origSeg)
      }
    }

    // if it would be impossible to render a drag mirror OR this component likes to render
    // highlights, then render a highlight.
    if (!isEvent || this.doesDragHighlight) {
      this.renderHighlightSegs(segs)
    }
  }


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderDrag() {
    this.unrenderHighlight()

    if (this.helperRenderer) {
      this.helperRenderer.unrender()
    }
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  renderEventResizeState(eventResizeState: EventInteractionState) {
    this.hideSegsByHash(eventResizeState.affectedEvents.instances)
    this.renderEventResize(eventResizeState.mutatedEvents, eventResizeState.origSeg)
  }


  unrenderEventResizeState() {
    this.showSegsByHash(this.eventResizeState.affectedEvents.instances)
    this.unrenderEventResize()
  }


  // Renders a visual indication of an event being resized.
  renderEventResize(eventStore: EventStore, origSeg: any) {
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
      if (hash[seg.eventRange.eventInstance.instanceId]) {
        seg.el.style.visibility = 'hidden'
      }
    })
  }


  showSegsByHash(hash) {
    this.getAllEventSegs().forEach(function(seg) {
      if (hash[seg.eventRange.eventInstance.instanceId]) {
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
      if (
        seg.eventRange.eventInstance.instanceId === instanceId &&
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
  renderSelection(selection: DateSpan) {
    this.renderHighlightSegs(this.selectionToSegs(selection))
  }


  // Unrenders a visual indication of selection
  unrenderSelection() {
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


  computeHelperSize() {
    if (this.helperRenderer) {
      this.helperRenderer.computeSize()
    }
  }


  assignHelperSize() {
    if (this.helperRenderer) {
      this.helperRenderer.assignSize()
    }
  }


  /* Converting selection/eventRanges -> segs
  ------------------------------------------------------------------------------------------------------------------*/


  eventStoreToSegs(eventStore: EventStore): Seg[] {
    let activeRange = this.dateProfile.activeRange
    let eventRenderRanges = sliceEventStore(eventStore, activeRange)
    let allSegs: Seg[] = []

    for (let eventRenderRange of eventRenderRanges) {
      let segs = this.rangeToSegs(eventRenderRange.range, eventRenderRange.eventDef.isAllDay)

      for (let seg of segs) {
        seg.eventRange = eventRenderRange
        allSegs.push(seg)
      }
    }

    return allSegs
  }


  selectionToSegs(selection: DateSpan): Seg[] {
    return this.rangeToSegs(selection.range, selection.isAllDay)
  }


  // must implement if want to use many of the rendering utils
  rangeToSegs(range: DateRange, isAllDay: boolean): Seg[] {
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


  // Returns the date range of the full days the given range visually appears to occupy.
  computeDayRange(range): DateRange {
    return computeVisibleDayRange(range, this.nextDayThreshold)
  }


  // Does the given range visually appear to occupy more than one day?
  isMultiDayRange(range) {
    let dayRange = this.computeDayRange(range)

    return diffDays(dayRange.start, dayRange.end) > 1
  }


  isValidSegDownEl(el: HTMLElement) {
    return !this.dragState &&
      !this.eventResizeState &&
      !elementClosest(el, '.fc-helper')
  }


  isValidDateDownEl(el: HTMLElement) {
    return !elementClosest(el, this.segSelector) &&
      !elementClosest(el, '.fc-more') && // a "more.." link
      !elementClosest(el, 'a[data-goto]') // a clickable nav link
  }

}

import { attrsToStr, htmlEscape } from '../util/html'
import Component from './Component'
import Calendar from '../Calendar'
import View from '../View'
import { DateProfile } from '../DateProfileGenerator'
import { DateMarker, DAY_IDS, addDays, startOfDay, diffDays, diffWholeDays } from '../datelib/marker'
import { Duration, createDuration, asRoughMs } from '../datelib/duration'
import { sliceEventStore } from '../reducers/event-rendering'
import { Selection } from '../reducers/selection'
import UnzonedRange from '../models/UnzonedRange'
import { Seg } from '../reducers/seg'
import { EventStore } from '../reducers/event-store'
import { BusinessHourDef, buildBusinessHourEventStore } from '../reducers/business-hours'
import { DateEnv } from '../datelib/env'
import Theme from '../theme/Theme'
import { DragState } from '../reducers/drag'
import { EventResizeState } from '../reducers/event-resize'
import { DateComponentRenderState } from '../reducers/main'
import { assignTo } from '../util/object'


export default abstract class DateComponent extends Component {

  static guid: number = 0 // TODO: better system for this?

  eventRendererClass: any
  helperRendererClass: any
  businessHourRendererClass: any
  fillRendererClass: any

  uid: any
  childrenByUid: any
  isRTL: boolean = false // frequently accessed options
  nextDayThreshold: Duration // "
  view: View

  eventRenderer: any
  helperRenderer: any
  businessHourRenderer: any
  fillRenderer: any

  hasAllDayBusinessHours: boolean = false // TODO: unify with largeUnit and isTimeScale?

  isSkeletonRendered: boolean = false
  isDatesRendered: boolean = false
  isBusinessHoursRendered: boolean = false
  isSelectionRendered: boolean = false
  isEventsRendered: boolean = false
  isDragRendered: boolean = false
  isEventResizeRendered: boolean = false
  isSizeDirty: boolean = false
  dateProfile: DateProfile
  businessHoursDef: BusinessHourDef
  selection: Selection
  eventStore: EventStore
  dragState: DragState
  eventResizeState: EventResizeState


  constructor(_view, _options?) {
    super()

    // hack to set options prior to the this.opt calls
    this.view = _view || this
    if (_options) {
      this['options'] = _options
    }

    this.uid = String(DateComponent.guid++)
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

    if (this.businessHourRendererClass && this.fillRenderer) {
      this.businessHourRenderer = new this.businessHourRendererClass(this, this.fillRenderer)
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


  // TODO: only do if isInDom?
  // TODO: make part of Component, along with children/batch-render system?
  updateSize(totalHeight, isAuto, isResize) {
    this.callChildren('updateSize', arguments)
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  opt(name) {
    return this.view.options[name]
  }


  publiclyTrigger(...args) {
    let calendar = this.getCalendar()

    return calendar.publiclyTrigger.apply(calendar, args)
  }


  hasPublicHandlers(...args) {
    let calendar = this.getCalendar()

    return calendar.hasPublicHandlers.apply(calendar, args)
  }


  // Root Rendering
  // -----------------------------------------------------------------------------------------------------------------


  render(renderState: DateComponentRenderState, forces: any) {
    if (!forces) {
      forces = {}
    }

    let isSkeletonDirty = forces === true ||
      !this.isSkeletonRendered
    let isDatesDirty = forces === true ||
      isSkeletonDirty ||
      renderState.dateProfile !== this.dateProfile
    let isBusinessHoursDirty = forces === true ||
      isDatesDirty ||
      renderState.businessHoursDef !== this.businessHoursDef
    let isSelectionDirty = forces === true ||
      isDatesDirty ||
      renderState.selection !== this.selection
    let isEventsDirty = forces === true || forces.events ||
      isDatesDirty ||
      renderState.eventStore !== this.eventStore
    let isDragDirty = forces === true ||
      isDatesDirty ||
      renderState.dragState !== this.dragState
    let isEventResizeDirty = forces === true ||
      isDatesDirty ||
      renderState.eventResizeState !== this.eventResizeState

    // unrendering
    if (isEventResizeDirty && this.isEventResizeRendered) {
      this.unrenderEventResize()
      this.isEventResizeRendered = false
      this.isSizeDirty = false
    }
    if (isDragDirty && this.isDatesRendered) {
      this.unrenderDrag()
      this.isDragRendered = false
      this.isSizeDirty = true
    }
    if (isEventsDirty && this.isEventsRendered) {
      this.unrenderEvents()
      this.isEventsRendered = false
      this.isSizeDirty = true
    }
    if (isSelectionDirty && this.isSkeletonRendered) {
      this.unrenderSelection()
      this.isSkeletonRendered = false
      this.isSizeDirty = true
    }
    if (isBusinessHoursDirty && this.isBusinessHoursRendered) {
      this.unrenderBusinessHours()
      this.isBusinessHoursRendered = false
      this.isSizeDirty = true
    }
    if (isDatesDirty && this.isDatesRendered) {
      this.unrenderDates()
      this.isDatesRendered = false
      this.isSizeDirty = true
    }
    if (isSkeletonDirty && this.isSkeletonRendered) {
      this.unrenderSkeleton()
      this.isSkeletonRendered = false
      this.isSizeDirty = true
    }

    assignTo(this, renderState)

    // rendering
    if (isSkeletonDirty) {
      this.renderSkeleton()
      this.isSkeletonRendered = true
      this.isSizeDirty = true
    }
    if (isDatesDirty && renderState.dateProfile) {
      this.renderDates() // pass in dateProfile too?
      this.isDatesRendered = true
      this.isSizeDirty = true
    }
    if (isBusinessHoursDirty && renderState.businessHoursDef && this.isDatesRendered) {
      this.renderBusinessHours(renderState.businessHoursDef)
      this.isBusinessHoursRendered = true
      this.isSizeDirty = true
    }
    if (isSelectionDirty && renderState.selection && this.isDatesRendered) {
      this.renderSelection(renderState.selection)
      this.isSelectionRendered = true
      this.isSizeDirty = true
    }
    if (isEventsDirty && renderState.eventStore && this.isDatesRendered) {
      this.renderEvents(renderState.eventStore)
      this.isEventsRendered = true
      this.isSizeDirty = true
    }
    if (isDragDirty && renderState.dragState && this.isDatesRendered) {
      let { dragState } = renderState
      this.renderDrag(dragState.eventStore, dragState.origSeg, dragState.isTouch)
      this.isDragRendered = true
      this.isSizeDirty = true
    }
    if (isEventResizeDirty && renderState.eventResizeState && this.isDatesRendered) {
      let { eventResizeState } = renderState
      this.renderEventResize(eventResizeState.eventStore, eventResizeState.origSeg, eventResizeState.isTouch)
      this.isEventResizeRendered = true
      this.isSizeDirty = true
    }

    this.renderChildren(renderState, forces)
  }


  renderChildren(renderState: DateComponentRenderState, forces: any) {
    this.callChildren('render', arguments)
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


  renderBusinessHours(businessHoursDef: BusinessHourDef) {
    if (this.businessHourRenderer) {
      this.businessHourRenderer.renderSegs(
        this.eventStoreToSegs(
          buildBusinessHourEventStore(
            businessHoursDef,
            this.hasAllDayBusinessHours,
            this.dateProfile.activeUnzonedRange,
            this.getCalendar()
          )
        )
      )
    }
  }


  // Unrenders previously-rendered business-hours
  unrenderBusinessHours() {
    if (this.businessHourRenderer) {
      this.businessHourRenderer.unrender()
    }
  }


  getBusinessHourSegs() { // recursive
    let segs = this.getOwnBusinessHourSegs()

    this.iterChildren(function(child) {
      segs.push.apply(segs, child.getBusinessHourSegs())
    })

    return segs
  }


  getOwnBusinessHourSegs() {
    if (this.businessHourRenderer) {
      return this.businessHourRenderer.getSegs()
    }

    return []
  }


  // Event Displaying
  // -----------------------------------------------------------------------------------------------------------------


  renderEvents(eventStore: EventStore) {
    if (this.eventRenderer) {
      this.eventRenderer.rangeUpdated() // poorly named now
      this.eventRenderer.renderSegs(
        this.eventStoreToSegs(eventStore)
      )
    }
  }


  unrenderEvents() {
    if (this.eventRenderer) {
      this.eventRenderer.unrender()
    }
  }


  getEventSegs() { // recursive
    let segs = this.getOwnEventSegs()

    this.iterChildren(function(child) {
      segs.push.apply(segs, child.getEventSegs())
    })

    return segs
  }


  getOwnEventSegs() { // just for itself
    if (this.eventRenderer) {
      return this.eventRenderer.getSegs()
    }

    return []
  }


  // Event Rendering Triggering
  // -----------------------------------------------------------------------------------------------------------------


  triggerAfterEventsRendered() {
    this.triggerAfterEventSegsRendered(
      this.getEventSegs()
    )

    this.publiclyTrigger('eventAfterAllRender', [ { view: this } ])
  }


  triggerAfterEventSegsRendered(segs) {
    // an optimization, because getEventLegacy is expensive
    if (this.hasPublicHandlers('eventAfterRender')) {
      segs.forEach((seg) => {
        if (seg.el) { // necessary?
          this.publiclyTrigger('eventAfterRender', [
            {
              event: seg.eventRange, // what to do here?
              el: seg.el,
              view: this
            }
          ])
        }
      })
    }
  }


  triggerBeforeEventsDestroyed() {
    this.triggerBeforeEventSegsDestroyed(
      this.getEventSegs()
    )
  }


  triggerBeforeEventSegsDestroyed(segs) {
    if (this.hasPublicHandlers('eventDestroy')) {
      segs.forEach((seg) => {
        if (seg.el) { // necessary?
          this.publiclyTrigger('eventDestroy', [
            {
              event: seg.eventRange, // what to do here?
              el: seg.el,
              view: this
            }
          ])
        }
      })
    }
  }


  // Event Rendering Utils
  // -----------------------------------------------------------------------------------------------------------------


  // Hides all rendered event segments linked to the given event
  // RECURSIVE with subcomponents
  showEventsWithId(eventDefId) {

    this.getEventSegs().forEach(function(seg) {
      if (
        seg.eventRange.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.style.visibility = ''
      }
    })

    this.callChildren('showEventsWithId', arguments)
  }


  // Shows all rendered event segments linked to the given event
  // RECURSIVE with subcomponents
  hideEventsWithId(eventDefId) {

    this.getEventSegs().forEach(function(seg) {
      if (
        seg.eventRange.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.style.visibility = 'hidden'
      }
    })

    this.callChildren('hideEventsWithId', arguments)
  }


  // Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  // Must return elements used for any mock events.
  renderDrag(eventStore: EventStore, origSeg?, isTouch = false) {
    // subclasses can implement
  }


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderDrag() {
    // subclasses can implement
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


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of an event being resized.
  renderEventResize(eventStore: EventStore, origSeg: any, isTouch: boolean) {
    // subclasses can implement
  }


  // Unrenders a visual indication of an event being resized.
  unrenderEventResize() {
    // subclasses can implement
  }


  // Selection
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of the selection
  renderSelection(selection: Selection) {
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


  /* Converting selection/eventRanges -> segs
  ------------------------------------------------------------------------------------------------------------------*/


  eventStoreToSegs(eventStore: EventStore): Seg[] {
    let activeUnzonedRange = this.dateProfile.activeUnzonedRange
    let eventRenderRanges = sliceEventStore(eventStore, activeUnzonedRange)
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


  selectionToSegs(selection: Selection): Seg[] {
    return this.rangeToSegs(selection.range, selection.isAllDay)
  }


  // must implement if want to use many of the rendering utils
  rangeToSegs(range: UnzonedRange, isAllDay: boolean): Seg[] {
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

    if (!this.dateProfile.activeUnzonedRange.containsDate(date)) {
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
    let range = this.dateProfile.currentUnzonedRange
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
  // Returns a plain object with start/end, NOT an UnzonedRange!
  computeDayRange(unzonedRange): { start: DateMarker, end: DateMarker } {
    let startDay: DateMarker = startOfDay(unzonedRange.start) // the beginning of the day the range starts
    let end: DateMarker = unzonedRange.end
    let endDay: DateMarker = startOfDay(end)
    let endTimeMS: number = end.valueOf() - endDay.valueOf() // # of milliseconds into `endDay`

    // If the end time is actually inclusively part of the next day and is equal to or
    // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
    // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
    if (endTimeMS && endTimeMS >= asRoughMs(this.nextDayThreshold)) {
      endDay = addDays(endDay, 1)
    }

    // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
    if (endDay <= startDay) {
      endDay = addDays(startDay, 1)
    }

    return { start: startDay, end: endDay } // TODO: eventually use UnzonedRange?
  }


  // Does the given range visually appear to occupy more than one day?
  isMultiDayRange(unzonedRange) {
    let dayRange = this.computeDayRange(unzonedRange)

    return diffDays(dayRange.start, dayRange.end) > 1
  }

}

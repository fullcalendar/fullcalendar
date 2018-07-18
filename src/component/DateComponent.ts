import { attrsToStr, htmlEscape } from '../util/html'
import { elementClosest } from '../util/dom-manip'
import { default as Component, RenderForceFlags } from './Component'
import Calendar from '../Calendar'
import View from '../View'
import { DateProfile } from '../DateProfileGenerator'
import { DateMarker, DAY_IDS, addDays, startOfDay, diffDays, diffWholeDays } from '../datelib/marker'
import { Duration, createDuration, asRoughMs } from '../datelib/duration'
import { Selection } from '../reducers/selection'
import UnzonedRange from '../models/UnzonedRange'
import { EventRenderRange, sliceEventStore } from '../reducers/event-rendering'
import { EventStore } from '../reducers/event-store'
import { BusinessHourDef, buildBusinessHourEventStore } from '../reducers/business-hours'
import { DateEnv } from '../datelib/env'
import Theme from '../theme/Theme'
import { EventInteractionState } from '../reducers/event-interaction'
import { assignTo } from '../util/object'
import GlobalContext from '../common/GlobalContext'


export interface DateComponentRenderState {
  dateProfile: DateProfile
  eventStore: EventStore
  selection: Selection | null
  dragState: EventInteractionState | null
  eventResizeState: EventInteractionState | null
  businessHoursDef: BusinessHourDef
  selectedEventInstanceId: string
}

export interface Seg {
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
  segSelector: string = '.fc-event-container > *' // what constitutes an event element?

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date areas. if not defined, assumes to be day and time granularity.
  // TODO: port isTimeScale into same system?
  largeUnit: any

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
  dateProfile: DateProfile
  businessHoursDef: BusinessHourDef
  selection: Selection
  eventStore: EventStore
  dragState: EventInteractionState
  eventResizeState: EventInteractionState
  interactingEventDefId: string
  selectedEventInstanceId: string


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

    if (this.businessHourRendererClass && this.fillRenderer) {
      this.businessHourRenderer = new this.businessHourRendererClass(this, this.fillRenderer)
    }
  }


  setElement(el) {
    el.setAttribute('data-fc-com-uid', this.uid)
    super.setElement(el)
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


  updateSize(totalHeight, isAuto) {
    this.callChildren('updateSize', arguments)
  }


  queryHit(leftOffset, topOffset): Selection {
    return null // this should be abstract
  }


  buildCoordCaches() {
  }


  bindGlobalHandlers() {
    if (this.isInteractable) {
      GlobalContext.registerComponent(this)
    }
  }


  unbindGlobalHandlers() {
    if (this.isInteractable) {
      GlobalContext.unregisterComponent(this)
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

    let isSkeletonDirty = forceFlags === true
    let isDatesDirty = forceFlags === true ||
      isSkeletonDirty ||
      renderState.dateProfile !== this.dateProfile
    let isBusinessHoursDirty = forceFlags === true ||
      isDatesDirty ||
      renderState.businessHoursDef !== this.businessHoursDef
    let isSelectionDirty = forceFlags === true ||
      isDatesDirty ||
      renderState.selection !== this.selection
    let isEventsDirty = forceFlags === true || forceFlags.events ||
      isDatesDirty ||
      renderState.eventStore !== this.eventStore
    let isDragDirty = forceFlags === true ||
      isDatesDirty ||
      renderState.dragState !== this.dragState
    let isEventResizeDirty = forceFlags === true ||
      isDatesDirty ||
      renderState.eventResizeState !== this.eventResizeState

    // unrendering
    if (isEventResizeDirty && this.isEventResizeRendered) {
      this.unrenderEventResizeState()
      this.isEventResizeRendered = false
    }
    if (isDragDirty && this.isDragRendered) {
      this.unrenderDragState()
      this.isDragRendered = false
    }
    if (isEventsDirty && this.isEventsRendered) {
      this.unrenderEvents()
      this.isEventsRendered = false
    }
    if (isSelectionDirty && this.isSelectionRendered) {
      this.unrenderSelection()
      this.isSelectionRendered = false
    }
    if (isBusinessHoursDirty && this.isBusinessHoursRendered) {
      this.unrenderBusinessHours()
      this.isBusinessHoursRendered = false
    }
    if (isDatesDirty && this.isDatesRendered) {
      this.unrenderDates()
      this.isDatesRendered = false
    }
    if (isSkeletonDirty && this.isSkeletonRendered) {
      this.unrenderSkeleton()
      this.isSkeletonRendered = false
    }

    assignTo(this, renderState)

    // rendering
    if ((isSkeletonDirty || !this.isSkeletonRendered) || !this.isSkeletonRendered) {
      this.renderSkeleton()
      this.isSkeletonRendered = true
    }
    if ((isDatesDirty || !this.isDatesRendered) && renderState.dateProfile) {
      this.renderDates() // pass in dateProfile too?
      this.isDatesRendered = true
    }
    if ((isBusinessHoursDirty || !this.isBusinessHoursRendered) && renderState.businessHoursDef && this.isDatesRendered) {
      this.renderBusinessHours(renderState.businessHoursDef)
      this.isBusinessHoursRendered = true
    }
    if ((isSelectionDirty || !this.isSelectionRendered) && renderState.selection && this.isDatesRendered) {
      this.renderSelection(renderState.selection)
      this.isSelectionRendered = true
    }
    if ((isEventsDirty || !this.isEventsRendered) && renderState.eventStore && this.isDatesRendered) {
      this.renderEvents(renderState.eventStore)
      this.isEventsRendered = true
    }
    if ((isDragDirty || !this.isDragRendered) && renderState.dragState && this.isDatesRendered) {
      let { dragState } = renderState
      this.renderDragState(dragState)
      this.isDragRendered = true
    }
    if ((isEventResizeDirty || !this.isEventResizeRendered) && renderState.eventResizeState && this.isDatesRendered) {
      let { eventResizeState } = renderState
      this.renderEventResizeState(eventResizeState)
      this.isEventResizeRendered = true
    }

    this.updateSelectedEventInstance(renderState.selectedEventInstanceId)

    this.renderChildren(renderState, forceFlags)
  }


  renderChildren(renderState: DateComponentRenderState, forceFlags: RenderForceFlags) {
    this.callChildren('render', arguments)
  }


  removeElement() {
    this.updateSelectedEventInstance()

    if (this.isEventResizeRendered) {
      this.unrenderEventResizeState()
      this.isEventResizeRendered = false
    }
    if (this.isDragRendered) {
      this.unrenderDragState()
      this.isDragRendered = false
    }
    if (this.isEventsRendered) {
      this.unrenderEvents()
      this.isEventsRendered = false
    }
    if (this.isSelectionRendered) {
      this.unrenderSelection()
      this.isSelectionRendered = false
    }
    if (this.isBusinessHoursRendered) {
      this.unrenderBusinessHours()
      this.isBusinessHoursRendered = false
    }
    if (this.isDatesRendered) {
      this.unrenderDates()
      this.isDatesRendered = false
    }
    if (this.isSkeletonRendered) {
      this.unrenderSkeleton()
      this.isSkeletonRendered = false
    }

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


  // Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------


  renderDragState(dragState: EventInteractionState) {
    this.updateEventInteractionState(dragState)
    this.renderDrag(dragState.eventStore, dragState.origSeg, dragState.isTouch)
  }


  unrenderDragState() {
    this.updateEventInteractionState()
    this.unrenderDrag()
  }


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  // Must return elements used for any mock events.
  renderDrag(eventStore: EventStore, origSeg?, isTouch = false) {
    // subclasses can implement
    // TODO: how to determine if just one child rendered the drag so we don't have to render the helper?
  }


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderDrag() {
    // subclasses can implement
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  renderEventResizeState(dragState: EventInteractionState) {
    this.updateEventInteractionState(dragState)
    this.renderEventResize(dragState.eventStore, dragState.origSeg, dragState.isTouch)
  }


  unrenderEventResizeState() {
    this.updateEventInteractionState()
    this.unrenderEventResize()
  }


  // Renders a visual indication of an event being resized.
  renderEventResize(eventStore: EventStore, origSeg: any, isTouch: boolean) {
    // subclasses can implement
  }


  // Unrenders a visual indication of an event being resized.
  unrenderEventResize() {
    // subclasses can implement
  }


  // Event Interaction Utils
  // -----------------------------------------------------------------------------------------------------------------


  updateEventInteractionState(dragState?: EventInteractionState) {
    let eventDefId = (dragState && dragState.origSeg) ? dragState.origSeg.eventRange.eventDef.defId : null

    if (this.interactingEventDefId && this.interactingEventDefId !== eventDefId) {
      this.showEventByDefId(this.interactingEventDefId)
      this.interactingEventDefId = null
    }

    if (eventDefId && !this.interactingEventDefId) {
      this.hideEventsByDefId(eventDefId)
      this.interactingEventDefId = eventDefId
    }
  }


  // Hides all rendered event segments linked to the given event
  showEventByDefId(eventDefId) {
    this.getAllEventSegs().forEach(function(seg) {
      if (
        seg.eventRange.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.style.visibility = ''
      }
    })
  }


  // Shows all rendered event segments linked to the given event
  hideEventsByDefId(eventDefId) {
    this.getAllEventSegs().forEach(function(seg) {
      if (
        seg.eventRange.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.style.visibility = 'hidden'
      }
    })
  }


  getAllEventSegs() {
    if (this.eventRenderer) {
      return this.eventRenderer.getSegs()
    } else {
      return []
    }
  }


  // Event Instance Selection (aka long-touch focus)
  // -----------------------------------------------------------------------------------------------------------------
  // TODO: show/hide according to groupId?


  updateSelectedEventInstance(instanceId?) {
    if (this.selectedEventInstanceId && this.selectedEventInstanceId !== instanceId) {
      this.unselectAllEvents()
      this.selectEventsByInstanceId = null
    }

    if (instanceId && !this.selectedEventInstanceId) {
      this.selectEventsByInstanceId(instanceId)
      this.selectedEventInstanceId = instanceId
    }
  }


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


  isValidSegInteraction(evTarget: HTMLElement) {
    return !elementClosest(evTarget, '.fc-helper') &&
      !this.dragState &&
      !this.eventResizeState
  }


  isValidDateInteraction(evTarget: HTMLElement) {
    return !elementClosest(evTarget, this.segSelector) &&
      !elementClosest(evTarget, '.fc-more') && // a "more.." link
      !elementClosest(evTarget, 'a[data-goto]') // a clickable nav link
  }

}

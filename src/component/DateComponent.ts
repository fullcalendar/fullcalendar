import * as $ from 'jquery'
import * as moment from 'moment'
import { attrsToStr, htmlEscape, dayIDs } from '../util'
import momentExt from '../moment-ext'
import { formatRange } from '../date-formatting'
import Component from './Component'
import { eventRangeToEventFootprint } from '../models/event/util'
import EventFootprint from '../models/event/EventFootprint'


export default abstract class DateComponent extends Component {

  static guid: number = 0 // TODO: better system for this?

  eventRendererClass: any
  helperRendererClass: any
  businessHourRendererClass: any
  fillRendererClass: any

  uid: any
  childrenByUid: any
  isRTL: boolean = false // frequently accessed options
  nextDayThreshold: any // "
  dateProfile: any // hack

  eventRenderer: any
  helperRenderer: any
  businessHourRenderer: any
  fillRenderer: any

  hitsNeededDepth: number = 0 // necessary because multiple callers might need the same hits

  hasAllDayBusinessHours: boolean = false // TODO: unify with largeUnit and isTimeScale?

  isDatesRendered: boolean = false


  constructor(_view?, _options?) {
    super()

    // hack to set options prior to the this.opt calls
    if (_view) {
      this['view'] = _view
    }
    if (_options) {
      this['options'] = _options
    }

    this.uid = String(DateComponent.guid++)
    this.childrenByUid = {}

    this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'))
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
    return this._getView().opt(name) // default implementation
  }


  publiclyTrigger(...args) {
    let calendar = this._getCalendar()

    return calendar.publiclyTrigger.apply(calendar, args)
  }


  hasPublicHandlers(...args) {
    let calendar = this._getCalendar()

    return calendar.hasPublicHandlers.apply(calendar, args)
  }


  // Date
  // -----------------------------------------------------------------------------------------------------------------


  executeDateRender(dateProfile) {
    this.dateProfile = dateProfile // for rendering
    this.renderDates(dateProfile)
    this.isDatesRendered = true
    this.callChildren('executeDateRender', arguments)
  }


  executeDateUnrender() { // wrapper
    this.callChildren('executeDateUnrender', arguments)
    this.dateProfile = null
    this.unrenderDates()
    this.isDatesRendered = false
  }


  // date-cell content only
  renderDates(dateProfile) {
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


  renderBusinessHours(businessHourGenerator) {
    if (this.businessHourRenderer) {
      this.businessHourRenderer.render(businessHourGenerator)
    }

    this.callChildren('renderBusinessHours', arguments)
  }


  // Unrenders previously-rendered business-hours
  unrenderBusinessHours() {
    this.callChildren('unrenderBusinessHours', arguments)

    if (this.businessHourRenderer) {
      this.businessHourRenderer.unrender()
    }
  }


  // Event Displaying
  // -----------------------------------------------------------------------------------------------------------------


  executeEventRender(eventsPayload) {
    if (this.eventRenderer) {
      this.eventRenderer.rangeUpdated() // poorly named now
      this.eventRenderer.render(eventsPayload)
    } else if (this['renderEvents']) { // legacy
      this['renderEvents'](convertEventsPayloadToLegacyArray(eventsPayload))
    }

    this.callChildren('executeEventRender', arguments)
  }


  executeEventUnrender() {
    this.callChildren('executeEventUnrender', arguments)

    if (this.eventRenderer) {
      this.eventRenderer.unrender()
    } else if (this['destroyEvents']) { // legacy
      this['destroyEvents']()
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

    this.publiclyTrigger('eventAfterAllRender', {
      context: this,
      args: [ this ]
    })
  }


  triggerAfterEventSegsRendered(segs) {
    // an optimization, because getEventLegacy is expensive
    if (this.hasPublicHandlers('eventAfterRender')) {
      segs.forEach((seg) => {
        let legacy

        if (seg.el) { // necessary?
          legacy = seg.footprint.getEventLegacy()

          this.publiclyTrigger('eventAfterRender', {
            context: legacy,
            args: [ legacy, seg.el, this ]
          })
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
        let legacy

        if (seg.el) { // necessary?
          legacy = seg.footprint.getEventLegacy()

          this.publiclyTrigger('eventDestroy', {
            context: legacy,
            args: [ legacy, seg.el, this ]
          })
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
        seg.footprint.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.css('visibility', '')
      }
    })

    this.callChildren('showEventsWithId', arguments)
  }


  // Shows all rendered event segments linked to the given event
  // RECURSIVE with subcomponents
  hideEventsWithId(eventDefId) {

    this.getEventSegs().forEach(function(seg) {
      if (
        seg.footprint.eventDef.id === eventDefId &&
        seg.el // necessary?
      ) {
        seg.el.css('visibility', 'hidden')
      }
    })

    this.callChildren('hideEventsWithId', arguments)
  }


  // Drag-n-Drop Rendering (for both events and external elements)
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`.
  // Must return elements used for any mock events.
  renderDrag(eventFootprints, seg, isTouch) {
    let renderedHelper = false

    this.iterChildren(function(child) {
      if (child.renderDrag(eventFootprints, seg, isTouch)) {
        renderedHelper = true
      }
    })

    return renderedHelper
  }


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderDrag() {
    this.callChildren('unrenderDrag', arguments)
  }


  // Event Resizing
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of an event being resized.
  renderEventResize(eventFootprints, seg, isTouch) {
    this.callChildren('renderEventResize', arguments)
  }


  // Unrenders a visual indication of an event being resized.
  unrenderEventResize() {
    this.callChildren('unrenderEventResize', arguments)
  }


  // Selection
  // ---------------------------------------------------------------------------------------------------------------


  // Renders a visual indication of the selection
  // TODO: rename to `renderSelection` after legacy is gone
  renderSelectionFootprint(componentFootprint) {
    this.renderHighlight(componentFootprint)

    this.callChildren('renderSelectionFootprint', arguments)
  }


  // Unrenders a visual indication of selection
  unrenderSelection() {
    this.unrenderHighlight()

    this.callChildren('unrenderSelection', arguments)
  }


  // Highlight
  // ---------------------------------------------------------------------------------------------------------------


  // Renders an emphasis on the given date range. Given a span (unzoned start/end and other misc data)
  renderHighlight(componentFootprint) {
    if (this.fillRenderer) {
      this.fillRenderer.renderFootprint(
        'highlight',
        componentFootprint,
        {
          getClasses() {
            return [ 'fc-highlight' ]
          }
        }
      )
    }

    this.callChildren('renderHighlight', arguments)
  }


  // Unrenders the emphasis on a date range
  unrenderHighlight() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('highlight')
    }

    this.callChildren('unrenderHighlight', arguments)
  }


  // Hit Areas
  // ---------------------------------------------------------------------------------------------------------------
  // just because all DateComponents support this interface
  // doesn't mean they need to have their own internal coord system. they can defer to sub-components.


  hitsNeeded() {
    if (!(this.hitsNeededDepth++)) {
      this.prepareHits()
    }

    this.callChildren('hitsNeeded', arguments)
  }


  hitsNotNeeded() {
    if (this.hitsNeededDepth && !(--this.hitsNeededDepth)) {
      this.releaseHits()
    }

    this.callChildren('hitsNotNeeded', arguments)
  }


  prepareHits() {
    // subclasses can implement
  }


  releaseHits() {
    // subclasses can implement
  }


  // Given coordinates from the topleft of the document, return data about the date-related area underneath.
  // Can return an object with arbitrary properties (although top/right/left/bottom are encouraged).
  // Must have a `grid` property, a reference to this current grid. TODO: avoid this
  // The returned object will be processed by getHitFootprint and getHitEl.
  queryHit(leftOffset, topOffset) {
    let childrenByUid = this.childrenByUid
    let uid
    let hit

    for (uid in childrenByUid) {
      hit = childrenByUid[uid].queryHit(leftOffset, topOffset)

      if (hit) {
        break
      }
    }

    return hit
  }


  getSafeHitFootprint(hit) {
    let footprint = this.getHitFootprint(hit)

    if (!this.dateProfile.activeUnzonedRange.containsRange(footprint.unzonedRange)) {
      return null
    }

    return footprint
  }


  getHitFootprint(hit): any {
    // what about being abstract!?
  }


  // Given position-level information about a date-related area within the grid,
  // should return a jQuery element that best represents it. passed to dayClick callback.
  getHitEl(hit): any {
    // what about being abstract!?
  }


  /* Converting eventRange -> eventFootprint
  ------------------------------------------------------------------------------------------------------------------*/


  eventRangesToEventFootprints(eventRanges) {
    let eventFootprints = []
    let i

    for (i = 0; i < eventRanges.length; i++) {
      eventFootprints.push.apply( // append
        eventFootprints,
        this.eventRangeToEventFootprints(eventRanges[i])
      )
    }

    return eventFootprints
  }


  eventRangeToEventFootprints(eventRange): EventFootprint[] {
    return [ eventRangeToEventFootprint(eventRange) ]
  }


  /* Converting componentFootprint/eventFootprint -> segs
  ------------------------------------------------------------------------------------------------------------------*/


  eventFootprintsToSegs(eventFootprints) {
    let segs = []
    let i

    for (i = 0; i < eventFootprints.length; i++) {
      segs.push.apply(segs,
        this.eventFootprintToSegs(eventFootprints[i])
      )
    }

    return segs
  }


  // Given an event's span (unzoned start/end and other misc data), and the event itself,
  // slices into segments and attaches event-derived properties to them.
  // eventSpan - { start, end, isStart, isEnd, otherthings... }
  eventFootprintToSegs(eventFootprint) {
    let unzonedRange = eventFootprint.componentFootprint.unzonedRange
    let segs
    let i
    let seg

    segs = this.componentFootprintToSegs(eventFootprint.componentFootprint)

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]

      if (!unzonedRange.isStart) {
        seg.isStart = false
      }
      if (!unzonedRange.isEnd) {
        seg.isEnd = false
      }

      seg.footprint = eventFootprint
      // TODO: rename to seg.eventFootprint
    }

    return segs
  }


  componentFootprintToSegs(componentFootprint) {
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


  _getCalendar() { // TODO: strip out. move to generic parent.
    let t = (this as any)
    return t.calendar || t.view.calendar
  }


  _getView() { // TODO: strip out. move to generic parent.
    return (this as any).view
  }


  _getDateProfile() {
    return this._getView().get('dateProfile')
  }


  // Generates HTML for an anchor to another view into the calendar.
  // Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
  // `gotoOptions` can either be a moment input, or an object with the form:
  // { date, type, forceOff }
  // `type` is a view-type like "day" or "week". default value is "day".
  // `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
  buildGotoAnchorHtml(gotoOptions, attrs, innerHtml) {
    let date
    let type
    let forceOff
    let finalOptions

    if ($.isPlainObject(gotoOptions)) {
      date = gotoOptions.date
      type = gotoOptions.type
      forceOff = gotoOptions.forceOff
    } else {
      date = gotoOptions // a single moment input
    }
    date = momentExt(date) // if a string, parse it

    finalOptions = { // for serialization into the link
      date: date.format('YYYY-MM-DD'),
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
  getDayClasses(date, noThemeHighlight?) {
    let view = this._getView()
    let classes = []
    let today

    if (!this.dateProfile.activeUnzonedRange.containsDate(date)) {
      classes.push('fc-disabled-day') // TODO: jQuery UI theme?
    } else {
      classes.push('fc-' + dayIDs[date.day()])

      if (view.isDateInOtherMonth(date, this.dateProfile)) { // TODO: use DateComponent subclass somehow
        classes.push('fc-other-month')
      }

      today = view.calendar.getNow()

      if (date.isSame(today, 'day')) {
        classes.push('fc-today')

        if (noThemeHighlight !== true) {
          classes.push(view.calendar.theme.getClass('today'))
        }
      } else if (date < today) {
        classes.push('fc-past')
      } else {
        classes.push('fc-future')
      }
    }

    return classes
  }


  // Utility for formatting a range. Accepts a range object, formatting string, and optional separator.
  // Displays all-day ranges naturally, with an inclusive end. Takes the current isRTL into account.
  // The timezones of the dates within `range` will be respected.
  formatRange(range, isAllDay, formatStr, separator) {
    let end = range.end

    if (isAllDay) {
      end = end.clone().subtract(1) // convert to inclusive. last ms of previous day
    }

    return formatRange(range.start, end, formatStr, separator, this.isRTL)
  }


  // Compute the number of the give units in the "current" range.
  // Will return a floating-point number. Won't round.
  currentRangeAs(unit) {
    return this._getDateProfile().currentUnzonedRange.as(unit)
  }


  // Returns the date range of the full days the given range visually appears to occupy.
  // Returns a plain object with start/end, NOT an UnzonedRange!
  computeDayRange(unzonedRange) {
    let calendar = this._getCalendar()
    let startDay = calendar.msToUtcMoment(unzonedRange.startMs, true) // the beginning of the day the range starts
    let end = calendar.msToUtcMoment(unzonedRange.endMs)
    let endTimeMS = +end.time() // # of milliseconds into `endDay`
    let endDay = end.clone().stripTime() // the beginning of the day the range exclusively ends

    // If the end time is actually inclusively part of the next day and is equal to or
    // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
    // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
    if (endTimeMS && endTimeMS >= this.nextDayThreshold) {
      endDay.add(1, 'days')
    }

    // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
    if (endDay <= startDay) {
      endDay = startDay.clone().add(1, 'days')
    }

    return { start: startDay, end: endDay }
  }


  // Does the given range visually appear to occupy more than one day?
  isMultiDayRange(unzonedRange) {
    let dayRange = this.computeDayRange(unzonedRange)

    return dayRange.end.diff(dayRange.start, 'days') > 1
  }

}


// legacy

function convertEventsPayloadToLegacyArray(eventsPayload) {
  let eventDefId
  let eventInstances
  let legacyEvents = []
  let i

  for (eventDefId in eventsPayload) {
    eventInstances = eventsPayload[eventDefId].eventInstances

    for (i = 0; i < eventInstances.length; i++) {
      legacyEvents.push(
        eventInstances[i].toLegacy()
      )
    }
  }

  return legacyEvents
}

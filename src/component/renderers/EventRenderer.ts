import * as $ from 'jquery'
import { compareByFieldSpecs, proxy } from '../../util'

export default class EventRenderer {

  view: any
  component: any
  fillRenderer: any // might remain null

  fgSegs: any
  bgSegs: any

  // derived from options
  eventTimeFormat: any
  displayEventTime: any
  displayEventEnd: any


  constructor(component, fillRenderer) { // fillRenderer is optional
    this.view = component._getView()
    this.component = component
    this.fillRenderer = fillRenderer
  }


  opt(name) {
    return this.view.opt(name)
  }


  // Updates values that rely on options and also relate to range
  rangeUpdated() {
    let displayEventTime
    let displayEventEnd

    this.eventTimeFormat =
      this.opt('eventTimeFormat') ||
      this.opt('timeFormat') || // deprecated
      this.computeEventTimeFormat()

    displayEventTime = this.opt('displayEventTime')
    if (displayEventTime == null) {
      displayEventTime = this.computeDisplayEventTime() // might be based off of range
    }

    displayEventEnd = this.opt('displayEventEnd')
    if (displayEventEnd == null) {
      displayEventEnd = this.computeDisplayEventEnd() // might be based off of range
    }

    this.displayEventTime = displayEventTime
    this.displayEventEnd = displayEventEnd
  }


  render(eventsPayload) {
    let dateProfile = this.component._getDateProfile()
    let eventDefId
    let instanceGroup
    let eventRanges
    let bgRanges = []
    let fgRanges = []

    for (eventDefId in eventsPayload) {
      instanceGroup = eventsPayload[eventDefId]

      eventRanges = instanceGroup.sliceRenderRanges(
        dateProfile.activeUnzonedRange
      )

      if (instanceGroup.getEventDef().hasBgRendering()) {
        bgRanges.push.apply(bgRanges, eventRanges)
      } else {
        fgRanges.push.apply(fgRanges, eventRanges)
      }
    }

    this.renderBgRanges(bgRanges)
    this.renderFgRanges(fgRanges)
  }


  unrender() {
    this.unrenderBgRanges()
    this.unrenderFgRanges()
  }


  renderFgRanges(eventRanges) {
    let eventFootprints = this.component.eventRangesToEventFootprints(eventRanges)
    let segs = this.component.eventFootprintsToSegs(eventFootprints)

    // render an `.el` on each seg
    // returns a subset of the segs. segs that were actually rendered
    segs = this.renderFgSegEls(segs)

    if (this.renderFgSegs(segs) !== false) { // no failure?
      this.fgSegs = segs
    }
  }


  unrenderFgRanges() {
    this.unrenderFgSegs(this.fgSegs || [])
    this.fgSegs = null
  }


  renderBgRanges(eventRanges) {
    let eventFootprints = this.component.eventRangesToEventFootprints(eventRanges)
    let segs = this.component.eventFootprintsToSegs(eventFootprints)

    if (this.renderBgSegs(segs) !== false) { // no failure?
      this.bgSegs = segs
    }
  }


  unrenderBgRanges() {
    this.unrenderBgSegs()
    this.bgSegs = null
  }


  getSegs() {
    return (this.bgSegs || []).concat(this.fgSegs || [])
  }


  // Renders foreground event segments onto the grid
  renderFgSegs(segs): (boolean | void) {
    // subclasses must implement
    // segs already has rendered els, and has been filtered.

    return false // signal failure if not implemented
  }


  // Unrenders all currently rendered foreground segments
  unrenderFgSegs(segs) {
    // subclasses must implement
  }


  renderBgSegs(segs) {
    if (this.fillRenderer) {
      this.fillRenderer.renderSegs('bgEvent', segs, {
        getClasses: (seg) => {
          return this.getBgClasses(seg.footprint.eventDef)
        },
        getCss: (seg) => {
          return {
            'background-color': this.getBgColor(seg.footprint.eventDef)
          }
        },
        filterEl: (seg, el) => {
          return this.filterEventRenderEl(seg.footprint, el)
        }
      })
    } else {
      return false // signal failure if no fillRenderer
    }
  }


  unrenderBgSegs() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('bgEvent')
    }
  }


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  renderFgSegEls(segs, disableResizing= false) {
    let hasEventRenderHandlers = this.view.hasPublicHandlers('eventRender')
    let html = ''
    let renderedSegs = []
    let i

    if (segs.length) { // don't build an empty html string

      // build a large concatenation of event segment HTML
      for (i = 0; i < segs.length; i++) {
        this.beforeFgSegHtml(segs[i])
        html += this.fgSegHtml(segs[i], disableResizing)
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
      $(html).each((i, node) => {
        let seg = segs[i]
        let el = $(node)

        if (hasEventRenderHandlers) { // optimization
          el = this.filterEventRenderEl(seg.footprint, el)
        }

        if (el) {
          el.data('fc-seg', seg) // used by handlers
          seg.el = el
          renderedSegs.push(seg)
        }
      })
    }

    return renderedSegs
  }


  beforeFgSegHtml(seg) { // hack
  }


  // Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
  fgSegHtml(seg, disableResizing) {
    // subclasses should implement
  }


  // Generic utility for generating the HTML classNames for an event segment's element
  getSegClasses(seg, isDraggable, isResizable) {
    let classes = [
      'fc-event',
      seg.isStart ? 'fc-start' : 'fc-not-start',
      seg.isEnd ? 'fc-end' : 'fc-not-end'
    ].concat(this.getClasses(seg.footprint.eventDef))

    if (isDraggable) {
      classes.push('fc-draggable')
    }
    if (isResizable) {
      classes.push('fc-resizable')
    }

    // event is currently selected? attach a className.
    if (this.view.isEventDefSelected(seg.footprint.eventDef)) {
      classes.push('fc-selected')
    }

    return classes
  }


  // Given an event and the default element used for rendering, returns the element that should actually be used.
  // Basically runs events and elements through the eventRender hook.
  filterEventRenderEl(eventFootprint, el) {
    let legacy = eventFootprint.getEventLegacy()

    let custom = this.view.publiclyTrigger('eventRender', {
      context: legacy,
      args: [ legacy, el, this.view ]
    })

    if (custom === false) { // means don't render at all
      el = null
    } else if (custom && custom !== true) {
      el = $(custom)
    }

    return el
  }


  // Compute the text that should be displayed on an event's element.
  // `range` can be the Event object itself, or something range-like, with at least a `start`.
  // If event times are disabled, or the event has no time, will return a blank string.
  // If not specified, formatStr will default to the eventTimeFormat setting,
  // and displayEnd will default to the displayEventEnd setting.
  getTimeText(eventFootprint, formatStr?, displayEnd?) {
    return this._getTimeText(
      eventFootprint.eventInstance.dateProfile.start,
      eventFootprint.eventInstance.dateProfile.end,
      eventFootprint.componentFootprint.isAllDay,
      formatStr,
      displayEnd
    )
  }


  _getTimeText(start, end, isAllDay, formatStr?, displayEnd?) {
    if (formatStr == null) {
      formatStr = this.eventTimeFormat
    }

    if (displayEnd == null) {
      displayEnd = this.displayEventEnd
    }

    if (this.displayEventTime && !isAllDay) {
      if (displayEnd && end) {
        return this.view.formatRange(
          { start: start, end: end },
          false, // allDay
          formatStr
        )
      } else {
        return start.format(formatStr)
      }
    }

    return ''
  }


  computeEventTimeFormat() {
    return this.opt('smallTimeFormat')
  }


  computeDisplayEventTime() {
    return true
  }


  computeDisplayEventEnd() {
    return true
  }


  getBgClasses(eventDef) {
    let classNames = this.getClasses(eventDef)
    classNames.push('fc-bgevent')
    return classNames
  }


  getClasses(eventDef) {
    let objs = this.getStylingObjs(eventDef)
    let i
    let classNames = []

    for (i = 0; i < objs.length; i++) {
      classNames.push.apply( // append
        classNames,
        objs[i].eventClassName || objs[i].className || []
      )
    }

    return classNames
  }


  // Utility for generating event skin-related CSS properties
  getSkinCss(eventDef) {
    return {
      'background-color': this.getBgColor(eventDef),
      'border-color': this.getBorderColor(eventDef),
      color: this.getTextColor(eventDef)
    }
  }


  // Queries for caller-specified color, then falls back to default
  getBgColor(eventDef) {
    let objs = this.getStylingObjs(eventDef)
    let i
    let val

    for (i = 0; i < objs.length && !val; i++) {
      val = objs[i].eventBackgroundColor || objs[i].eventColor ||
        objs[i].backgroundColor || objs[i].color
    }

    if (!val) {
      val = this.opt('eventBackgroundColor') || this.opt('eventColor')
    }

    return val
  }


  // Queries for caller-specified color, then falls back to default
  getBorderColor(eventDef) {
    let objs = this.getStylingObjs(eventDef)
    let i
    let val

    for (i = 0; i < objs.length && !val; i++) {
      val = objs[i].eventBorderColor || objs[i].eventColor ||
        objs[i].borderColor || objs[i].color
    }

    if (!val) {
      val = this.opt('eventBorderColor') || this.opt('eventColor')
    }

    return val
  }


  // Queries for caller-specified color, then falls back to default
  getTextColor(eventDef) {
    let objs = this.getStylingObjs(eventDef)
    let i
    let val

    for (i = 0; i < objs.length && !val; i++) {
      val = objs[i].eventTextColor ||
        objs[i].textColor
    }

    if (!val) {
      val = this.opt('eventTextColor')
    }

    return val
  }


  getStylingObjs(eventDef) {
    let objs = this.getFallbackStylingObjs(eventDef)
    objs.unshift(eventDef)
    return objs
  }


  getFallbackStylingObjs(eventDef) {
    return [ eventDef.source ]
  }


  sortEventSegs(segs) {
    segs.sort(proxy(this, 'compareEventSegs'))
  }


  // A cmp function for determining which segments should take visual priority
  compareEventSegs(seg1, seg2) {
    let f1 = seg1.footprint
    let f2 = seg2.footprint
    let cf1 = f1.componentFootprint
    let cf2 = f2.componentFootprint
    let r1 = cf1.unzonedRange
    let r2 = cf2.unzonedRange

    return r1.startMs - r2.startMs || // earlier events go first
      (r2.endMs - r2.startMs) - (r1.endMs - r1.startMs) || // tie? longer events go first
      cf2.isAllDay - cf1.isAllDay || // tie? put all-day events first (booleans cast to 0/1)
      compareByFieldSpecs(
        f1.eventDef,
        f2.eventDef,
        this.view.eventOrderSpecs,
        f1.eventDef.miscProps,
        f2.eventDef.miscProps
      )
  }

}

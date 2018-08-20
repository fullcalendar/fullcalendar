import View from '../../View'
import { DateMarker } from '../../datelib/marker'
import { createFormatter, DateFormatter } from '../../datelib/formatting'
import { htmlToElements } from '../../util/dom-manip'
import { compareByFieldSpecs } from '../../util/misc'
import { EventRenderRange, EventUi, hasBgRendering } from '../event-rendering'
import { Seg } from '../DateComponent'
import EventApi from '../../api/EventApi'


export default class EventRenderer {

  view: View
  component: any
  fillRenderer: any // might remain null

  fgSegs: Seg[]
  bgSegs: Seg[]

  // derived from options
  eventTimeFormat: DateFormatter
  displayEventTime: boolean
  displayEventEnd: boolean


  constructor(component, fillRenderer) { // fillRenderer is optional
    this.view = component.view
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

    this.eventTimeFormat = createFormatter(
      this.opt('eventTimeFormat') ||
      this.opt('timeFormat') || // deprecated
      this.computeEventTimeFormat()
    )

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


  renderSegs(allSegs: Seg[]) {
    let bgSegs: Seg[] = []
    let fgSegs: Seg[] = []

    for (let seg of allSegs) {
      if (hasBgRendering(seg.eventRange.ui)) {
        bgSegs.push(seg)
      } else {
        fgSegs.push(seg)
      }
    }

    this.bgSegs = this.renderBgSegs(bgSegs)

    // render an `.el` on each seg
    // returns a subset of the segs. segs that were actually rendered
    fgSegs = this.renderFgSegEls(fgSegs)

    if (this.renderFgSegs(fgSegs) !== false) { // no failure?
      this.fgSegs = fgSegs
    }
  }


  unrender() {
    this.unrenderBgSegs()
    this.bgSegs = null

    this.unrenderFgSegs(this.fgSegs || [])
    this.fgSegs = null
  }


  getSegs() {
    return (this.bgSegs || []).concat(this.fgSegs || [])
  }


  // Renders foreground event segments onto the grid
  renderFgSegs(segs: Seg[]): (boolean | void) {
    // subclasses must implement
    // segs already has rendered els, and has been filtered.

    return false // signal failure if not implemented
  }


  // Unrenders all currently rendered foreground segments
  unrenderFgSegs(segs: Seg[]) {
    // subclasses must implement
  }


  renderBgSegs(segs: Seg[]): Seg[] {
    if (this.fillRenderer) {
      return this.fillRenderer.renderSegs('bgEvent', segs, {
        getClasses: (seg) => {
          return seg.eventRange.ui.classNames.concat([ 'fc-bgevent' ])
        },
        getCss: (seg) => {
          return {
            'background-color': seg.eventRange.ui.backgroundColor
          }
        },
        filterEl: (seg, el) => {
          return this.filterEventRenderEl(seg.eventRange, el)
        }
      })
    }

    return []
  }


  unrenderBgSegs() {
    if (this.fillRenderer) {
      this.fillRenderer.unrender('bgEvent')
    }
  }


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  renderFgSegEls(segs: Seg[]) {
    let hasEventRenderHandlers = this.view.hasPublicHandlers('eventRender')
    let html = ''
    let renderedSegs = []
    let i

    if (segs.length) { // don't build an empty html string

      // build a large concatenation of event segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.fgSegHtml(segs[i])
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
      htmlToElements(html).forEach((el, i) => {
        let seg = segs[i]

        if (hasEventRenderHandlers) { // optimization
          el = this.filterEventRenderEl(seg.eventRange, el)
        }

        if (el) {
          setElSeg(el, seg)
          seg.el = el
          renderedSegs.push(seg)
        }
      })
    }

    return renderedSegs
  }


  // Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
  fgSegHtml(seg: Seg) {
    // subclasses should implement
  }


  // Generic utility for generating the HTML classNames for an event segment's element
  getSegClasses(seg: Seg, isDraggable, isResizable) {
    let classes = [
      'fc-event',
      seg.isStart ? 'fc-start' : 'fc-not-start',
      seg.isEnd ? 'fc-end' : 'fc-not-end'
    ].concat(seg.eventRange.ui.classNames)

    if (isDraggable) {
      classes.push('fc-draggable')
    }
    if (isResizable) {
      classes.push('fc-resizable')
    }

    // event is currently selected? attach a className.
    if (seg.eventRange.instance.instanceId === this.component.eventSelection) {
      classes.push('fc-selected')
    }

    return classes
  }


  // Given an event and the default element used for rendering, returns the element that should actually be used.
  // Basically runs events and elements through the eventRender hook.
  filterEventRenderEl(eventRange: EventRenderRange, el) {

    let custom = this.view.publiclyTrigger('eventRender', [
      {
        event: new EventApi(
          this.view.calendar,
          eventRange.def,
          eventRange.instance
        ),
        el,
        view: this.view
      }
    ])

    if (custom === false) { // means don't render at all
      el = null
    } else if (custom && custom !== true) {
      el = custom
    }

    return el
  }


  // Compute the text that should be displayed on an event's element.
  // `range` can be the Event object itself, or something range-like, with at least a `start`.
  // If event times are disabled, or the event has no time, will return a blank string.
  // If not specified, formatter will default to the eventTimeFormat setting,
  // and displayEnd will default to the displayEventEnd setting.
  getTimeText(eventRange: EventRenderRange, formatter?, displayEnd?) {
    let { def, instance } = eventRange

    return this._getTimeText(
      instance.range.start,
      def.hasEnd ? instance.range.end : null,
      def.isAllDay,
      formatter,
      displayEnd,
      instance.forcedStartTzo,
      instance.forcedEndTzo
    )
  }


  _getTimeText(
    start: DateMarker,
    end: DateMarker,
    isAllDay,
    formatter?,
    displayEnd?,
    forcedStartTimeZoneOffset?: number,
    forcedEndTimeZoneOffset?: number
) {
    const dateEnv = this.view.calendar.dateEnv

    if (formatter == null) {
      formatter = this.eventTimeFormat
    }

    if (displayEnd == null) {
      displayEnd = this.displayEventEnd
    }

    if (this.displayEventTime && !isAllDay) {
      if (displayEnd && end) {
        return dateEnv.formatRange(start, end, formatter, {
          forcedStartTimeZoneOffset,
          forcedEndTimeZoneOffset
        })
      } else {
        return dateEnv.format(start, formatter, {
          forcedTzo: forcedStartTimeZoneOffset
        })
      }
    }

    return ''
  }


  computeEventTimeFormat(): any {
    return {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroTime: true
    }
  }


  computeDisplayEventTime() {
    return true
  }


  computeDisplayEventEnd() {
    return true
  }


  // Utility for generating event skin-related CSS properties
  getSkinCss(ui: EventUi) {
    return {
      'background-color': ui.backgroundColor,
      'border-color': ui.borderColor,
      color: ui.textColor
    }
  }


  sortEventSegs(segs): Seg[] {
    segs = segs.slice() // copy
    segs.sort(this.compareEventSegs.bind(this))
    return segs
  }


  // A cmp function for determining which segments should take visual priority
  compareEventSegs(seg1: Seg, seg2: Seg) {
    let eventDef1 = seg1.eventRange.def
    let eventDef2 = seg2.eventRange.def
    let r1 = seg1.eventRange.instance.range
    let r2 = seg2.eventRange.instance.range

    let eventApi1 = new EventApi(this.view.calendar, eventDef1)
    let eventApi2 = new EventApi(this.view.calendar, eventDef2)

    return r1.start.valueOf() - r2.start.valueOf() || // earlier events go first
      (r2.end.valueOf() - r2.start.valueOf()) - (r1.end.valueOf() - r1.start.valueOf()) || // tie? longer events go first
      Number(eventDef1.isAllDay) - Number(eventDef2.isAllDay) || // tie? put all-day events first
      compareByFieldSpecs(
        eventApi1,
        eventApi2,
        this.view.eventOrderSpecs,
        eventDef1.extendedProps,
        eventDef2.extendedProps
      )
  }


  computeFgSize() {
  }


  assignFgSize() {
  }

}

function setElSeg(el: HTMLElement, seg: Seg) {
  (el as any).fcSeg = seg
}

export function getElSeg(el: HTMLElement): Seg | null {
  return (el as any).fcSeg || null
}

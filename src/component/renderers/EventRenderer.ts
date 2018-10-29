import View from '../../View'
import { DateMarker } from '../../datelib/marker'
import { createFormatter, DateFormatter } from '../../datelib/formatting'
import { htmlToElements } from '../../util/dom-manip'
import { compareByFieldSpecs } from '../../util/misc'
import { EventRenderRange, EventUi, filterSegsViaEls } from '../event-rendering'
import { Seg } from '../DateComponent'
import { assignTo } from '../../util/object'


export default class EventRenderer {

  view: View
  component: any

  fgSegs: Seg[]

  // derived from options
  eventTimeFormat: DateFormatter
  displayEventTime: boolean
  displayEventEnd: boolean


  constructor(component) {
    this.view = component.view || component
    this.component = component
  }


  opt(name) {
    return this.view.opt(name)
  }


  // Updates values that rely on options and also relate to range
  rangeUpdated() {
    let displayEventTime
    let displayEventEnd

    this.eventTimeFormat = createFormatter(
      this.opt('eventTimeFormat') || this.computeEventTimeFormat(),
      this.opt('defaultRangeSeparator')
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


  renderSegs(fgSegs: Seg[]) {

    // render an `.el` on each seg
    // returns a subset of the segs. segs that were actually rendered
    fgSegs = this.renderFgSegEls(fgSegs, false)

    if (this.renderFgSegs(fgSegs) !== false) { // no failure?
      this.fgSegs = fgSegs
    }

    this.view.triggerRenderedSegs(this.fgSegs || [])
  }


  unrender() {
    this.unrenderFgSegs(this.fgSegs || [])
    this.fgSegs = null
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


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  renderFgSegEls(segs: Seg[], isMirrors: boolean) {
    let html = ''
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

        if (el) {
          seg.el = el
        }
      })

      segs = filterSegsViaEls(this.view, segs, isMirrors)
    }

    return segs
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

    return classes
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
      def.allDay,
      formatter,
      displayEnd,
      instance.forcedStartTzo,
      instance.forcedEndTzo
    )
  }


  _getTimeText(
    start: DateMarker,
    end: DateMarker,
    allDay,
    formatter?,
    displayEnd?,
    forcedStartTzo?: number,
    forcedEndTzo?: number
) {
    const dateEnv = this.view.calendar.dateEnv

    if (formatter == null) {
      formatter = this.eventTimeFormat
    }

    if (displayEnd == null) {
      displayEnd = this.displayEventEnd
    }

    if (this.displayEventTime && !allDay) {
      if (displayEnd && end) {
        return dateEnv.formatRange(start, end, formatter, {
          forcedStartTzo,
          forcedEndTzo
        })
      } else {
        return dateEnv.format(start, formatter, {
          forcedTzo: forcedStartTzo
        })
      }
    }

    return ''
  }


  computeEventTimeFormat(): any {
    return {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true
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
    let specs = this.view.eventOrderSpecs
    let objs = segs.map(buildSegCompareObj)

    objs.sort(function(obj0, obj1) {
      return compareByFieldSpecs(obj0, obj1, specs)
    })

    return objs.map(function(c) {
      return c._seg
    })
  }


  computeFgSizes() {
  }


  assignFgSizes() {
  }

}


// returns a object with all primitive props that can be compared
export function buildSegCompareObj(seg: Seg) {
  let eventDef = seg.eventRange.def
  let range = seg.eventRange.instance.range
  let start = range.start.valueOf()
  let end = range.end.valueOf()

  return assignTo(
    {},
    eventDef.extendedProps,
    eventDef,
    {
      id: eventDef.publicId,
      start,
      end,
      duration: end - start,
      allDay: Number(eventDef.allDay),
      _seg: seg // for later retrieval
    }
  )
}

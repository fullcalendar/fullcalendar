import View from '../../View'
import { DateMarker } from '../../datelib/marker'
import { createFormatter, DateFormatter } from '../../datelib/formatting'
import { htmlToElements } from '../../util/dom-manip'
import { compareByFieldSpecs } from '../../util/misc'
import { EventRenderRange, EventUi, hasBgRendering } from '../event-rendering'
import { Seg } from '../DateComponent'
import EventApi from '../../api/EventApi'
import { assignTo } from '../../util/object'


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
      this.computeEventTimeFormat(),
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

    this.view.triggerRenderedSegs(this.getSegs())
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
          el = this.filterEventRenderEl(seg, el)

          if (el) {
            setElSeg(el, seg)
            seg.el = el
          }

          return el
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
  renderFgSegEls(segs: Seg[], isMirrors?: boolean) {
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
          el = this.filterEventRenderEl(seg, el, isMirrors)
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
  filterEventRenderEl(seg: Seg, el: HTMLElement, isMirror: boolean = false) {

    let custom = this.view.publiclyTrigger('eventRender', [
      {
        event: new EventApi(
          this.view.calendar,
          seg.eventRange.def,
          seg.eventRange.instance,
        ),
        isMirror,
        isStart: seg.isStart,
        isEnd: seg.isEnd,
        // TODO: include seg.range once all components consistently generate it
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

    if (this.displayEventTime && !isAllDay) {
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


  sortEventSegs(segs, specs = this.view.eventOrderSpecs): Seg[] {
    let objs = segs.map(buildSegCompareObj)

    objs.sort(function(obj0, obj1) {
      return compareByFieldSpecs(obj0, obj1, specs)
    })

    return objs.map(function(c) {
      return c._seg
    })
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
      isAllDay: Number(eventDef.isAllDay),
      _seg: seg // for later retrieval
    }
  )
}

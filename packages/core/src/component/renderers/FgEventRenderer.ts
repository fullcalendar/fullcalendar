import { DateMarker } from '../../datelib/marker'
import { createFormatter, DateFormatter } from '../../datelib/formatting'
import { htmlToElements } from '../../util/dom-manip'
import { compareByFieldSpecs } from '../../util/misc'
import { EventUi } from '../event-ui'
import { EventRenderRange, filterSegsViaEls, triggerRenderedSegs, triggerWillRemoveSegs } from '../event-rendering'
import { Seg } from '../DateComponent'
import { ComponentContext } from '../Component'


export default abstract class FgEventRenderer {

  context: ComponentContext

  // derived from options
  eventTimeFormat: DateFormatter
  displayEventTime: boolean
  displayEventEnd: boolean

  segs: Seg[] = []
  isSizeDirty: boolean = false


  renderSegs(context: ComponentContext, segs: Seg[], mirrorInfo?) {
    this.context = context

    this.rangeUpdated() // called too frequently :(

    // render an `.el` on each seg
    // returns a subset of the segs. segs that were actually rendered
    segs = this.renderSegEls(segs, mirrorInfo)

    this.segs = segs
    this.attachSegs(segs, mirrorInfo)

    this.isSizeDirty = true
    triggerRenderedSegs(this.context, this.segs, Boolean(mirrorInfo))
  }


  unrender(context: ComponentContext, _segs: Seg[], mirrorInfo?) {
    triggerWillRemoveSegs(this.context, this.segs, Boolean(mirrorInfo))
    this.detachSegs(this.segs)
    this.segs = []
  }


  abstract renderSegHtml(seg: Seg, mirrorInfo): string
  abstract attachSegs(segs: Seg[], mirrorInfo)
  abstract detachSegs(segs: Seg[])


  // Updates values that rely on options and also relate to range
  rangeUpdated() {
    let { options } = this.context
    let displayEventTime
    let displayEventEnd

    this.eventTimeFormat = createFormatter(
      options.eventTimeFormat || this.computeEventTimeFormat(),
      options.defaultRangeSeparator
    )

    displayEventTime = options.displayEventTime
    if (displayEventTime == null) {
      displayEventTime = this.computeDisplayEventTime() // might be based off of range
    }

    displayEventEnd = options.displayEventEnd
    if (displayEventEnd == null) {
      displayEventEnd = this.computeDisplayEventEnd() // might be based off of range
    }

    this.displayEventTime = displayEventTime
    this.displayEventEnd = displayEventEnd
  }


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  renderSegEls(segs: Seg[], mirrorInfo) {
    let html = ''
    let i

    if (segs.length) { // don't build an empty html string

      // build a large concatenation of event segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.renderSegHtml(segs[i], mirrorInfo)
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
      htmlToElements(html).forEach((el, i) => {
        let seg = segs[i]

        if (el) {
          seg.el = el
        }
      })

      segs = filterSegsViaEls(this.context, segs, Boolean(mirrorInfo))
    }

    return segs
  }


  // Generic utility for generating the HTML classNames for an event segment's element
  getSegClasses(seg: Seg, isDraggable, isResizable, mirrorInfo) {
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

    if (mirrorInfo) {
      classes.push('fc-mirror')

      if (mirrorInfo.isDragging) {
        classes.push('fc-dragging')
      }

      if (mirrorInfo.isResizing) {
        classes.push('fc-resizing')
      }
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
    let { dateEnv } = this.context

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
    let specs = this.context.eventOrderSpecs
    let objs = segs.map(buildSegCompareObj)

    objs.sort(function(obj0, obj1) {
      return compareByFieldSpecs(obj0, obj1, specs)
    })

    return objs.map(function(c) {
      return c._seg
    })
  }


  computeSizes(force: boolean) {
    if (force || this.isSizeDirty) {
      this.computeSegSizes(this.segs)
    }
  }


  assignSizes(force: boolean) {
    if (force || this.isSizeDirty) {
      this.assignSegSizes(this.segs)
      this.isSizeDirty = false
    }
  }


  computeSegSizes(segs: Seg[]) {
  }


  assignSegSizes(segs: Seg[]) {
  }


  // Manipulation on rendered segs


  hideByHash(hash) {
    if (hash) {
      for (let seg of this.segs) {
        if (hash[seg.eventRange.instance.instanceId]) {
          seg.el.style.visibility = 'hidden'
        }
      }
    }
  }


  showByHash(hash) {
    if (hash) {
      for (let seg of this.segs) {
        if (hash[seg.eventRange.instance.instanceId]) {
          seg.el.style.visibility = ''
        }
      }
    }
  }


  selectByInstanceId(instanceId: string) {
    if (instanceId) {
      for (let seg of this.segs) {
        let eventInstance = seg.eventRange.instance
        if (
          eventInstance && eventInstance.instanceId === instanceId &&
          seg.el // necessary?
        ) {
          seg.el.classList.add('fc-selected')
        }
      }
    }
  }


  unselectByInstanceId(instanceId: string) {
    if (instanceId) {
      for (let seg of this.segs) {
        if (seg.el) { // necessary?
          seg.el.classList.remove('fc-selected')
        }
      }
    }
  }

}


// returns a object with all primitive props that can be compared
export function buildSegCompareObj(seg: Seg) {
  let eventDef = seg.eventRange.def
  let range = seg.eventRange.instance.range
  let start = range.start ? range.start.valueOf() : 0 // TODO: better support for open-range events
  let end = range.end ? range.end.valueOf() : 0 // "

  return {
    ...eventDef.extendedProps,
    ...eventDef,
    id: eventDef.publicId,
    start,
    end,
    duration: end - start,
    allDay: Number(eventDef.allDay),
    _seg: seg // for later retrieval
  }
}

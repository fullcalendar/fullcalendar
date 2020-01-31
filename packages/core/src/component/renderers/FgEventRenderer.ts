import { DateMarker } from '../../datelib/marker'
import { createFormatter, DateFormatter } from '../../datelib/formatting'
import { htmlToElements } from '../../util/dom-manip'
import { compareByFieldSpecs } from '../../util/misc'
import { EventUi } from '../event-ui'
import { EventRenderRange, filterSegsViaEls, triggerPositionedSegs, triggerWillRemoveSegs } from '../event-rendering'
import { Seg } from '../DateComponent'
import ComponentContext from '../ComponentContext'
import { memoize } from '../../util/memoize'
import { subrenderer, SubRenderer } from '../../vdom-util'


export interface BaseFgEventRendererProps {
  segs: Seg[]
  selectedInstanceId?: string
  hiddenInstances?: { [instanceId: string]: any }
  isDragging: boolean
  isResizing: boolean
  isSelecting: boolean
  interactingSeg?: any
}

export default abstract class FgEventRenderer<
  FgEventRendererProps extends BaseFgEventRendererProps = BaseFgEventRendererProps
> extends SubRenderer<FgEventRendererProps> {

  private updateComputedOptions = memoize(this._updateComputedOptions)
  private renderSegsPlain = subrenderer(this._renderSegsPlain, this._unrenderSegsPlain)
  private renderSelectedInstance = subrenderer(renderSelectedInstance, unrenderSelectedInstance)
  private renderHiddenInstances = subrenderer(renderHiddenInstances, unrenderHiddenInstances)

  // computed options
  protected eventTimeFormat: DateFormatter
  protected displayEventTime: boolean
  protected displayEventEnd: boolean


  renderSegs(props: BaseFgEventRendererProps) {
    this.updateComputedOptions(this.context.options)

    let { segs } = this.renderSegsPlain({
      segs: props.segs,
      isDragging: props.isDragging,
      isResizing: props.isResizing,
      isSelecting: props.isSelecting
    })

    this.renderSelectedInstance({
      segs,
      instanceId: props.selectedInstanceId
    })

    this.renderHiddenInstances({
      segs,
      hiddenInstances: props.hiddenInstances
    })

    return segs
  }


  private _updateComputedOptions(options: any) {
    let eventTimeFormat = createFormatter(
      options.eventTimeFormat || this.computeEventTimeFormat(),
      options.defaultRangeSeparator
    )

    let displayEventTime = options.displayEventTime
    if (displayEventTime == null) {
      displayEventTime = this.computeDisplayEventTime() // might be based off of range
    }

    let displayEventEnd = options.displayEventEnd
    if (displayEventEnd == null) {
      displayEventEnd = this.computeDisplayEventEnd() // might be based off of range
    }

    this.eventTimeFormat = eventTimeFormat
    this.displayEventTime = displayEventTime
    this.displayEventEnd = displayEventEnd
  }


  // doesn't worry about selection/hidden state
  _renderSegsPlain(
    { segs, isDragging, isResizing, isSelecting } : { segs: Seg[], isDragging: boolean, isResizing: boolean, isSelecting: boolean },
    context: ComponentContext
  ) {
    segs = this.renderSegEls(segs, isDragging, isResizing, isSelecting) // returns a subset!

    let isMirror = isDragging || isResizing || isSelecting
    triggerPositionedSegs(context, segs, isMirror)

    return { segs, isMirror }
  }


  _unrenderSegsPlain({ segs, isMirror }: { segs: Seg[], isMirror: boolean }, context: ComponentContext) {
    triggerWillRemoveSegs(context, segs, isMirror)
  }


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  renderSegEls(segs: Seg[], isDragging: boolean, isResizing: boolean, isSelecting: boolean) {
    let html = ''
    let i

    if (segs.length) { // don't build an empty html string

      // build a large concatenation of event segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.renderSegHtml(segs[i], isDragging, isResizing, isSelecting)
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
      htmlToElements(html).forEach((el, i) => {
        let seg = segs[i]

        if (el) {
          seg.el = el
        }
      })

      segs = filterSegsViaEls(this.context, segs, isDragging || isResizing || isSelecting)
    }

    return segs
  }


  abstract renderSegHtml(seg: Seg, isDragging: boolean, isResizing: boolean, isSelecting: boolean): string


  // Generic utility for generating the HTML classNames for an event segment's element
  // TODO: move to outside func
  getSegClasses(seg: Seg, isDraggable, isResizable, isDragging: boolean, isResizing: boolean, isSelecting: boolean) {
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

    if (isDragging || isResizing || isSelecting) {
      classes.push('fc-mirror')

      if (isDragging) {
        classes.push('fc-dragging')
      }

      if (isResizing) {
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
  // TODO: move to outside func
  getSkinCss(ui: EventUi) {
    return {
      'background-color': ui.backgroundColor,
      'border-color': ui.borderColor,
      color: ui.textColor
    }
  }

}


// Manipulation on rendered segs
// ----------------------------------------------------------------------------------------------------
// TODO: slow. use more hashes to quickly reference relevant elements


function renderHiddenInstances(props: { segs: Seg[], hiddenInstances: { [instanceId: string]: any } }) {
  let { segs, hiddenInstances } = props

  if (hiddenInstances) {
    for (let seg of segs) {
      if (hiddenInstances[seg.eventRange.instance.instanceId]) {
        seg.el.style.visibility = 'hidden'
      }
    }
  }

  return props
}


function unrenderHiddenInstances({ segs, hiddenInstances }: { segs: Seg[], hiddenInstances: { [instanceId: string]: any } }) {
  if (hiddenInstances) {
    for (let seg of segs) {
      if (hiddenInstances[seg.eventRange.instance.instanceId]) {
        seg.el.style.visibility = ''
      }
    }
  }
}


function renderSelectedInstance(props: { segs: Seg[], instanceId: string }) {
  let { segs, instanceId } = props

  if (instanceId) {
    for (let seg of segs) {
      let eventInstance = seg.eventRange.instance
      if (
        eventInstance && eventInstance.instanceId === instanceId &&
        seg.el // necessary?
      ) {
        seg.el.classList.add('fc-selected')
      }
    }
  }

  return props
}


function unrenderSelectedInstance({ segs, instanceId }: { segs: Seg[], instanceId: string }) {
  if (instanceId) {
    for (let seg of segs) {
      if (seg.el) { // necessary?
        seg.el.classList.remove('fc-selected')
      }
    }
  }
}


export function sortEventSegs(segs, eventOrderSpecs): Seg[] {
  let objs = segs.map(buildSegCompareObj)

  objs.sort(function(obj0, obj1) {
    return compareByFieldSpecs(obj0, obj1, eventOrderSpecs)
  })

  return objs.map(function(c) {
    return c._seg
  })
}


// returns a object with all primitive props that can be compared
export function buildSegCompareObj(seg: Seg) {
  let { eventRange } = seg
  let eventDef = eventRange.def
  let range = eventRange.instance ? eventRange.instance.range : eventRange.range
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

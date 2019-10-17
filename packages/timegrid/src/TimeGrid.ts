import {
  htmlEscape,
  htmlToElement,
  findElements,
  removeElement,
  applyStyle,
  createElement,
  PositionCache,
  Duration,
  createDuration,
  addDurations,
  multiplyDuration,
  wholeDivideDurations,
  asRoughMs,
  startOfDay,
  DateMarker,
  DateFormatter,
  createFormatter,
  formatIsoTimeString,
  ComponentContext,
  DateComponent,
  Seg,
  EventSegUiInteractionState,
  DateProfile,
  memoizeRendering,
  MemoizedRendering,
  Theme,
  memoize
} from '@fullcalendar/core'
import { DayBgRow } from '@fullcalendar/daygrid'
import TimeGridEventRenderer from './TimeGridEventRenderer'
import TimeGridMirrorRenderer from './TimeGridMirrorRenderer'
import TimeGridFillRenderer from './TimeGridFillRenderer'


/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

// potential nice values for the slot-duration and interval-duration
// from largest to smallest
const AGENDA_STOCK_SUB_DURATIONS = [
  { hours: 1 },
  { minutes: 30 },
  { minutes: 15 },
  { seconds: 30 },
  { seconds: 15 }
]

export interface RenderProps {
  renderBgIntroHtml: () => string
  renderIntroHtml: () => string
}

export interface TimeGridSeg extends Seg {
  col: number
  start: DateMarker
  end: DateMarker
}

export interface TimeGridCell {
  date: DateMarker
  htmlAttrs?: string
}

export interface TimeGridProps {
  dateProfile: DateProfile
  cells: TimeGridCell[]
  businessHourSegs: TimeGridSeg[]
  bgEventSegs: TimeGridSeg[]
  fgEventSegs: TimeGridSeg[]
  dateSelectionSegs: TimeGridSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
}

export default class TimeGrid extends DateComponent<TimeGridProps> {

  renderProps: RenderProps

  slotDuration: Duration // duration of a "slot", a distinct time segment on given day, visualized by lines
  snapDuration: Duration // granularity of time for dragging and selecting
  snapsPerSlot: any
  labelFormat: DateFormatter // formatting string for times running along vertical axis
  labelInterval: Duration // duration of how often a label should be displayed for a slot

  colCnt: number
  colEls: HTMLElement[] // cells elements in the day-row background
  slatContainerEl: HTMLElement // div that wraps all the slat rows
  slatEls: HTMLElement[] // elements running horizontally across all columns
  nowIndicatorEls: HTMLElement[]

  colPositions: PositionCache
  slatPositions: PositionCache
  isSlatSizesDirty: boolean = false
  isColSizesDirty: boolean = false

  rootBgContainerEl: HTMLElement
  bottomRuleEl: HTMLElement // hidden by default
  contentSkeletonEl: HTMLElement
  colContainerEls: HTMLElement[] // containers for each column

  // inner-containers for each column where different types of segs live
  fgContainerEls: HTMLElement[]
  bgContainerEls: HTMLElement[]
  mirrorContainerEls: HTMLElement[]
  highlightContainerEls: HTMLElement[]
  businessContainerEls: HTMLElement[]

  private processOptions = memoize(this._processOptions)
  private renderSkeleton = memoizeRendering(this._renderSkeleton)
  private renderSlats = memoizeRendering(this._renderSlats, null, [ this.renderSkeleton ])
  private renderColumns = memoizeRendering(this._renderColumns, this._unrenderColumns, [ this.renderSkeleton ])
  private renderBusinessHours: MemoizedRendering<[ComponentContext, TimeGridSeg[]]>
  private renderDateSelection: MemoizedRendering<[TimeGridSeg[]]>
  private renderBgEvents: MemoizedRendering<[ComponentContext, TimeGridSeg[]]>
  private renderFgEvents: MemoizedRendering<[ComponentContext, TimeGridSeg[]]>
  private renderEventSelection: MemoizedRendering<[string]>
  private renderEventDrag: MemoizedRendering<[EventSegUiInteractionState]>
  private renderEventResize: MemoizedRendering<[EventSegUiInteractionState]>


  constructor(el: HTMLElement, renderProps: RenderProps) {
    super(el)

    this.renderProps = renderProps

    let { renderColumns } = this
    let eventRenderer = this.eventRenderer = new TimeGridEventRenderer(this)
    let fillRenderer = this.fillRenderer = new TimeGridFillRenderer(this)
    this.mirrorRenderer = new TimeGridMirrorRenderer(this)

    this.renderBusinessHours = memoizeRendering(
      fillRenderer.renderSegs.bind(fillRenderer, 'businessHours'),
      fillRenderer.unrender.bind(fillRenderer, 'businessHours'),
      [ renderColumns ]
    )

    this.renderDateSelection = memoizeRendering(
      this._renderDateSelection,
      this._unrenderDateSelection,
      [ renderColumns ]
    )

    this.renderFgEvents = memoizeRendering(
      eventRenderer.renderSegs.bind(eventRenderer),
      eventRenderer.unrender.bind(eventRenderer),
      [ renderColumns ]
    )

    this.renderBgEvents = memoizeRendering(
      fillRenderer.renderSegs.bind(fillRenderer, 'bgEvent'),
      fillRenderer.unrender.bind(fillRenderer, 'bgEvent'),
      [ renderColumns ]
    )

    this.renderEventSelection = memoizeRendering(
      eventRenderer.selectByInstanceId.bind(eventRenderer),
      eventRenderer.unselectByInstanceId.bind(eventRenderer),
      [ this.renderFgEvents ]
    )

    this.renderEventDrag = memoizeRendering(
      this._renderEventDrag,
      this._unrenderEventDrag,
      [ renderColumns ]
    )

    this.renderEventResize = memoizeRendering(
      this._renderEventResize,
      this._unrenderEventResize,
      [ renderColumns ]
    )
  }


  /* Options
  ------------------------------------------------------------------------------------------------------------------*/


  // Parses various options into properties of this object
  // MUST have context already set
  _processOptions(options) {
    let { slotDuration, snapDuration } = options
    let snapsPerSlot
    let input

    slotDuration = createDuration(slotDuration)
    snapDuration = snapDuration ? createDuration(snapDuration) : slotDuration
    snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration)

    if (snapsPerSlot === null) {
      snapDuration = slotDuration
      snapsPerSlot = 1
      // TODO: say warning?
    }

    this.slotDuration = slotDuration
    this.snapDuration = snapDuration
    this.snapsPerSlot = snapsPerSlot

    // might be an array value (for TimelineView).
    // if so, getting the most granular entry (the last one probably).
    input = options.slotLabelFormat
    if (Array.isArray(input)) {
      input = input[input.length - 1]
    }

    this.labelFormat = createFormatter(input || {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true,
      meridiem: 'short'
    })

    input = options.slotLabelInterval
    this.labelInterval = input ?
      createDuration(input) :
      this.computeLabelInterval(slotDuration)
  }


  // Computes an automatic value for slotLabelInterval
  computeLabelInterval(slotDuration) {
    let i
    let labelInterval
    let slotsPerLabel

    // find the smallest stock label interval that results in more than one slots-per-label
    for (i = AGENDA_STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
      labelInterval = createDuration(AGENDA_STOCK_SUB_DURATIONS[i])
      slotsPerLabel = wholeDivideDurations(labelInterval, slotDuration)
      if (slotsPerLabel !== null && slotsPerLabel > 1) {
        return labelInterval
      }
    }

    return slotDuration // fall back
  }


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  render(props: TimeGridProps, context: ComponentContext) {
    this.processOptions(context.options)

    let cells = props.cells
    this.colCnt = cells.length

    this.renderSkeleton(context.theme)
    this.renderSlats(props.dateProfile)
    this.renderColumns(props.cells, props.dateProfile)
    this.renderBusinessHours(context, props.businessHourSegs)
    this.renderDateSelection(props.dateSelectionSegs)
    this.renderFgEvents(context, props.fgEventSegs)
    this.renderBgEvents(context, props.bgEventSegs)
    this.renderEventSelection(props.eventSelection)
    this.renderEventDrag(props.eventDrag)
    this.renderEventResize(props.eventResize)
  }


  destroy() {
    super.destroy()

    // should unrender everything else too
    this.renderSlats.unrender()
    this.renderColumns.unrender()
    this.renderSkeleton.unrender()
  }


  updateSize(isResize: boolean) {
    let { fillRenderer, eventRenderer, mirrorRenderer } = this

    if (isResize || this.isSlatSizesDirty) {
      this.buildSlatPositions()
      this.isSlatSizesDirty = false
    }

    if (isResize || this.isColSizesDirty) {
      this.buildColPositions()
      this.isColSizesDirty = false
    }

    fillRenderer.computeSizes(isResize)
    eventRenderer.computeSizes(isResize)
    mirrorRenderer.computeSizes(isResize)

    fillRenderer.assignSizes(isResize)
    eventRenderer.assignSizes(isResize)
    mirrorRenderer.assignSizes(isResize)
  }


  _renderSkeleton(theme: Theme) {
    let { el } = this

    el.innerHTML =
      '<div class="fc-bg"></div>' +
      '<div class="fc-slats"></div>' +
      '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" style="display:none" />'

    this.rootBgContainerEl = el.querySelector('.fc-bg')
    this.slatContainerEl = el.querySelector('.fc-slats')
    this.bottomRuleEl = el.querySelector('.fc-divider')
  }


  _renderSlats(dateProfile: DateProfile) {
    let { theme } = this.context

    this.slatContainerEl.innerHTML =
      '<table class="' + theme.getClass('tableGrid') + '">' +
        this.renderSlatRowHtml(dateProfile) +
      '</table>'

    this.slatEls = findElements(this.slatContainerEl, 'tr')

    this.slatPositions = new PositionCache(
      this.el,
      this.slatEls,
      false,
      true // vertical
    )

    this.isSlatSizesDirty = true
  }


  // Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
  renderSlatRowHtml(dateProfile: DateProfile) {
    let { dateEnv, theme, isRtl } = this.context
    let html = ''
    let dayStart = startOfDay(dateProfile.renderRange.start)
    let slotTime = dateProfile.minTime
    let slotIterator = createDuration(0)
    let slotDate // will be on the view's first day, but we only care about its time
    let isLabeled
    let axisHtml

    // Calculate the time for each slot
    while (asRoughMs(slotTime) < asRoughMs(dateProfile.maxTime)) {
      slotDate = dateEnv.add(dayStart, slotTime)
      isLabeled = wholeDivideDurations(slotIterator, this.labelInterval) !== null

      axisHtml =
        '<td class="fc-axis fc-time ' + theme.getClass('widgetContent') + '">' +
          (isLabeled ?
            '<span>' + // for matchCellWidths
              htmlEscape(dateEnv.format(slotDate, this.labelFormat)) +
            '</span>' :
            ''
            ) +
        '</td>'

      html +=
        '<tr data-time="' + formatIsoTimeString(slotDate) + '"' +
          (isLabeled ? '' : ' class="fc-minor"') +
          '>' +
          (!isRtl ? axisHtml : '') +
          '<td class="' + theme.getClass('widgetContent') + '"></td>' +
          (isRtl ? axisHtml : '') +
        '</tr>'

      slotTime = addDurations(slotTime, this.slotDuration)
      slotIterator = addDurations(slotIterator, this.slotDuration)
    }

    return html
  }


  _renderColumns(cells: TimeGridCell[], dateProfile: DateProfile) {
    let { calendar, view, isRtl, theme, dateEnv } = this.context

    let bgRow = new DayBgRow(this.context)
    this.rootBgContainerEl.innerHTML =
      '<table class="' + theme.getClass('tableGrid') + '">' +
        bgRow.renderHtml({
          cells,
          dateProfile,
          renderIntroHtml: this.renderProps.renderBgIntroHtml
        }) +
      '</table>'

    this.colEls = findElements(this.el, '.fc-day, .fc-disabled-day')

    for (let col = 0; col < this.colCnt; col++) {
      calendar.publiclyTrigger('dayRender', [
        {
          date: dateEnv.toDate(cells[col].date),
          el: this.colEls[col],
          view
        }
      ])
    }

    if (isRtl) {
      this.colEls.reverse()
    }

    this.colPositions = new PositionCache(
      this.el,
      this.colEls,
      true, // horizontal
      false
    )

    this.renderContentSkeleton()
    this.isColSizesDirty = true
  }


  _unrenderColumns() {
    this.unrenderContentSkeleton()
  }


  /* Content Skeleton
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders the DOM that the view's content will live in
  renderContentSkeleton() {
    let { isRtl } = this.context
    let parts = []
    let skeletonEl: HTMLElement

    parts.push(
      this.renderProps.renderIntroHtml()
    )

    for (let i = 0; i < this.colCnt; i++) {
      parts.push(
        '<td>' +
          '<div class="fc-content-col">' +
            '<div class="fc-event-container fc-mirror-container"></div>' +
            '<div class="fc-event-container"></div>' +
            '<div class="fc-highlight-container"></div>' +
            '<div class="fc-bgevent-container"></div>' +
            '<div class="fc-business-container"></div>' +
          '</div>' +
        '</td>'
      )
    }

    if (isRtl) {
      parts.reverse()
    }

    skeletonEl = this.contentSkeletonEl = htmlToElement(
      '<div class="fc-content-skeleton">' +
        '<table>' +
          '<tr>' + parts.join('') + '</tr>' +
        '</table>' +
      '</div>'
    )

    this.colContainerEls = findElements(skeletonEl, '.fc-content-col')
    this.mirrorContainerEls = findElements(skeletonEl, '.fc-mirror-container')
    this.fgContainerEls = findElements(skeletonEl, '.fc-event-container:not(.fc-mirror-container)')
    this.bgContainerEls = findElements(skeletonEl, '.fc-bgevent-container')
    this.highlightContainerEls = findElements(skeletonEl, '.fc-highlight-container')
    this.businessContainerEls = findElements(skeletonEl, '.fc-business-container')

    if (isRtl) {
      this.colContainerEls.reverse()
      this.mirrorContainerEls.reverse()
      this.fgContainerEls.reverse()
      this.bgContainerEls.reverse()
      this.highlightContainerEls.reverse()
      this.businessContainerEls.reverse()
    }

    this.el.appendChild(skeletonEl)
  }


  unrenderContentSkeleton() {
    removeElement(this.contentSkeletonEl)
  }


  // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
  groupSegsByCol(segs) {
    let segsByCol = []
    let i

    for (i = 0; i < this.colCnt; i++) {
      segsByCol.push([])
    }

    for (i = 0; i < segs.length; i++) {
      segsByCol[segs[i].col].push(segs[i])
    }

    return segsByCol
  }


  // Given segments grouped by column, insert the segments' elements into a parallel array of container
  // elements, each living within a column.
  attachSegsByCol(segsByCol, containerEls: HTMLElement[]) {
    let col
    let segs
    let i

    for (col = 0; col < this.colCnt; col++) { // iterate each column grouping
      segs = segsByCol[col]

      for (i = 0; i < segs.length; i++) {
        containerEls[col].appendChild(segs[i].el)
      }
    }
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return 'minute' // will refresh on the minute
  }


  renderNowIndicator(segs: TimeGridSeg[], date) {

    // HACK: if date columns not ready for some reason (scheduler)
    if (!this.colContainerEls) {
      return
    }

    let top = this.computeDateTop(date)
    let nodes = []
    let i

    // render lines within the columns
    for (i = 0; i < segs.length; i++) {
      let lineEl = createElement('div', { className: 'fc-now-indicator fc-now-indicator-line' })
      lineEl.style.top = top + 'px'
      this.colContainerEls[segs[i].col].appendChild(lineEl)
      nodes.push(lineEl)
    }

    // render an arrow over the axis
    if (segs.length > 0) { // is the current time in view?
      let arrowEl = createElement('div', { className: 'fc-now-indicator fc-now-indicator-arrow' })
      arrowEl.style.top = top + 'px'
      this.contentSkeletonEl.appendChild(arrowEl)
      nodes.push(arrowEl)
    }

    this.nowIndicatorEls = nodes
  }


  unrenderNowIndicator() {
    if (this.nowIndicatorEls) {
      this.nowIndicatorEls.forEach(removeElement)
      this.nowIndicatorEls = null
    }
  }


  /* Coordinates
  ------------------------------------------------------------------------------------------------------------------*/


  getTotalSlatHeight() {
    return this.slatContainerEl.getBoundingClientRect().height
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop(when: DateMarker, startOfDayDate?: DateMarker) {
    if (!startOfDayDate) {
      startOfDayDate = startOfDay(when)
    }
    return this.computeTimeTop(createDuration(when.valueOf() - startOfDayDate.valueOf()))
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  computeTimeTop(duration: Duration) {
    let len = this.slatEls.length
    let dateProfile = this.props.dateProfile
    let slatCoverage = (duration.milliseconds - asRoughMs(dateProfile.minTime)) / asRoughMs(this.slotDuration) // floating-point value of # of slots covered
    let slatIndex
    let slatRemainder

    // compute a floating-point number for how many slats should be progressed through.
    // from 0 to number of slats (inclusive)
    // constrained because minTime/maxTime might be customized.
    slatCoverage = Math.max(0, slatCoverage)
    slatCoverage = Math.min(len, slatCoverage)

    // an integer index of the furthest whole slat
    // from 0 to number slats (*exclusive*, so len-1)
    slatIndex = Math.floor(slatCoverage)
    slatIndex = Math.min(slatIndex, len - 1)

    // how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
    // could be 1.0 if slatCoverage is covering *all* the slots
    slatRemainder = slatCoverage - slatIndex

    return this.slatPositions.tops[slatIndex] +
      this.slatPositions.getHeight(slatIndex) * slatRemainder
  }


  // For each segment in an array, computes and assigns its top and bottom properties
  computeSegVerticals(segs) {
    let { options } = this.context
    let eventMinHeight = options.timeGridEventMinHeight
    let i
    let seg
    let dayDate

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      dayDate = this.props.cells[seg.col].date

      seg.top = this.computeDateTop(seg.start, dayDate)
      seg.bottom = Math.max(
        seg.top + eventMinHeight,
        this.computeDateTop(seg.end, dayDate)
      )
    }
  }


  // Given segments that already have their top/bottom properties computed, applies those values to
  // the segments' elements.
  assignSegVerticals(segs) {
    let i
    let seg

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      applyStyle(seg.el, this.generateSegVerticalCss(seg))
    }
  }


  // Generates an object with CSS properties for the top/bottom coordinates of a segment element
  generateSegVerticalCss(seg) {
    return {
      top: seg.top,
      bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
    }
  }


  /* Sizing
  ------------------------------------------------------------------------------------------------------------------*/


  buildPositionCaches() {
    this.buildColPositions()
    this.buildSlatPositions()
  }


  buildColPositions() {
    this.colPositions.build()
  }


  buildSlatPositions() {
    this.slatPositions.build()
  }


  /* Hit System
  ------------------------------------------------------------------------------------------------------------------*/

  positionToHit(positionLeft, positionTop) {
    let { dateEnv } = this.context
    let { snapsPerSlot, slatPositions, colPositions } = this

    let colIndex = colPositions.leftToIndex(positionLeft)
    let slatIndex = slatPositions.topToIndex(positionTop)

    if (colIndex != null && slatIndex != null) {
      let slatTop = slatPositions.tops[slatIndex]
      let slatHeight = slatPositions.getHeight(slatIndex)
      let partial = (positionTop - slatTop) / slatHeight // floating point number between 0 and 1
      let localSnapIndex = Math.floor(partial * snapsPerSlot) // the snap # relative to start of slat
      let snapIndex = slatIndex * snapsPerSlot + localSnapIndex

      let dayDate = this.props.cells[colIndex].date
      let time = addDurations(
        this.props.dateProfile.minTime,
        multiplyDuration(this.snapDuration, snapIndex)
      )

      let start = dateEnv.add(dayDate, time)
      let end = dateEnv.add(start, this.snapDuration)

      return {
        col: colIndex,
        dateSpan: {
          range: { start, end },
          allDay: false
        },
        dayEl: this.colEls[colIndex],
        relativeRect: {
          left: colPositions.lefts[colIndex],
          right: colPositions.rights[colIndex],
          top: slatTop,
          bottom: slatTop + slatHeight
        }
      }
    }
  }


  /* Event Drag Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  _renderEventDrag(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedInstances)

      if (state.isEvent) {
        this.mirrorRenderer.renderSegs(this.context, state.segs, { isDragging: true, sourceSeg: state.sourceSeg })
      } else {
        this.fillRenderer.renderSegs('highlight', this.context, state.segs)
      }
    }
  }


  _unrenderEventDrag(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedInstances)

      if (state.isEvent) {
        this.mirrorRenderer.unrender(this.context, state.segs, { isDragging: true, sourceSeg: state.sourceSeg })
      } else {
        this.fillRenderer.unrender('highlight', this.context)
      }
    }
  }


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  _renderEventResize(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedInstances)
      this.mirrorRenderer.renderSegs(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg })
    }
  }


  _unrenderEventResize(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedInstances)
      this.mirrorRenderer.unrender(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg })
    }
  }


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
  _renderDateSelection(segs: Seg[]) {
    if (segs) {
      if (this.context.options.selectMirror) {
        this.mirrorRenderer.renderSegs(this.context, segs, { isSelecting: true })
      } else {
        this.fillRenderer.renderSegs('highlight', this.context, segs)
      }
    }
  }


  _unrenderDateSelection(segs: Seg[]) {
    if (segs) {
      if (this.context.options.selectMirror) {
        this.mirrorRenderer.unrender(this.context, segs, { isSelecting: true })
      } else {
        this.fillRenderer.unrender('highlight', this.context)
      }
    }
  }

}

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
  Component,
  Seg,
  EventSegUiInteractionState,
  DateProfile,
  sortEventSegs,
  memoize,
  renderer
} from '@fullcalendar/core'
import { renderDayBgRowHtml } from '@fullcalendar/daygrid'
import TimeColsEvents from './TimeColsEvents'
import TimeColsMirrorEvents from './TimeColsMirrorEvents'
import TimeColsFills from './TimeColsFills'


/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

// potential nice values for the slot-duration and interval-duration
// from largest to smallest
const STOCK_SUB_DURATIONS = [
  { hours: 1 },
  { minutes: 30 },
  { minutes: 15 },
  { seconds: 30 },
  { seconds: 15 }
]

export interface TimeColsRenderProps {
  renderBgIntroHtml: () => string
  renderIntroHtml: () => string
}

export interface TimeColsSeg extends Seg {
  col: number
  start: DateMarker
  end: DateMarker
}

export interface TimeColsCell {
  date: DateMarker
  htmlAttrs?: string
}

export interface TimeColsProps {
  renderProps: TimeColsRenderProps
  dateProfile: DateProfile
  cells: TimeColsCell[]
  businessHourSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  fgEventSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
}

export default class TimeCols extends Component<TimeColsProps, ComponentContext> {

  processOptions = memoize(this._processOptions)
  renderSkeleton = renderer(renderSkeleton)
  renderSlats = renderer(this._renderSlats)
  renderBgColumns = renderer(this._renderBgColumns)
  renderContentSkeleton = renderer(renderContentSkeleton)
  renderMirrorEvents = renderer(TimeColsMirrorEvents)
  renderFgEvents = renderer(TimeColsEvents)
  renderBgEvents = renderer(TimeColsFills)
  renderBusinessHours = renderer(TimeColsFills)
  renderDateSelection = renderer(TimeColsFills)

  // computed options
  slotDuration: Duration // duration of a "slot", a distinct time segment on given day, visualized by lines
  snapDuration: Duration // granularity of time for dragging and selecting
  snapsPerSlot: any
  labelFormat: DateFormatter // formatting string for times running along vertical axis
  labelInterval: Duration // duration of how often a label should be displayed for a slot

  colEls: HTMLElement[] // cells elements in the day-row background
  slatContainerEl: HTMLElement // div that wraps all the slat rows
  slatEls: HTMLElement[] // elements running horizontally across all columns
  nowIndicatorEls: HTMLElement[]

  colPositions: PositionCache
  slatPositions: PositionCache
  isSlatSizesDirty: boolean = false
  isColSizesDirty: boolean = false

  bottomRuleEl: HTMLElement // hidden by default. controlled by parent components!?
  contentSkeletonEl: HTMLElement
  colContainerEls: HTMLElement[] // containers for each column

  segRenderers: (TimeColsEvents | TimeColsFills | null)[]


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
      computeLabelInterval(slotDuration)
  }


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  render(props: TimeColsProps, context: ComponentContext) {
    let { options } = context
    this.processOptions(options)

    let {
      rootEl,
      rootBgContainerEl,
      contentSkeletonEl,
      bottomRuleEl,
      slatContainerEl
    } = this.renderSkeleton({})

    this.renderBgColumns({
      parentEl: rootBgContainerEl,
      rootEl,
      cells: props.cells,
      dateProfile: props.dateProfile,
      renderProps: props.renderProps
    })

    this.renderSlats({
      parentEl: slatContainerEl,
      rootEl,
      dateProfile: props.dateProfile
    })

    let {
      colContainerEls,
      businessContainerEls,
      bgContainerEls,
      fgContainerEls,
      highlightContainerEls,
      mirrorContainerEls
    } = this.renderContentSkeleton({
      parentEl: contentSkeletonEl,
      colCnt: props.cells.length,
      renderProps: props.renderProps
    })

    let segRenderers = [
      this.renderBusinessHours({
        type: 'businessHours',
        containerEls: businessContainerEls,
        segs: props.businessHourSegs,
      }),

      this.renderDateSelection({
        type: 'highlight',
        containerEls: highlightContainerEls,
        segs: options.selectMirror ? null : props.dateSelectionSegs // do highlight if NO mirror
      }),

      this.renderBgEvents({
        type: 'bgEvent',
        containerEls: bgContainerEls,
        segs: props.bgEventSegs
      }),

      this.renderFgEvents({
        containerEls: fgContainerEls,
        segs: props.fgEventSegs,
        selectedInstanceId: props.eventSelection,
        hiddenInstances: // TODO: more convenient
          (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
          (props.eventResize ? props.eventResize.affectedInstances : null)
      }),

      this.handleMirror(props, mirrorContainerEls, options)
    ]

    this.segRenderers = segRenderers
    this.contentSkeletonEl = contentSkeletonEl
    this.bottomRuleEl = bottomRuleEl
    this.colContainerEls = colContainerEls

    return rootEl
  }


  handleMirror(props: TimeColsProps, mirrorContainerEls: HTMLElement[], options): TimeColsEvents | null {

    if (props.eventDrag) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventDrag.segs,
        mirrorInfo: { isDragging: true, sourceSeg: props.eventDrag.sourceSeg }
      })

    } else if (props.eventResize) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.eventResize.segs,
        mirrorInfo: { isDragging: true, sourceSeg: props.eventResize.sourceSeg }
      })

    } else if (options.selectMirror) {
      return this.renderMirrorEvents({
        containerEls: mirrorContainerEls,
        segs: props.dateSelectionSegs,
        mirrorInfo: { isSelecting: true }
      })

    } else {
      return this.renderMirrorEvents(false)
    }
  }


  updateSize(isResize: boolean) {
    let { segRenderers } = this

    if (isResize || this.isSlatSizesDirty) {
      this.buildSlatPositions()
      this.isSlatSizesDirty = false
    }

    if (isResize || this.isColSizesDirty) {
      this.buildColPositions()
      this.isColSizesDirty = false
    }

    for (let segRenderer of segRenderers) {
      if (segRenderer) {
        segRenderer.computeSizes(isResize, this)
      }
    }

    for (let segRenderer of segRenderers) {
      if (segRenderer) {
        segRenderer.assignSizes(isResize, this)
      }
    }
  }


  _renderSlats(
    { rootEl, dateProfile }: { rootEl: HTMLElement, dateProfile: DateProfile },
    context: ComponentContext
  ) {
    let tableEl = createElement(
      'table',
      { className: context.theme.getClass('tableGrid') },
      this.renderSlatRowHtml(dateProfile)
    )

    let slatEls = this.slatEls = findElements(tableEl, 'tr')

    this.slatPositions = new PositionCache(
      rootEl,
      slatEls,
      false,
      true // vertical
    )
    this.isSlatSizesDirty = true

    return [ tableEl ]
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


  // goes behind the slats
  _renderBgColumns(
    { rootEl, cells, dateProfile, renderProps }: { rootEl: HTMLElement, cells: TimeColsCell[], dateProfile: DateProfile, renderProps: any },
    context: ComponentContext
  ) {
    let { calendar, view, isRtl, theme, dateEnv } = context

    let tableEl = createElement(
      'table',
      { className: theme.getClass('tableGrid') },
      renderDayBgRowHtml({
        cells,
        dateProfile,
        renderIntroHtml: renderProps.renderBgIntroHtml
      }, context)
    )

    let colEls = this.colEls = findElements(tableEl, '.fc-day, .fc-disabled-day')

    for (let col = 0; col < cells.length; col++) {
      calendar.publiclyTrigger('dayRender', [
        {
          date: dateEnv.toDate(cells[col].date),
          el: colEls[col],
          view
        }
      ])
    }

    if (isRtl) {
      this.colEls.reverse()
    }

    this.colPositions = new PositionCache(
      rootEl,
      colEls,
      true, // horizontal
      false
    )
    this.isColSizesDirty = true

    return [ tableEl ]
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return 'minute' // will refresh on the minute
  }


  renderNowIndicator(segs: TimeColsSeg[], date) {

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
  computeSegVerticals(segs: Seg[]) {
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

}


// Computes an automatic value for slotLabelInterval
function computeLabelInterval(slotDuration) {
  let i
  let labelInterval
  let slotsPerLabel

  // find the smallest stock label interval that results in more than one slots-per-label
  for (i = STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
    labelInterval = createDuration(STOCK_SUB_DURATIONS[i])
    slotsPerLabel = wholeDivideDurations(labelInterval, slotDuration)
    if (slotsPerLabel !== null && slotsPerLabel > 1) {
      return labelInterval
    }
  }

  return slotDuration // fall back
}


function renderSkeleton(props: {}, context: ComponentContext) {
  let rootEl = createElement(
    'div',
    { className: 'fc-time-grid' },
    '<div class="fc-bg"></div>' +
    '<div class="fc-slats"></div>' +
    '<div class="fc-content-skeleton">' +
    '<hr class="fc-divider ' + context.theme.getClass('widgetHeader') + '" style="display:none" />'
  )

  return {
    rootEl,
    rootBgContainerEl: rootEl.querySelector('.fc-bg') as HTMLElement,
    slatContainerEl: rootEl.querySelector('.fc-slats') as HTMLElement,
    contentSkeletonEl: rootEl.querySelector('.fc-content-skeleton') as HTMLElement,
    bottomRuleEl: rootEl.querySelector('.fc-divider') as HTMLElement
  }
}


// Renders the DOM that the view's content will live in
// goes in front of the slats
function renderContentSkeleton({ colCnt, renderProps }: { colCnt: number, renderProps: any  }, context: ComponentContext) {
  let { isRtl } = context
  let parts = []

  parts.push(
    renderProps.renderIntroHtml()
  )

  for (let i = 0; i < colCnt; i++) {
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

  let tableEl = htmlToElement(
    '<div class="fc-content-skeleton">' +
      '<table>' +
        '<tr>' + parts.join('') + '</tr>' +
      '</table>' +
    '</div>'
  )

  let colContainerEls = findElements(tableEl, '.fc-content-col')
  let mirrorContainerEls = findElements(tableEl, '.fc-mirror-container')
  let fgContainerEls = findElements(tableEl, '.fc-event-container:not(.fc-mirror-container)')
  let bgContainerEls = findElements(tableEl, '.fc-bgevent-container')
  let highlightContainerEls = findElements(tableEl, '.fc-highlight-container')
  let businessContainerEls = findElements(tableEl, '.fc-business-container')

  if (isRtl) {
    colContainerEls.reverse()
    mirrorContainerEls.reverse()
    fgContainerEls.reverse()
    bgContainerEls.reverse()
    highlightContainerEls.reverse()
    businessContainerEls.reverse()
  }

  return {
    rootEl: tableEl,
    colContainerEls,
    businessContainerEls,
    bgContainerEls,
    fgContainerEls,
    highlightContainerEls,
    mirrorContainerEls
  }
}


// Given segments grouped by column, insert the segments' elements into a parallel array of container
// elements, each living within a column.
export function attachSegs({ segs, containerEls }: { segs: Seg[], containerEls: HTMLElement[] }, context: ComponentContext) {
  let segsByCol = groupSegsByCol(segs, containerEls.length)

  for (let col = 0; col < segsByCol.length; col++) {
    segsByCol[col] = sortEventSegs(segsByCol[col], context.eventOrderSpecs)
  }

  for (let col = 0; col < containerEls.length; col++) { // iterate each column grouping
    let segs = segsByCol[col]

    for (let seg of segs) {
      containerEls[col].appendChild(seg.el)
    }
  }

  return segs
}


export function detachSegs(segs: Seg[]) {
  segs.forEach(function(seg) {
    removeElement(seg.el)
  })
}


function groupSegsByCol(segs, colCnt) {
  let segsByCol = []
  let i

  for (i = 0; i < colCnt; i++) {
    segsByCol.push([])
  }

  for (i = 0; i < segs.length; i++) {
    segsByCol[segs[i].col].push(segs[i])
  }

  return segsByCol
}

import { htmlEscape } from '../util/html'
import { htmlToElement, findElements, createElement, removeElement, applyStyle } from '../util/dom-manip'
import { default as DayTableMixin, DayTableInterface } from '../component/DayTableMixin'
import PositionCache from '../common/PositionCache'
import { DateRange, intersectRanges } from '../datelib/date-range'
import TimeGridEventRenderer from './TimeGridEventRenderer'
import TimeGridMirrorRenderer from './TimeGridMirrorRenderer'
import TimeGridFillRenderer from './TimeGridFillRenderer'
import { Duration, createDuration, addDurations, multiplyDuration, wholeDivideDurations, asRoughMs } from '../datelib/duration'
import { startOfDay, DateMarker, addMs } from '../datelib/marker'
import { DateFormatter, createFormatter, formatIsoTimeString } from '../datelib/formatting'
import DateComponent, { Seg } from '../component/DateComponent'
import OffsetTracker from '../common/OffsetTracker'
import { DateSpan } from '../structs/date-span'
import { EventStore } from '../structs/event-store'
import { Hit } from '../interactions/HitDragging'
import { EventUiHash } from '../component/event-rendering'

/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/
// We mixin DayTable, even though there is only a single row of days

// potential nice values for the slot-duration and interval-duration
// from largest to smallest
const AGENDA_STOCK_SUB_DURATIONS = [
  { hours: 1 },
  { minutes: 30 },
  { minutes: 15 },
  { seconds: 30 },
  { seconds: 15 }
]

export default class TimeGrid extends DateComponent {

  dayDates: DayTableInterface['dayDates']
  daysPerRow: DayTableInterface['daysPerRow']
  colCnt: DayTableInterface['colCnt']
  updateDayTable: DayTableInterface['updateDayTable']
  renderHeadHtml: DayTableInterface['renderHeadHtml']
  renderBgTrHtml: DayTableInterface['renderBgTrHtml']
  bookendCells: DayTableInterface['bookendCells']
  getCellDate: DayTableInterface['getCellDate']

  isInteractable = true
  doesDragMirror = true
  doesDragHighlight = false
  slicingType: 'timed' = 'timed' // stupid TypeScript

  view: any // TODO: make more general and/or remove
  mirrorRenderer: any

  dayRanges: DateRange[] // of start-end of each day
  slotDuration: Duration // duration of a "slot", a distinct time segment on given day, visualized by lines
  snapDuration: Duration // granularity of time for dragging and selecting
  snapsPerSlot: any
  labelFormat: DateFormatter // formatting string for times running along vertical axis
  labelInterval: Duration // duration of how often a label should be displayed for a slot

  headContainerEl: HTMLElement // div that hold's the date header
  colEls: HTMLElement[] // cells elements in the day-row background
  slatContainerEl: HTMLElement // div that wraps all the slat rows
  slatEls: HTMLElement[] // elements running horizontally across all columns
  nowIndicatorEls: HTMLElement[]

  colPositions: PositionCache
  slatPositions: PositionCache
  offsetTracker: OffsetTracker

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


  constructor(view) {
    super(view)
    this.processOptions()
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  rangeToSegs(range: DateRange): Seg[] {
    range = intersectRanges(range, this.dateProfile.validRange)

    if (range) {
      let segs = this.sliceRangeByTimes(range)
      let i

      for (i = 0; i < segs.length; i++) {
        if (this.isRTL) {
          segs[i].col = this.daysPerRow - 1 - segs[i].dayIndex
        } else {
          segs[i].col = segs[i].dayIndex
        }

        segs[i].component = this
      }

      return segs
    } else {
      return []
    }
  }


  /* Date Handling
  ------------------------------------------------------------------------------------------------------------------*/


  sliceRangeByTimes(range) {
    let segs = []
    let segRange
    let dayIndex

    for (dayIndex = 0; dayIndex < this.daysPerRow; dayIndex++) {

      segRange = intersectRanges(range, this.dayRanges[dayIndex])

      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          dayIndex: dayIndex
        })
      }
    }

    return segs
  }


  /* Options
  ------------------------------------------------------------------------------------------------------------------*/


  // Parses various options into properties of this object
  processOptions() {
    let slotDuration = this.opt('slotDuration')
    let snapDuration = this.opt('snapDuration')
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
    input = this.opt('slotLabelFormat')
    if (Array.isArray(input)) {
      input = input[input.length - 1]
    }

    this.labelFormat = createFormatter(input || {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroTime: true,
        meridiem: 'short'
    })

    input = this.opt('slotLabelInterval')
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


  /* Date Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  renderDates() {
    this.updateDayTable()
    this.renderSlats()
    this.renderColumns()
  }


  unrenderDates() {
    this.unrenderColumns()
    // we don't unrender slats because won't change between date navigation,
    // and if slat-related settings are changed, the whole component will be rerendered.
  }


  renderSkeleton() {
    let theme = this.getTheme()

    this.el.innerHTML =
      '<div class="fc-bg"></div>' +
      '<div class="fc-slats"></div>' +
      '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" style="display:none" />'

    this.rootBgContainerEl = this.el.querySelector('.fc-bg')
    this.slatContainerEl = this.el.querySelector('.fc-slats')
    this.bottomRuleEl = this.el.querySelector('.fc-divider')
  }


  renderSlats() {
    let theme = this.getTheme()

    this.slatContainerEl.innerHTML =
      '<table class="' + theme.getClass('tableGrid') + '">' +
        this.renderSlatRowHtml() +
      '</table>'

    this.slatEls = findElements(this.slatContainerEl, 'tr')

    this.slatPositions = new PositionCache(
      this.el,
      this.slatEls,
      false,
      true // vertical
    )
  }


  // Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
  renderSlatRowHtml() {
    let view = this.view
    let dateEnv = this.getDateEnv()
    let theme = this.getTheme()
    let isRTL = this.isRTL
    let dateProfile = this.dateProfile
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
        '<td class="fc-axis fc-time ' + theme.getClass('widgetContent') + '" ' + view.axisStyleAttr() + '>' +
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
          (!isRTL ? axisHtml : '') +
          '<td class="' + theme.getClass('widgetContent') + '"></td>' +
          (isRTL ? axisHtml : '') +
        '</tr>'

      slotTime = addDurations(slotTime, this.slotDuration)
      slotIterator = addDurations(slotIterator, this.slotDuration)
    }

    return html
  }


  renderColumns() {
    let dateProfile = this.dateProfile
    let theme = this.getTheme()
    let dateEnv = this.getDateEnv()

    this.dayRanges = this.dayDates.map(function(dayDate) {
      return {
        start: dateEnv.add(dayDate, dateProfile.minTime),
        end: dateEnv.add(dayDate, dateProfile.maxTime)
      }
    })

    if (this.headContainerEl) {
      this.headContainerEl.innerHTML = this.renderHeadHtml()
    }

    this.rootBgContainerEl.innerHTML =
      '<table class="' + theme.getClass('tableGrid') + '">' +
        this.renderBgTrHtml(0) + // row=0
      '</table>'

    this.colEls = findElements(this.el, '.fc-day, .fc-disabled-day')

    this.colPositions = new PositionCache(
      this.el,
      this.colEls,
      true, // horizontal
      false
    )

    this.renderContentSkeleton()
  }


  unrenderColumns() {
    this.unrenderContentSkeleton()
  }


  /* Content Skeleton
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders the DOM that the view's content will live in
  renderContentSkeleton() {
    let cellHtml = ''
    let i
    let skeletonEl: HTMLElement

    for (i = 0; i < this.colCnt; i++) {
      cellHtml +=
        '<td>' +
          '<div class="fc-content-col">' +
            '<div class="fc-event-container fc-mirror-container"></div>' +
            '<div class="fc-event-container"></div>' +
            '<div class="fc-highlight-container"></div>' +
            '<div class="fc-bgevent-container"></div>' +
            '<div class="fc-business-container"></div>' +
          '</div>' +
        '</td>'
    }

    skeletonEl = this.contentSkeletonEl = htmlToElement(
      '<div class="fc-content-skeleton">' +
        '<table>' +
          '<tr>' + cellHtml + '</tr>' +
        '</table>' +
      '</div>'
    )

    this.colContainerEls = findElements(skeletonEl, '.fc-content-col')
    this.mirrorContainerEls = findElements(skeletonEl, '.fc-mirror-container')
    this.fgContainerEls = findElements(skeletonEl, '.fc-event-container:not(.fc-mirror-container)')
    this.bgContainerEls = findElements(skeletonEl, '.fc-bgevent-container')
    this.highlightContainerEls = findElements(skeletonEl, '.fc-highlight-container')
    this.businessContainerEls = findElements(skeletonEl, '.fc-business-container')

    this.bookendCells(skeletonEl.querySelector('tr')) // TODO: do this on string level
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


  renderNowIndicator(date) {

    // HACK: if date columns not ready for some reason (scheduler)
    if (!this.colContainerEls) {
      return
    }

    // seg system might be overkill, but it handles scenario where line needs to be rendered
    //  more than once because of columns with the same date (resources columns for example)
    let segs = this.rangeToSegs({
      start: date,
      end: addMs(date, 1) // protect against null range
    })
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
    return this.slatContainerEl.offsetHeight
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop(when: DateMarker, startOfDayDate?: DateMarker) {
    if (!startOfDayDate) {
      startOfDayDate = startOfDay(when)
    }
    return this.computeTimeTop(when.valueOf() - startOfDayDate.valueOf())
  }


  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  computeTimeTop(timeMs: number) {
    let len = this.slatEls.length
    let dateProfile = this.dateProfile
    let slatCoverage = (timeMs - asRoughMs(dateProfile.minTime)) / asRoughMs(this.slotDuration) // floating-point value of # of slots covered
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
    let eventMinHeight = this.opt('agendaEventMinHeight')
    let i
    let seg
    let dayDate

    for (i = 0; i < segs.length; i++) {
      seg = segs[i]
      dayDate = this.dayDates[seg.dayIndex]

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
    this.colPositions.build()
    this.slatPositions.build()
  }


  /* Hit System
  ------------------------------------------------------------------------------------------------------------------*/


  prepareHits() {
    this.offsetTracker = new OffsetTracker(this.el)
  }


  releaseHits() {
    this.offsetTracker.destroy()
  }


  queryHit(leftOffset, topOffset): Hit {
    let { snapsPerSlot, slatPositions, colPositions, offsetTracker } = this

    if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
      let leftOrigin = offsetTracker.computeLeft()
      let topOrigin = offsetTracker.computeTop()
      let colIndex = colPositions.leftToIndex(leftOffset - leftOrigin)
      let slatIndex = slatPositions.topToIndex(topOffset - topOrigin)

      if (colIndex != null && slatIndex != null) {
        let slatTop = slatPositions.tops[slatIndex] + topOrigin
        let slatHeight = slatPositions.getHeight(slatIndex)
        let partial = (topOffset - slatTop) / slatHeight // floating point number between 0 and 1
        let localSnapIndex = Math.floor(partial * snapsPerSlot) // the snap # relative to start of slat
        let snapIndex = slatIndex * snapsPerSlot + localSnapIndex

        let dayDate = this.getCellDate(0, colIndex) // row=0
        let time = addDurations(
          this.dateProfile.minTime,
          multiplyDuration(this.snapDuration, snapIndex)
        )

        let dateEnv = this.getDateEnv()
        let start = dateEnv.add(dayDate, time)
        let end = dateEnv.add(start, this.snapDuration)

        return {
          component: this,
          dateSpan: {
            range: { start, end },
            isAllDay: false
          },
          dayEl: this.colEls[colIndex],
          rect: {
            left: colPositions.lefts[colIndex] + leftOrigin,
            right: colPositions.rights[colIndex] + leftOrigin,
            top: slatTop,
            bottom: slatTop + slatHeight
          },
          layer: 0
        }
      }
    }
  }


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event being resized
  renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(eventStore, eventUis)
    )

    this.mirrorRenderer.renderEventResizingSegs(segs, origSeg)
  }


  // Unrenders any visual indication of an event being resized
  unrenderEventResize() {
    this.mirrorRenderer.unrender()
  }


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
  renderDateSelection(selection: DateSpan) {
    if (this.opt('selectMirror')) {
      this.mirrorRenderer.renderEventSegs(this.selectionToSegs(selection, true))
    } else {
      this.renderHighlightSegs(this.selectionToSegs(selection, false))
    }
  }


  // Unrenders any visual indication of a selection
  unrenderDateSelection() {
    this.mirrorRenderer.unrender()
    this.unrenderHighlight()
  }

}

TimeGrid.prototype.eventRendererClass = TimeGridEventRenderer
TimeGrid.prototype.mirrorRendererClass = TimeGridMirrorRenderer
TimeGrid.prototype.fillRendererClass = TimeGridFillRenderer

DayTableMixin.mixInto(TimeGrid)

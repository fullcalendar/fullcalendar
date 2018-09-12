import { assignTo } from '../util/object'
import {
  createElement,
  insertAfterElement,
  findElements,
  findChildren,
  removeElement
} from '../util/dom-manip'
import { computeRect } from '../util/dom-geom'
import View from '../View'
import PositionCache from '../common/PositionCache'
import Popover from '../common/Popover'
import { default as DayTableMixin, DayTableInterface } from '../component/DayTableMixin'
import DayGridEventRenderer from './DayGridEventRenderer'
import DayGridMirrorRenderer from './DayGridMirrorRenderer'
import DayGridFillRenderer from './DayGridFillRenderer'
import { addDays } from '../datelib/marker'
import { createFormatter } from '../datelib/formatting'
import DateComponent, { Seg } from '../component/DateComponent'
import { EventStore } from '../structs/event-store'
import DayTile from './DayTile'
import { Hit } from '../interactions/HitDragging'
import { DateRange, rangeContainsMarker, intersectRanges } from '../datelib/date-range'
import OffsetTracker from '../common/OffsetTracker'
import { EventRenderRange, EventUiHash } from '../component/event-rendering'

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

export default class DayGrid extends DateComponent {

  rowCnt: DayTableInterface['rowCnt']
  colCnt: DayTableInterface['colCnt']
  daysPerRow: DayTableInterface['daysPerRow']
  sliceRangeByRow: DayTableInterface['sliceRangeByRow']
  updateDayTable: DayTableInterface['updateDayTable']
  renderHeadHtml: DayTableInterface['renderHeadHtml']
  getCellDate: DayTableInterface['getCellDate']
  renderBgTrHtml: DayTableInterface['renderBgTrHtml']
  renderIntroHtml: DayTableInterface['renderIntroHtml']
  getCellRange: DayTableInterface['getCellRange']
  sliceRangeByDay: DayTableInterface['sliceRangeByDay']
  bookendCells: DayTableInterface['bookendCells']
  breakOnWeeks: DayTableInterface['breakOnWeeks']

  isInteractable = true
  doesDragMirror = false
  doesDragHighlight = true
  slicingType: 'all-day' = 'all-day' // stupid TypeScript

  view: View // TODO: make more general and/or remove
  mirrorRenderer: any

  cellWeekNumbersVisible: boolean = false // display week numbers in day cell?

  bottomCoordPadding: number = 0 // hack for extending the hit area for the last row of the coordinate grid

  headContainerEl: HTMLElement // div that hold's the date header
  rowEls: HTMLElement[] // set of fake row elements
  cellEls: HTMLElement[] // set of whole-day elements comprising the row's background

  rowPositions: PositionCache
  colPositions: PositionCache
  offsetTracker: OffsetTracker

  // isRigid determines whether the individual rows should ignore the contents and be a constant height.
  // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  isRigid: boolean = false

  segPopover: Popover // the Popover that holds events that can't fit in a cell. null when not visible
  segPopoverTile: DayTile


  constructor(view) { // view is required, unlike superclass
    super(view)
  }


  // Slices up the given span (unzoned start/end with other misc data) into an array of segments
  rangeToSegs(range: DateRange): Seg[] {
    range = intersectRanges(range, this.dateProfile.validRange)

    if (range) {
      let segs = this.sliceRangeByRow(range)

      for (let i = 0; i < segs.length; i++) {
        let seg = segs[i]
        seg.component = this

        if (this.isRtl) {
          seg.leftCol = this.daysPerRow - 1 - seg.lastRowDayIndex
          seg.rightCol = this.daysPerRow - 1 - seg.firstRowDayIndex
        } else {
          seg.leftCol = seg.firstRowDayIndex
          seg.rightCol = seg.lastRowDayIndex
        }
      }

      return segs
    } else {
      return []
    }
  }


  /* Date Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  renderDates() {
    this.updateDayTable()
    this.renderGrid()
  }


  unrenderDates() {
    this.removeSegPopover()
  }


  // Renders the rows and columns into the component's `this.el`, which should already be assigned.
  renderGrid() {
    let view = this.view
    let dateEnv = this.getDateEnv()
    let rowCnt = this.rowCnt
    let colCnt = this.colCnt
    let html = ''
    let row
    let col

    if (this.headContainerEl) {
      this.headContainerEl.innerHTML = this.renderHeadHtml()
    }

    for (row = 0; row < rowCnt; row++) {
      html += this.renderDayRowHtml(row, this.isRigid)
    }
    this.el.innerHTML = html

    this.rowEls = findElements(this.el, '.fc-row')
    this.cellEls = findElements(this.el, '.fc-day, .fc-disabled-day')

    this.rowPositions = new PositionCache(
      this.el,
      this.rowEls,
      false,
      true // vertical
    )

    this.colPositions = new PositionCache(
      this.el,
      this.cellEls.slice(0, this.colCnt), // only the first row
      true,
      false // horizontal
    )

    // trigger dayRender with each cell's element
    for (row = 0; row < rowCnt; row++) {
      for (col = 0; col < colCnt; col++) {
        this.publiclyTrigger('dayRender', [
          {
            date: dateEnv.toDate(this.getCellDate(row, col)),
            allDay: true,
            el: this.getCellEl(row, col),
            view
          }
        ])
      }
    }
  }


  // Generates the HTML for a single row, which is a div that wraps a table.
  // `row` is the row number.
  renderDayRowHtml(row, isRigid) {
    let theme = this.getTheme()
    let classes = [ 'fc-row', 'fc-week', theme.getClass('dayRow') ]

    if (isRigid) {
      classes.push('fc-rigid')
    }

    return '' +
      '<div class="' + classes.join(' ') + '">' +
        '<div class="fc-bg">' +
          '<table class="' + theme.getClass('tableGrid') + '">' +
            this.renderBgTrHtml(row) +
          '</table>' +
        '</div>' +
        '<div class="fc-content-skeleton">' +
          '<table>' +
            (this.getIsNumbersVisible() ?
              '<thead>' +
                this.renderNumberTrHtml(row) +
              '</thead>' :
              ''
              ) +
          '</table>' +
        '</div>' +
      '</div>'
  }


  getIsNumbersVisible() {
    return this.getIsDayNumbersVisible() || this.cellWeekNumbersVisible
  }


  getIsDayNumbersVisible() {
    return this.rowCnt > 1
  }


  /* Grid Number Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  renderNumberTrHtml(row) {
    return '' +
      '<tr>' +
        (this.isRtl ? '' : this.renderNumberIntroHtml(row)) +
        this.renderNumberCellsHtml(row) +
        (this.isRtl ? this.renderNumberIntroHtml(row) : '') +
      '</tr>'
  }


  renderNumberIntroHtml(row) {
    return this.renderIntroHtml()
  }


  renderNumberCellsHtml(row) {
    let htmls = []
    let col
    let date

    for (col = 0; col < this.colCnt; col++) {
      date = this.getCellDate(row, col)
      htmls.push(this.renderNumberCellHtml(date))
    }

    return htmls.join('')
  }


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  renderNumberCellHtml(date) {
    let view = this.view
    let dateEnv = this.getDateEnv()
    let html = ''
    let isDateValid = rangeContainsMarker(this.dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let isDayNumberVisible = this.getIsDayNumbersVisible() && isDateValid
    let classes
    let weekCalcFirstDow

    if (!isDayNumberVisible && !this.cellWeekNumbersVisible) {
      // no numbers in day cell (week number must be along the side)
      return '<td></td>' //  will create an empty space above events :(
    }

    classes = this.getDayClasses(date)
    classes.unshift('fc-day-top')

    if (this.cellWeekNumbersVisible) {
      weekCalcFirstDow = dateEnv.weekDow
    }

    html += '<td class="' + classes.join(' ') + '"' +
      (isDateValid ?
        ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
        ''
        ) +
      '>'

    if (this.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) {
      html += view.buildGotoAnchorHtml(
        { date: date, type: 'week' },
        { 'class': 'fc-week-number' },
        dateEnv.format(date, WEEK_NUM_FORMAT) // inner HTML
      )
    }

    if (isDayNumberVisible) {
      html += view.buildGotoAnchorHtml(
        date,
        { 'class': 'fc-day-number' },
        dateEnv.format(date, DAY_NUM_FORMAT) // inner HTML
      )
    }

    html += '</td>'

    return html
  }


  /* Sizing
  ------------------------------------------------------------------------------------------------------------------*/


  buildPositionCaches() {
    this.colPositions.build()
    this.rowPositions.build()
    this.rowPositions.bottoms[this.rowCnt - 1] += this.bottomCoordPadding // hack
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
    let { colPositions, rowPositions, offsetTracker } = this

    if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
      let leftOrigin = offsetTracker.computeLeft()
      let topOrigin = offsetTracker.computeTop()
      let col = colPositions.leftToIndex(leftOffset - leftOrigin)
      let row = rowPositions.topToIndex(topOffset - topOrigin)

      if (row != null && col != null) {
        return {
          component: this,
          dateSpan: {
            range: this.getCellRange(row, col),
            allDay: true
          },
          dayEl: this.getCellEl(row, col),
          rect: {
            left: colPositions.lefts[col] + leftOrigin,
            right: colPositions.rights[col] + leftOrigin,
            top: rowPositions.tops[row] + topOrigin,
            bottom: rowPositions.bottoms[row] + topOrigin
          },
          layer: 0
        }
      }
    }
  }


  /* Cell System
  ------------------------------------------------------------------------------------------------------------------*/
  // FYI: the first column is the leftmost column, regardless of date


  getCellEl(row, col) {
    return this.cellEls[row * this.colCnt + col]
  }


  /* Event Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Unrenders all events currently rendered on the grid
  unrenderEvents() {
    this.removeSegPopover() // removes the "more.." events popover
    super.unrenderEvents()
  }


  // Retrieves all rendered segment objects currently rendered on the grid
  getAllEventSegs() {
    // append the segments from the "more..." popover
    return super.getAllEventSegs().concat(
      this.segPopoverTile ?
        this.segPopoverTile.getAllEventSegs() :
        []
    )
  }


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event being resized
  renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg) {
    let segs = this.eventRangesToSegs(
      this.eventStoreToRanges(eventStore, eventUis)
    )

    this.renderHighlightSegs(segs)

    this.mirrorRenderer.renderEventResizingSegs(segs, origSeg)
  }


  // Unrenders a visual indication of an event being resized
  unrenderEventResize() {
    this.unrenderHighlight()
    this.mirrorRenderer.unrender()
  }


  /* More+ Link Popover
  ------------------------------------------------------------------------------------------------------------------*/


  removeSegPopover() {
    if (this.segPopover) {
      this.segPopover.hide() // in handler, will call segPopover's removeElement
    }
  }


  // Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
  // `levelLimit` can be false (don't limit), a number, or true (should be computed).
  limitRows(levelLimit) {
    let rowStructs = this.eventRenderer.rowStructs || []
    let row // row #
    let rowLevelLimit

    for (row = 0; row < rowStructs.length; row++) {
      this.unlimitRow(row)

      if (!levelLimit) {
        rowLevelLimit = false
      } else if (typeof levelLimit === 'number') {
        rowLevelLimit = levelLimit
      } else {
        rowLevelLimit = this.computeRowLevelLimit(row)
      }

      if (rowLevelLimit !== false) {
        this.limitRow(row, rowLevelLimit)
      }
    }
  }


  // Computes the number of levels a row will accomodate without going outside its bounds.
  // Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
  // `row` is the row number.
  computeRowLevelLimit(row): (number | false) {
    let rowEl = this.rowEls[row] // the containing "fake" row div
    let rowBottom = rowEl.getBoundingClientRect().bottom // relative to viewport!
    let trEls = findChildren(this.eventRenderer.rowStructs[row].tbodyEl) as HTMLTableRowElement[]
    let i
    let trEl: HTMLTableRowElement

    // Reveal one level <tr> at a time and stop when we find one out of bounds
    for (i = 0; i < trEls.length; i++) {
      trEl = trEls[i]
      trEl.classList.remove('fc-limited') // reset to original state (reveal)

      if (trEl.getBoundingClientRect().bottom > rowBottom) {
        return i
      }
    }

    return false // should not limit at all
  }


  // Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
  // `row` is the row number.
  // `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
  limitRow(row, levelLimit) {
    let rowStruct = this.eventRenderer.rowStructs[row]
    let moreNodes = [] // array of "more" <a> links and <td> DOM nodes
    let col = 0 // col #, left-to-right (not chronologically)
    let levelSegs // array of segment objects in the last allowable level, ordered left-to-right
    let cellMatrix // a matrix (by level, then column) of all <td> elements in the row
    let limitedNodes // array of temporarily hidden level <tr> and segment <td> DOM nodes
    let i
    let seg
    let segsBelow // array of segment objects below `seg` in the current `col`
    let totalSegsBelow // total number of segments below `seg` in any of the columns `seg` occupies
    let colSegsBelow // array of segment arrays, below seg, one for each column (offset from segs's first column)
    let td: HTMLTableCellElement
    let rowSpan
    let segMoreNodes // array of "more" <td> cells that will stand-in for the current seg's cell
    let j
    let moreTd: HTMLTableCellElement
    let moreWrap
    let moreLink

    // Iterates through empty level cells and places "more" links inside if need be
    let emptyCellsUntil = (endCol) => { // goes from current `col` to `endCol`
      while (col < endCol) {
        segsBelow = this.getCellSegs(row, col, levelLimit)
        if (segsBelow.length) {
          td = cellMatrix[levelLimit - 1][col]
          moreLink = this.renderMoreLink(row, col, segsBelow)
          moreWrap = createElement('div', null, moreLink)
          td.appendChild(moreWrap)
          moreNodes.push(moreWrap[0])
        }
        col++
      }
    }

    if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
      levelSegs = rowStruct.segLevels[levelLimit - 1]
      cellMatrix = rowStruct.cellMatrix

      limitedNodes = findChildren(rowStruct.tbodyEl).slice(levelLimit) // get level <tr> elements past the limit
      limitedNodes.forEach(function(node) {
        node.classList.add('fc-limited') // hide elements and get a simple DOM-nodes array
      })

      // iterate though segments in the last allowable level
      for (i = 0; i < levelSegs.length; i++) {
        seg = levelSegs[i]
        emptyCellsUntil(seg.leftCol) // process empty cells before the segment

        // determine *all* segments below `seg` that occupy the same columns
        colSegsBelow = []
        totalSegsBelow = 0
        while (col <= seg.rightCol) {
          segsBelow = this.getCellSegs(row, col, levelLimit)
          colSegsBelow.push(segsBelow)
          totalSegsBelow += segsBelow.length
          col++
        }

        if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
          td = cellMatrix[levelLimit - 1][seg.leftCol] // the segment's parent cell
          rowSpan = td.rowSpan || 1
          segMoreNodes = []

          // make a replacement <td> for each column the segment occupies. will be one for each colspan
          for (j = 0; j < colSegsBelow.length; j++) {
            moreTd = createElement('td', { className: 'fc-more-cell', rowSpan }) as HTMLTableCellElement
            segsBelow = colSegsBelow[j]
            moreLink = this.renderMoreLink(
              row,
              seg.leftCol + j,
              [ seg ].concat(segsBelow) // count seg as hidden too
            )
            moreWrap = createElement('div', null, moreLink)
            moreTd.appendChild(moreWrap)
            segMoreNodes.push(moreTd)
            moreNodes.push(moreTd)
          }

          td.classList.add('fc-limited')
          insertAfterElement(td, segMoreNodes)

          limitedNodes.push(td)
        }
      }

      emptyCellsUntil(this.colCnt) // finish off the level
      rowStruct.moreEls = moreNodes // for easy undoing later
      rowStruct.limitedEls = limitedNodes // for easy undoing later
    }
  }


  // Reveals all levels and removes all "more"-related elements for a grid's row.
  // `row` is a row number.
  unlimitRow(row) {
    let rowStruct = this.eventRenderer.rowStructs[row]

    if (rowStruct.moreEls) {
      rowStruct.moreEls.forEach(removeElement)
      rowStruct.moreEls = null
    }

    if (rowStruct.limitedEls) {
      rowStruct.limitedEls.forEach(function(limitedEl) {
        limitedEl.classList.remove('fc-limited')
      })
      rowStruct.limitedEls = null
    }
  }


  // Renders an <a> element that represents hidden event element for a cell.
  // Responsible for attaching click handler as well.
  renderMoreLink(row, col, hiddenSegs) {
    let view = this.view
    let dateEnv = this.getDateEnv()

    let a = createElement('a', { className: 'fc-more' })
    a.innerText = this.getMoreLinkText(hiddenSegs.length)
    a.addEventListener('click', (ev) => {
      let clickOption = this.opt('eventLimitClick')
      let date = this.getCellDate(row, col)
      let moreEl = ev.currentTarget as HTMLElement
      let dayEl = this.getCellEl(row, col)
      let allSegs = this.getCellSegs(row, col)

      // rescope the segments to be within the cell's date
      let reslicedAllSegs = this.resliceDaySegs(allSegs, date)
      let reslicedHiddenSegs = this.resliceDaySegs(hiddenSegs, date)

      if (typeof clickOption === 'function') {
        // the returned value can be an atomic option
        clickOption = this.publiclyTrigger('eventLimitClick', [
          {
            date: dateEnv.toDate(date),
            allDay: true,
            dayEl: dayEl,
            moreEl: moreEl,
            segs: reslicedAllSegs,
            hiddenSegs: reslicedHiddenSegs,
            jsEvent: ev,
            view
          }
        ])
      }

      if (clickOption === 'popover') {
        this.showSegPopover(row, col, moreEl, reslicedAllSegs)
      } else if (typeof clickOption === 'string') { // a view name
        view.calendar.zoomTo(date, clickOption)
      }
    })

    return a
  }


  // Reveals the popover that displays all events within a cell
  showSegPopover(row, col, moreLink: HTMLElement, segs) {
    let view = this.view
    let moreWrap = moreLink.parentNode as HTMLElement // the <div> wrapper around the <a>
    let topEl: HTMLElement // the element we want to match the top coordinate of
    let options

    if (this.rowCnt === 1) {
      topEl = view.el // will cause the popover to cover any sort of header
    } else {
      topEl = this.rowEls[row] // will align with top of row
    }

    options = {
      className: 'fc-more-popover ' + view.calendar.theme.getClass('popover'),
      parentEl: this.el,
      top: computeRect(topEl).top,
      autoHide: true, // when the user clicks elsewhere, hide the popover
      content: (el) => {
        this.segPopoverTile.setElement(el)

        // it would be more proper to call render() with a full render state,
        // but hackily rendering segs directly is much easier
        // simlate a lot of what happens in render() and renderEventRanges()
        this.segPopoverTile.renderSkeleton()
        this.segPopoverTile.eventRenderer.rangeUpdated()
        this.segPopoverTile.eventRenderer.renderSegs(segs)
        this.segPopoverTile.renderedFlags.events = true // so unrendering works
      },
      hide: () => {
        this.segPopoverTile.removeElement()
        this.segPopover.removeElement()
        this.segPopover = null
      }
    }

    // Determine horizontal coordinate.
    // We use the moreWrap instead of the <td> to avoid border confusion.
    if (this.isRtl) {
      options.right = computeRect(moreWrap).right + 1 // +1 to be over cell border
    } else {
      options.left = computeRect(moreWrap).left - 1 // -1 to be over cell border
    }

    this.segPopoverTile = new DayTile(this.view, this.getCellDate(row, col))
    this.segPopover = new Popover(options)
    this.segPopover.show()
    this.getCalendar().releaseAfterSizingTriggers() // hack for eventPositioned
  }


  // Given the events within an array of segment objects, reslice them to be in a single day
  resliceDaySegs(segs, dayDate) {
    let dayStart = dayDate
    let dayEnd = addDays(dayStart, 1)
    let dayRange = { start: dayStart, end: dayEnd }
    let newSegs = []

    for (let seg of segs) {
      let eventRange = seg.eventRange
      let origRange = eventRange.range
      let slicedRange = intersectRanges(origRange, dayRange)

      if (slicedRange) {
        newSegs.push(
          assignTo({}, seg, {
            eventRange: {
              def: eventRange.def,
              ui: assignTo({}, eventRange.ui, { durationEditable: false }), // hack to disable resizing
              instance: eventRange.instance,
              range: slicedRange
            } as EventRenderRange,
            isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
            isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf()
          })
        )
      }
    }

    return newSegs
  }


  // Generates the text that should be inside a "more" link, given the number of events it represents
  getMoreLinkText(num) {
    let opt = this.opt('eventLimitText')

    if (typeof opt === 'function') {
      return opt(num)
    } else {
      return '+' + num + ' ' + opt
    }
  }


  // Returns segments within a given cell.
  // If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
  getCellSegs(row, col, startLevel?) {
    let segMatrix = this.eventRenderer.rowStructs[row].segMatrix
    let level = startLevel || 0
    let segs = []
    let seg

    while (level < segMatrix.length) {
      seg = segMatrix[level][col]
      if (seg) {
        segs.push(seg)
      }
      level++
    }

    return segs
  }

}

DayGrid.prototype.eventRendererClass = DayGridEventRenderer
DayGrid.prototype.mirrorRendererClass = DayGridMirrorRenderer
DayGrid.prototype.fillRendererClass = DayGridFillRenderer

DayTableMixin.mixInto(DayGrid)

import {
  createElement,
  insertAfterElement,
  findElements,
  findChildren,
  removeElement,
  computeRect,
  PositionCache,
  addDays,
  DateMarker,
  createFormatter,
  DateComponent,
  EventSegUiInteractionState,
  Seg,
  rangeContainsMarker,
  intersectRanges,
  EventRenderRange,
  buildGotoAnchorHtml,
  getDayClasses,
  DateProfile,
  memoizeRendering,
  MemoizedRendering,
  ComponentContext
} from '@fullcalendar/core'
import Popover from './Popover'
import DayGridEventRenderer from './DayGridEventRenderer'
import DayGridMirrorRenderer from './DayGridMirrorRenderer'
import DayGridFillRenderer from './DayGridFillRenderer'
import DayTile from './DayTile'
import DayBgRow from './DayBgRow'

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

export interface RenderProps { // TODO: combine with DayGridProps
  renderNumberIntroHtml: (row: number, dayGrid: DayGrid) => string
  renderBgIntroHtml: () => string
  renderIntroHtml: () => string
  colWeekNumbersVisible: boolean // week numbers render in own column? (caller does HTML via intro)
  cellWeekNumbersVisible: boolean // display week numbers in day cell?
}

export interface DayGridSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}

export interface DayGridCell {
  date: DateMarker
  htmlAttrs?: string
}

export interface DayGridProps {
  dateProfile: DateProfile
  cells: DayGridCell[][]
  businessHourSegs: DayGridSeg[]
  bgEventSegs: DayGridSeg[]
  fgEventSegs: DayGridSeg[]
  dateSelectionSegs: DayGridSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null

  // isRigid determines whether the individual rows should ignore the contents and be a constant height.
  // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  isRigid: boolean
}

export default class DayGrid extends DateComponent<DayGridProps> {

  eventRenderer: DayGridEventRenderer
  renderProps: RenderProps

  rowCnt: number
  colCnt: number

  bottomCoordPadding: number = 0 // hack for extending the hit area for the last row of the coordinate grid

  rowEls: HTMLElement[] // set of fake row elements
  cellEls: HTMLElement[] // set of whole-day elements comprising the row's background

  isCellSizesDirty: boolean = false
  rowPositions: PositionCache
  colPositions: PositionCache

  segPopover: Popover // the Popover that holds events that can't fit in a cell. null when not visible
  segPopoverTile: DayTile

  private renderCells: MemoizedRendering<[DayGridCell[][], boolean]>
  private renderBusinessHours: MemoizedRendering<[ComponentContext, DayGridSeg[]]>
  private renderDateSelection: MemoizedRendering<[ComponentContext, DayGridSeg[]]>
  private renderBgEvents: MemoizedRendering<[ComponentContext, DayGridSeg[]]>
  private renderFgEvents: MemoizedRendering<[ComponentContext, DayGridSeg[]]>
  private renderEventSelection: MemoizedRendering<[string]>
  private renderEventDrag: MemoizedRendering<[EventSegUiInteractionState]>
  private renderEventResize: MemoizedRendering<[EventSegUiInteractionState]>


  constructor(el, renderProps: RenderProps) {
    super(el)

    this.renderProps = renderProps

    let eventRenderer = this.eventRenderer = new DayGridEventRenderer(this)
    let fillRenderer = this.fillRenderer = new DayGridFillRenderer(this)
    this.mirrorRenderer = new DayGridMirrorRenderer(this)

    let renderCells = this.renderCells = memoizeRendering(
      this._renderCells,
      this._unrenderCells
    )

    this.renderBusinessHours = memoizeRendering(
      fillRenderer.renderSegs.bind(fillRenderer, 'businessHours'),
      fillRenderer.unrender.bind(fillRenderer, 'businessHours'),
      [ renderCells ]
    )

    this.renderDateSelection = memoizeRendering(
      fillRenderer.renderSegs.bind(fillRenderer, 'highlight'),
      fillRenderer.unrender.bind(fillRenderer, 'highlight'),
      [ renderCells ]
    )

    this.renderBgEvents = memoizeRendering(
      fillRenderer.renderSegs.bind(fillRenderer, 'bgEvent'),
      fillRenderer.unrender.bind(fillRenderer, 'bgEvent'),
      [ renderCells ]
    )

    this.renderFgEvents = memoizeRendering(
      eventRenderer.renderSegs.bind(eventRenderer),
      eventRenderer.unrender.bind(eventRenderer),
      [ renderCells ]
    )

    this.renderEventSelection = memoizeRendering(
      eventRenderer.selectByInstanceId.bind(eventRenderer),
      eventRenderer.unselectByInstanceId.bind(eventRenderer),
      [ this.renderFgEvents ]
    )

    this.renderEventDrag = memoizeRendering(
      this._renderEventDrag,
      this._unrenderEventDrag,
      [ renderCells ]
    )

    this.renderEventResize = memoizeRendering(
      this._renderEventResize,
      this._unrenderEventResize,
      [ renderCells ]
    )
  }


  render(props: DayGridProps, context: ComponentContext) {
    let cells = props.cells
    this.rowCnt = cells.length
    this.colCnt = cells[0].length

    this.renderCells(cells, props.isRigid)
    this.renderBusinessHours(context, props.businessHourSegs)
    this.renderDateSelection(context, props.dateSelectionSegs)
    this.renderBgEvents(context, props.bgEventSegs)
    this.renderFgEvents(context, props.fgEventSegs)
    this.renderEventSelection(props.eventSelection)
    this.renderEventDrag(props.eventDrag)
    this.renderEventResize(props.eventResize)

    if (this.segPopoverTile) {
      this.updateSegPopoverTile()
    }
  }


  destroy() {
    super.destroy()

    this.renderCells.unrender() // will unrender everything else
  }


  getCellRange(row, col) {
    let start = this.props.cells[row][col].date
    let end = addDays(start, 1)

    return { start, end }
  }


  updateSegPopoverTile(date?, segs?) {
    let ownProps = this.props

    this.segPopoverTile.receiveProps({
      date: date || (this.segPopoverTile.props as any).date,
      fgSegs: segs || (this.segPopoverTile.props as any).fgSegs,
      eventSelection: ownProps.eventSelection,
      eventDragInstances: ownProps.eventDrag ? ownProps.eventDrag.affectedInstances : null,
      eventResizeInstances: ownProps.eventResize ? ownProps.eventResize.affectedInstances : null
    }, this.context)
  }


  /* Date Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  _renderCells(cells: DayGridCell[][], isRigid: boolean) {
    let { calendar, view, isRtl, dateEnv } = this.context
    let { rowCnt, colCnt } = this
    let html = ''
    let row
    let col

    for (row = 0; row < rowCnt; row++) {
      html += this.renderDayRowHtml(row, isRigid)
    }
    this.el.innerHTML = html

    this.rowEls = findElements(this.el, '.fc-row')
    this.cellEls = findElements(this.el, '.fc-day, .fc-disabled-day')

    if (isRtl) {
      this.cellEls.reverse()
    }

    this.rowPositions = new PositionCache(
      this.el,
      this.rowEls,
      false,
      true // vertical
    )

    this.colPositions = new PositionCache(
      this.el,
      this.cellEls.slice(0, colCnt), // only the first row
      true,
      false // horizontal
    )

    // trigger dayRender with each cell's element
    for (row = 0; row < rowCnt; row++) {
      for (col = 0; col < colCnt; col++) {
        calendar.publiclyTrigger('dayRender', [
          {
            date: dateEnv.toDate(cells[row][col].date),
            el: this.getCellEl(row, col),
            view
          }
        ])
      }
    }

    this.isCellSizesDirty = true
  }


  _unrenderCells() {
    this.removeSegPopover()
  }


  // Generates the HTML for a single row, which is a div that wraps a table.
  // `row` is the row number.
  renderDayRowHtml(row, isRigid) {
    let { theme } = this.context
    let classes = [ 'fc-row', 'fc-week', theme.getClass('dayRow') ]

    if (isRigid) {
      classes.push('fc-rigid')
    }

    let bgRow = new DayBgRow(this.context)

    return '' +
      '<div class="' + classes.join(' ') + '">' +
        '<div class="fc-bg">' +
          '<table class="' + theme.getClass('tableGrid') + '">' +
            bgRow.renderHtml({
              cells: this.props.cells[row],
              dateProfile: this.props.dateProfile,
              renderIntroHtml: this.renderProps.renderBgIntroHtml
            }) +
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
    return this.getIsDayNumbersVisible() ||
      this.renderProps.cellWeekNumbersVisible ||
      this.renderProps.colWeekNumbersVisible
  }


  getIsDayNumbersVisible() {
    return this.rowCnt > 1
  }


  /* Grid Number Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  renderNumberTrHtml(row: number) {
    let { isRtl } = this.context
    let intro = this.renderProps.renderNumberIntroHtml(row, this)

    return '' +
      '<tr>' +
        (isRtl ? '' : intro) +
        this.renderNumberCellsHtml(row) +
        (isRtl ? intro : '') +
      '</tr>'
  }


  renderNumberCellsHtml(row) {
    let htmls = []
    let col
    let date

    for (col = 0; col < this.colCnt; col++) {
      date = this.props.cells[row][col].date
      htmls.push(this.renderNumberCellHtml(date))
    }

    if (this.context.isRtl) {
      htmls.reverse()
    }

    return htmls.join('')
  }


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  renderNumberCellHtml(date) {
    let { dateEnv, options } = this.context
    let html = ''
    let isDateValid = rangeContainsMarker(this.props.dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let isDayNumberVisible = this.getIsDayNumbersVisible() && isDateValid
    let classes
    let weekCalcFirstDow

    if (!isDayNumberVisible && !this.renderProps.cellWeekNumbersVisible) {
      // no numbers in day cell (week number must be along the side)
      return '<td></td>' //  will create an empty space above events :(
    }

    classes = getDayClasses(date, this.props.dateProfile, this.context)
    classes.unshift('fc-day-top')

    if (this.renderProps.cellWeekNumbersVisible) {
      weekCalcFirstDow = dateEnv.weekDow
    }

    html += '<td class="' + classes.join(' ') + '"' +
      (isDateValid ?
        ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
        ''
        ) +
      '>'

    if (this.renderProps.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) {
      html += buildGotoAnchorHtml(
        options,
        dateEnv,
        { date, type: 'week' },
        { 'class': 'fc-week-number' },
        dateEnv.format(date, WEEK_NUM_FORMAT) // inner HTML
      )
    }

    if (isDayNumberVisible) {
      html += buildGotoAnchorHtml(
        options,
        dateEnv,
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


  updateSize(isResize: boolean) {
    let { calendar } = this.context
    let { fillRenderer, eventRenderer, mirrorRenderer } = this

    if (
      isResize ||
      this.isCellSizesDirty ||
      calendar.isEventsUpdated // hack
    ) {
      this.buildPositionCaches()
      this.isCellSizesDirty = false
    }

    fillRenderer.computeSizes(isResize)
    eventRenderer.computeSizes(isResize)
    mirrorRenderer.computeSizes(isResize)

    fillRenderer.assignSizes(isResize)
    eventRenderer.assignSizes(isResize)
    mirrorRenderer.assignSizes(isResize)
  }


  buildPositionCaches() {
    this.buildColPositions()
    this.buildRowPositions()
  }


  buildColPositions() {
    this.colPositions.build()
  }


  buildRowPositions() {
    this.rowPositions.build()
    this.rowPositions.bottoms[this.rowCnt - 1] += this.bottomCoordPadding // hack
  }


  /* Hit System
  ------------------------------------------------------------------------------------------------------------------*/

  positionToHit(leftPosition, topPosition) {
    let { colPositions, rowPositions } = this

    let col = colPositions.leftToIndex(leftPosition)
    let row = rowPositions.topToIndex(topPosition)

    if (row != null && col != null) {
      return {
        row,
        col,
        dateSpan: {
          range: this.getCellRange(row, col),
          allDay: true
        },
        dayEl: this.getCellEl(row, col),
        relativeRect: {
          left: colPositions.lefts[col],
          right: colPositions.rights[col],
          top: rowPositions.tops[row],
          bottom: rowPositions.bottoms[row]
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


  /* Event Drag Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  _renderEventDrag(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedInstances)
      this.fillRenderer.renderSegs('highlight', this.context, state.segs)
    }
  }


  _unrenderEventDrag(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedInstances)
      this.fillRenderer.unrender('highlight', this.context)
    }
  }


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  _renderEventResize(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.hideByHash(state.affectedInstances)
      this.fillRenderer.renderSegs('highlight', this.context, state.segs)
      this.mirrorRenderer.renderSegs(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg })
    }
  }


  _unrenderEventResize(state: EventSegUiInteractionState) {
    if (state) {
      this.eventRenderer.showByHash(state.affectedInstances)
      this.fillRenderer.unrender('highlight', this.context)
      this.mirrorRenderer.unrender(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg })
    }
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
    let { colCnt } = this
    let { isRtl } = this.context
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
          moreNodes.push(moreWrap)
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
        let leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol
        let rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol

        emptyCellsUntil(leftCol) // process empty cells before the segment

        // determine *all* segments below `seg` that occupy the same columns
        colSegsBelow = []
        totalSegsBelow = 0
        while (col <= rightCol) {
          segsBelow = this.getCellSegs(row, col, levelLimit)
          colSegsBelow.push(segsBelow)
          totalSegsBelow += segsBelow.length
          col++
        }

        if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
          td = cellMatrix[levelLimit - 1][leftCol] // the segment's parent cell
          rowSpan = td.rowSpan || 1
          segMoreNodes = []

          // make a replacement <td> for each column the segment occupies. will be one for each colspan
          for (j = 0; j < colSegsBelow.length; j++) {
            moreTd = createElement('td', { className: 'fc-more-cell', rowSpan }) as HTMLTableCellElement
            segsBelow = colSegsBelow[j]
            moreLink = this.renderMoreLink(
              row,
              leftCol + j,
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
    let { calendar, view, dateEnv, options, isRtl } = this.context

    let a = createElement('a', { className: 'fc-more' })
    a.innerText = this.getMoreLinkText(hiddenSegs.length)
    a.addEventListener('click', (ev) => {
      let clickOption = options.eventLimitClick
      let _col = isRtl ? this.colCnt - col - 1 : col // HACK: props.cells has different dir system?
      let date = this.props.cells[row][_col].date
      let moreEl = ev.currentTarget as HTMLElement
      let dayEl = this.getCellEl(row, col)
      let allSegs = this.getCellSegs(row, col)

      // rescope the segments to be within the cell's date
      let reslicedAllSegs = this.resliceDaySegs(allSegs, date)
      let reslicedHiddenSegs = this.resliceDaySegs(hiddenSegs, date)

      if (typeof clickOption === 'function') {
        // the returned value can be an atomic option
        clickOption = calendar.publiclyTrigger('eventLimitClick', [
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
        calendar.zoomTo(date, clickOption)
      }
    })

    return a
  }


  // Reveals the popover that displays all events within a cell
  showSegPopover(row, col, moreLink: HTMLElement, segs) {
    let { calendar, view, theme, isRtl } = this.context
    let _col = isRtl ? this.colCnt - col - 1 : col // HACK: props.cells has different dir system?
    let moreWrap = moreLink.parentNode as HTMLElement // the <div> wrapper around the <a>
    let topEl: HTMLElement // the element we want to match the top coordinate of
    let options

    if (this.rowCnt === 1) {
      topEl = view.el // will cause the popover to cover any sort of header
    } else {
      topEl = this.rowEls[row] // will align with top of row
    }

    options = {
      className: 'fc-more-popover ' + theme.getClass('popover'),
      parentEl: view.el, // will be outside of all scrollers within the view
      top: computeRect(topEl).top,
      autoHide: true, // when the user clicks elsewhere, hide the popover
      content: (el) => {
        this.segPopoverTile = new DayTile(el)
        this.updateSegPopoverTile(
          this.props.cells[row][_col].date,
          segs
        )
      },
      hide: () => {
        this.segPopoverTile.destroy()
        this.segPopoverTile = null
        this.segPopover.destroy()
        this.segPopover = null
      }
    }

    // Determine horizontal coordinate.
    // We use the moreWrap instead of the <td> to avoid border confusion.
    if (isRtl) {
      options.right = computeRect(moreWrap).right + 1 // +1 to be over cell border
    } else {
      options.left = computeRect(moreWrap).left - 1 // -1 to be over cell border
    }

    this.segPopover = new Popover(options)
    this.segPopover.show()
    calendar.releaseAfterSizingTriggers() // hack for eventPositioned
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
        newSegs.push({
          ...seg,
          eventRange: {
            def: eventRange.def,
            ui: { ...eventRange.ui, durationEditable: false }, // hack to disable resizing
            instance: eventRange.instance,
            range: slicedRange
          } as EventRenderRange,
          isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
          isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf()
        })
      }
    }

    return newSegs
  }


  // Generates the text that should be inside a "more" link, given the number of events it represents
  getMoreLinkText(num) {
    let opt = this.context.options.eventLimitText

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

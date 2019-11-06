import {
  createElement,
  insertAfterElement,
  findElements,
  findDirectChildren,
  removeElement,
  computeRect,
  PositionCache,
  addDays,
  DateMarker,
  createFormatter,
  Component,
  EventSegUiInteractionState,
  Seg,
  rangeContainsMarker,
  intersectRanges,
  EventRenderRange,
  buildGotoAnchorHtml,
  getDayClasses,
  DateProfile,
  ComponentContext,
  renderer
} from '@fullcalendar/core'
import Popover from './Popover'
import TableEvents from './TableEvents'
import TableMirrorEvents from './TableMirrorEvents'
import TableFills from './TableFills'
import DayTile from './DayTile'
import { renderDayBgRowHtml } from './DayBgRow'
import { DomLocation } from '@fullcalendar/core/view-framework'

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

export interface TableRenderProps {
  renderNumberIntroHtml: (row: number, dayGrid: Table) => string
  renderBgIntroHtml: () => string
  renderIntroHtml: () => string
  colWeekNumbersVisible: boolean // week numbers render in own column? (caller does HTML via intro)
  cellWeekNumbersVisible: boolean // display week numbers in day cell?
}

interface TableState {
  segPopover: {
    origFgSegs: Seg[]
    date: Date
    fgSegs: Seg[]
    top: number
    left?: number
    right? :number
  }
}

export interface TableSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}

export interface CellModel {
  date: DateMarker
  htmlAttrs?: string
}

export interface TableProps extends DomLocation {
  renderProps: TableRenderProps
  dateProfile: DateProfile
  cells: CellModel[][]
  businessHourSegs: TableSeg[]
  bgEventSegs: TableSeg[]
  fgEventSegs: TableSeg[]
  dateSelectionSegs: TableSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null

  // isRigid determines whether the individual rows should ignore the contents and be a constant height.
  // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  isRigid: boolean
}

export default class Table extends Component<TableProps, ComponentContext, TableState> {

  private renderCells = renderer(this._renderCells)
  private renderFgEvents = renderer(TableEvents)
  private renderMirrorEvents = renderer(TableMirrorEvents)
  private renderBgEvents = renderer(TableFills)
  private renderBusinessHours = renderer(TableFills)
  private renderHighlight = renderer(TableFills)
  private renderPopover = renderer(Popover)
  private renderTileForPopover = renderer(DayTile)

  bottomCoordPadding: number = 0 // hack for extending the hit area for the last row of the coordinate grid

  rowStructs: any
  rowEls: HTMLElement[] // set of fake row elements
  cellEls: HTMLElement[] // set of whole-day elements comprising the row's background

  isCellSizesDirty: boolean = false
  rowPositions: PositionCache
  colPositions: PositionCache


  render(props: TableProps, context: ComponentContext, state: TableState) {
    let segPopoverState = state.segPopover
    let colCnt = props.cells[0].length

    let { rootEl, rowEls, cellEls } = this.renderCells({
      renderProps: props.renderProps,
      dateProfile: props.dateProfile,
      cells: props.cells,
      isRigid: props.isRigid
    })

    if (props.eventDrag) {
      this.renderHighlight({
        type: 'highlight',
        renderProps: props.renderProps,
        segs: props.eventDrag.segs,
        rowEls,
        colCnt
      })
    } else {
      this.renderHighlight({
        type: 'highlight',
        renderProps: props.renderProps,
        segs: props.dateSelectionSegs,
        rowEls,
        colCnt
      })
    }

    this.renderBusinessHours({
      type: 'businessHours',
      renderProps: props.renderProps,
      segs: props.businessHourSegs,
      rowEls,
      colCnt
    })

    this.renderBgEvents({
      type: 'bgEvent',
      renderProps: props.renderProps,
      segs: props.bgEventSegs,
      rowEls,
      colCnt
    })

    let eventsRenderer = this.renderFgEvents({
      renderProps: props.renderProps,
      segs: props.fgEventSegs,
      rowEls,
      colCnt,
      selectedInstanceId: props.eventSelection,
      hiddenInstances: // TODO: more convenient
        (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
        (props.eventResize ? props.eventResize.affectedInstances : null)
    })

    if (props.eventResize) {
      this.renderMirrorEvents({
        renderProps: props.renderProps,
        segs: props.eventResize.segs,
        rowEls,
        colCnt,
        mirrorInfo: { isResizing: true, sourceSeg: props.eventResize.sourceSeg }
      })
    } else {
      this.renderMirrorEvents(false)
    }

    if (
      segPopoverState &&
      segPopoverState.origFgSegs === props.fgEventSegs // will close popover when events change
    ) {
      let viewEl = context.calendar.component.view.rootEl // yuck

      let popover = this.renderPopover({ // will be outside of all scrollers within the view
        parentEl: viewEl,
        top: segPopoverState.top,
        left: segPopoverState.left,
        right: segPopoverState.right,
        onClose: this.onPopoverClose,
        clippingEl: viewEl
      })

      this.renderTileForPopover({ // renders the close icon too, for clicking
        parentEl: popover.rootEl,
        date: state.segPopover.date,
        fgSegs: state.segPopover.fgSegs,
        selectedInstanceId: props.eventSelection,
        hiddenInstances: // TODO: more convenient
          (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
          (props.eventResize ? props.eventResize.affectedInstances : null)
      })

    } else {
      this.renderPopover(false)
      this.renderTileForPopover(false)
    }

    this.rowEls = rowEls
    this.cellEls = cellEls
    this.rowStructs = eventsRenderer.rowStructs

    return rootEl
  }


  onPopoverClose = () => {
    this.setState({ segPopover: null })
  }


  /* Date Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  _renderCells(
    { cells, isRigid, dateProfile, renderProps }: { cells: CellModel[][], isRigid: boolean, dateProfile: DateProfile, renderProps: any },
    context: ComponentContext
  ) {
    let { calendar, view, isRtl, dateEnv } = context
    let rowCnt = cells.length
    let colCnt = cells[0].length
    let html = ''
    let row
    let col

    for (row = 0; row < rowCnt; row++) {
      html += this.renderDayRowHtml(row, isRigid, cells, dateProfile, renderProps, context)
    }

    let el = createElement('div', { className: 'fc-day-grid' }, html)

    let rowEls = findElements(el, '.fc-row')
    let cellEls = findElements(el, '.fc-day, .fc-disabled-day')

    if (isRtl) {
      cellEls.reverse()
    }

    this.rowPositions = new PositionCache(
      el,
      rowEls,
      false,
      true // vertical
    )

    this.colPositions = new PositionCache(
      el,
      cellEls.slice(0, colCnt), // only the first row
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

    return {
      rootEl: el,
      rowEls,
      cellEls
    }
  }


  // Generates the HTML for a single row, which is a div that wraps a table.
  // `row` is the row number.
  renderDayRowHtml(row, isRigid, cells, dateProfile, renderProps, context: ComponentContext) {
    let { theme } = context
    let classes = [ 'fc-row', 'fc-week', theme.getClass('dayRow') ]

    if (isRigid) {
      classes.push('fc-rigid')
    }

    return '' +
      '<div class="' + classes.join(' ') + '">' +
        '<div class="fc-bg">' +
          '<table class="' + theme.getClass('tableGrid') + '">' +
            renderDayBgRowHtml({
              cells: cells[row],
              dateProfile,
              renderIntroHtml: renderProps.renderBgIntroHtml
            }, context) +
          '</table>' +
        '</div>' +
        '<div class="fc-content-skeleton">' +
          '<table>' +
            (this.getIsNumbersVisible(renderProps, cells.length) ?
              '<thead>' +
                this.renderNumberTrHtml(row, cells, dateProfile, renderProps, context) +
              '</thead>' :
              ''
              ) +
          '</table>' +
        '</div>' +
      '</div>'
  }


  getIsNumbersVisible(renderProps, rowCnt) {
    return this.getIsDayNumbersVisible(rowCnt) ||
      renderProps.cellWeekNumbersVisible ||
      renderProps.colWeekNumbersVisible
  }


  getIsDayNumbersVisible(rowCnt) {
    return rowCnt > 1
  }


  /* Grid Number Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  renderNumberTrHtml(row: number, cells, dateProfile, renderProps, context: ComponentContext) {
    let intro = renderProps.renderNumberIntroHtml(row, this)

    return '' +
      '<tr>' +
        (context.isRtl ? '' : intro) +
        this.renderNumberCellsHtml(row, cells, dateProfile, renderProps, context) +
        (context.isRtl ? intro : '') +
      '</tr>'
  }


  renderNumberCellsHtml(row, cells, dateProfile: DateProfile, renderProps, context: ComponentContext) {
    let rowCnt = cells.length
    let colCnt = cells[row].length
    let htmls = []
    let col
    let date

    for (col = 0; col < colCnt; col++) {
      date = cells[row][col].date

      htmls.push(
        this.renderNumberCellHtml(date, dateProfile, renderProps, rowCnt, context)
      )
    }

    if (context.isRtl) {
      htmls.reverse()
    }

    return htmls.join('')
  }


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  renderNumberCellHtml(date, dateProfile: DateProfile, renderProps, rowCnt, context: ComponentContext) {
    let { dateEnv, options } = context
    let html = ''
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let isDayNumberVisible = this.getIsDayNumbersVisible(rowCnt) && isDateValid
    let classes
    let weekCalcFirstDow

    if (!isDayNumberVisible && !renderProps.cellWeekNumbersVisible) {
      // no numbers in day cell (week number must be along the side)
      return '<td></td>' //  will create an empty space above events :(
    }

    classes = getDayClasses(date, dateProfile, context)
    classes.unshift('fc-day-top')

    if (renderProps.cellWeekNumbersVisible) {
      weekCalcFirstDow = dateEnv.weekDow
    }

    html += '<td class="' + classes.join(' ') + '"' +
      (isDateValid ?
        ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
        ''
        ) +
      '>'

    if (renderProps.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) {
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

    if (
      isResize ||
      this.isCellSizesDirty ||
      calendar.isEventsUpdated // hack
    ) {
      this.buildPositionCaches()
      this.isCellSizesDirty = false
    }
  }


  buildPositionCaches() {
    this.buildColPositions()
    this.buildRowPositions()
  }


  buildColPositions() {
    this.colPositions.build()
  }


  buildRowPositions() {
    let rowCnt = this.props.cells.length

    this.rowPositions.build()
    this.rowPositions.bottoms[rowCnt - 1] += this.bottomCoordPadding // hack
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
    let colCnt = this.props.cells[0].length

    return this.cellEls[row * colCnt + col]
  }


  getCellRange(row, col) {
    let start = this.props.cells[row][col].date
    let end = addDays(start, 1)

    return { start, end }
  }


  /* More+ Link Popover
  ------------------------------------------------------------------------------------------------------------------*/


  limitRows(eventLimit) {
    this._limitRows(eventLimit, this.rowEls, this.rowStructs, this.props.cells, this.context)
  }


  // Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
  // `levelLimit` can be false (don't limit), a number, or true (should be computed).
  _limitRows(levelLimit, rowEls, rowStructs, cells, context: ComponentContext) {
    let row // row #
    let rowLevelLimit

    for (row = 0; row < rowStructs.length; row++) {
      this.unlimitRow(row, rowStructs)

      if (!levelLimit) {
        rowLevelLimit = false
      } else if (typeof levelLimit === 'number') {
        rowLevelLimit = levelLimit
      } else {
        rowLevelLimit = this.computeRowLevelLimit(rowEls[row], rowStructs[row])
      }

      if (rowLevelLimit !== false) {
        this.limitRow(row, rowLevelLimit, rowEls, rowStructs, cells, context)
      }
    }
  }


  // Computes the number of levels a row will accomodate without going outside its bounds.
  // Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
  // `row` is the row number.
  computeRowLevelLimit(
    rowEl, // the containing "fake" row div
    rowStruct
  ): (number | false) {
    let rowBottom = rowEl.getBoundingClientRect().bottom // relative to viewport!
    let trEls = findDirectChildren(rowStruct.tbodyEl) as HTMLTableRowElement[]
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
  limitRow(row, levelLimit, rowEls, rowStructs, cells, context: ComponentContext) {
    let { isRtl } = context
    let colCnt = cells[0].length
    let rowStruct = rowStructs[row]
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
        segsBelow = getCellSegs(rowStructs[row], col, levelLimit)
        if (segsBelow.length) {
          td = cellMatrix[levelLimit - 1][col]
          moreLink = this.renderMoreLink(row, col, segsBelow, cells, rowEls, rowStructs, context)
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

      limitedNodes = findDirectChildren(rowStruct.tbodyEl).slice(levelLimit) // get level <tr> elements past the limit
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
          segsBelow = getCellSegs(rowStructs[row], col, levelLimit)
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
              [ seg ].concat(segsBelow), // count seg as hidden too
              cells,
              rowEls,
              rowStructs,
              context
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

      emptyCellsUntil(colCnt) // finish off the level
      rowStruct.moreEls = moreNodes // for easy undoing later
      rowStruct.limitedEls = limitedNodes // for easy undoing later
    }
  }


  // Reveals all levels and removes all "more"-related elements for a grid's row.
  // `row` is a row number.
  unlimitRow(row, rowStructs) {
    let rowStruct = rowStructs[row]

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
  renderMoreLink(row, col, hiddenSegs, cells, rowEls, rowStructs, context: ComponentContext) {
    let { calendar, view, dateEnv, options, isRtl } = context
    let rowCnt = cells.length
    let colCnt = cells[0].length

    let a = createElement('a', { className: 'fc-more' })
    a.innerText = getMoreLinkText(hiddenSegs.length, options)
    a.addEventListener('click', (ev) => {
      let clickOption = options.eventLimitClick
      let _col = isRtl ? colCnt - col - 1 : col // HACK: props.cells has different dir system?
      let date = cells[row][_col].date
      let moreEl = ev.currentTarget as HTMLElement
      let dayEl = this.getCellEl(row, col)
      let allSegs = getCellSegs(rowStructs[row], col)

      // rescope the segments to be within the cell's date
      let reslicedAllSegs = resliceDaySegs(allSegs, date)
      let reslicedHiddenSegs = resliceDaySegs(hiddenSegs, date)

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
        let _col = isRtl ? colCnt - col - 1 : col // HACK: props.cells has different dir system?
        let topEl = rowCnt === 1
          ? context.calendar.component.view.rootEl // will cause the popover to cover any sort of header
          : rowEls[row] // will align with top of row
        let left, right

        // Determine horizontal coordinate.
        // We use the moreWrap instead of the <td> to avoid border confusion.
        if (isRtl) {
          right = computeRect(moreEl.parentNode).right + 1 // +1 to be over cell border
        } else {
          left = computeRect(moreEl.parentNode).left - 1 // -1 to be over cell border
        }

        this.setState({
          segPopover: {
            origFgSegs: this.props.fgEventSegs,
            date: cells[row][_col].date,
            fgSegs: reslicedAllSegs,
            top: computeRect(topEl).top,
            left,
            right
          }
        })

      } else if (typeof clickOption === 'string') { // a view name
        calendar.zoomTo(date, clickOption)
      }
    })

    return a
  }

}


// Given the events within an array of segment objects, reslice them to be in a single day
function resliceDaySegs(segs, dayDate) {
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
function getMoreLinkText(num, options) {
  let opt = options.eventLimitText

  if (typeof opt === 'function') {
    return opt(num)
  } else {
    return '+' + num + ' ' + opt
  }
}


// Returns segments within a given cell.
// If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
function getCellSegs(rowStruct, col, startLevel?) {
  let segMatrix = rowStruct.segMatrix
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

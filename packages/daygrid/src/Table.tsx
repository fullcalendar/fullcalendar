import {
  h, Fragment, createRef,
  insertAfterElement,
  findDirectChildren,
  removeElement,
  PositionCache,
  addDays,
  EventSegUiInteractionState,
  Seg,
  intersectRanges,
  EventRenderRange,
  BaseComponent,
  ComponentContext,
  subrenderer,
  createFormatter,
  VNode
} from '@fullcalendar/core'
import TableEvents from './TableEvents'
import TableMirrorEvents from './TableMirrorEvents'
import TableFills from './TableFills'
import Popover from './Popover'
import DayTile from './DayTile'
import TableSkeleton, { TableSkeletonProps } from './TableSkeleton'


/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

export interface TableProps extends TableSkeletonProps {
  businessHourSegs: TableSeg[]
  bgEventSegs: TableSeg[]
  fgEventSegs: TableSeg[]
  dateSelectionSegs: TableSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  colGroupNode: VNode
  eventLimit: boolean | number
  vGrow: boolean
}

export interface TableSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}

interface TableState {
  segPopover: SegPopoverState
}

interface SegPopoverState {
  origFgSegs: Seg[]
  date: Date
  title: string
  fgSegs: Seg[]
  alignmentEl: HTMLElement
}


export default class Table extends BaseComponent<TableProps, TableState> {

  private renderFgEvents = subrenderer(TableEvents)
  private renderMirrorEvents = subrenderer(TableMirrorEvents)
  private renderBgEvents = subrenderer(TableFills)
  private renderBusinessHours = subrenderer(TableFills)
  private renderHighlight = subrenderer(TableFills)
  private popoverRef = createRef<Popover>()

  rowEls: HTMLElement[] // set of fake row elements
  cellEls: HTMLElement[][] // set of whole-day elements comprising the row's background
  rowStructs: any

  isCellSizesDirty: boolean = false
  rowPositions: PositionCache
  colPositions: PositionCache
  bottomCoordPadding: number = 0 // hack for extending the hit area for the last row of the coordinate grid


  render(props: TableProps) {
    return (
      <Fragment>
        <TableSkeleton
          dateProfile={props.dateProfile}
          cells={props.cells}
          isRigid={props.isRigid}
          renderNumberIntro={props.renderNumberIntro}
          renderBgIntro={props.renderBgIntro}
          renderIntro={props.renderIntro}
          colWeekNumbersVisible={props.colWeekNumbersVisible}
          cellWeekNumbersVisible={props.cellWeekNumbersVisible}
          colGroupNode={props.colGroupNode}
          elRef={props.elRef}
          onReceiveEls={this.handleSkeletonEls}
          vGrow={props.vGrow}
        />
        {this.renderPopover()}
      </Fragment>
    )
  }


  renderPopover() {
    let { props } = this
    let segPopoverState = this.state.segPopover

    if (segPopoverState && segPopoverState.origFgSegs === props.fgEventSegs) { // clear on new event segs
      return (
        <Popover
          extraClassName='fc-more-popover'
          title={segPopoverState.title}
          alignmentEl={segPopoverState.alignmentEl}
          onClose={this.handlePopoverClose}
          ref={this.popoverRef}
        >
          <DayTile
            date={segPopoverState.date}
            fgSegs={segPopoverState.fgSegs}
            selectedInstanceId={props.eventSelection}
            hiddenInstances={ // TODO: more convenient
              (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
              (props.eventResize ? props.eventResize.affectedInstances : null)
            }
          />
        </Popover>
      )
    }
  }


  handleSkeletonEls = (rowEls: HTMLElement[] | null, cellEls: HTMLElement[][] | null) => {
    let rootEl: HTMLElement = null

    if (!rowEls) {
      this.subrenderDestroy()

    } else {
      rootEl = rowEls[0].parentNode as HTMLElement

      this.rowPositions = new PositionCache(
        rootEl,
        rowEls,
        false,
        true // vertical
      )

      this.colPositions = new PositionCache(
        rootEl,
        cellEls[0], // only the first row
        true, // horizontal
        false
      )

      this.rowEls = rowEls
      this.cellEls = cellEls
      this.isCellSizesDirty = true
    }
  }


  componentDidMount() {
    this.subrender()
    this.handleSizing(false)
    this.context.addResizeHandler(this.handleSizing)
  }


  componentDidUpdate() {
    this.subrender()
    this.handleSizing(false)
  }


  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)
  }


  subrender() {
    let { props, rowEls } = this
    let colCnt = props.cells[0].length

    if (props.eventDrag && props.eventDrag.segs.length) { // messy check
      this.renderHighlight({
        type: 'highlight',
        colGroupNode: props.colGroupNode,
        renderIntro: props.renderIntro,
        segs: props.eventDrag.segs,
        rowEls,
        colCnt
      })
    } else if (props.eventResize && props.eventResize.segs.length) { // messy check
      this.renderHighlight({
        type: 'highlight',
        colGroupNode: props.colGroupNode,
        renderIntro: props.renderIntro,
        segs: props.eventResize.segs,
        rowEls,
        colCnt
      })
    } else {
      this.renderHighlight({
        type: 'highlight',
        colGroupNode: props.colGroupNode,
        renderIntro: props.renderIntro,
        segs: props.dateSelectionSegs,
        rowEls,
        colCnt
      })
    }

    this.renderBusinessHours({
      type: 'businessHours',
      colGroupNode: props.colGroupNode,
      renderIntro: props.renderIntro,
      segs: props.businessHourSegs,
      rowEls,
      colCnt
    })

    this.renderBgEvents({
      type: 'bgEvent',
      colGroupNode: props.colGroupNode,
      renderIntro: props.renderIntro,
      segs: props.bgEventSegs,
      rowEls,
      colCnt
    })

    let eventsRenderer = this.renderFgEvents({
      colGroupNode: props.colGroupNode,
      renderIntro: props.renderIntro,
      segs: props.fgEventSegs,
      rowEls,
      colCnt,
      selectedInstanceId: props.eventSelection,
      hiddenInstances: // TODO: more convenient
        (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
        (props.eventResize ? props.eventResize.affectedInstances : null),
      isDragging: false,
      isResizing: false,
      isSelecting: false
    })

    this.rowStructs = eventsRenderer.rowStructs

    if (props.eventResize) {
      this.renderMirrorEvents({
        colGroupNode: props.colGroupNode,
        renderIntro: props.renderIntro,
        segs: props.eventResize.segs,
        rowEls,
        colCnt,
        isDragging: false,
        isResizing: true,
        isSelecting: false,
        interactingSeg: props.eventResize.interactingSeg
      })
    } else {
      this.renderMirrorEvents(false)
    }
  }


  handlePopoverClose = () => {
    this.setState({ segPopover: null })
  }


  /* Sizing
  ------------------------------------------------------------------------------------------------------------------*/


  handleSizing = (forced: boolean) => {
    let { calendar } = this.context
    let popover = this.popoverRef.current

    if (
      forced ||
      this.isCellSizesDirty ||
      calendar.isEventsUpdated // hack
    ) {
      this.updateEventLimitSizing()
      this.buildPositionCaches()
      this.isCellSizesDirty = false
    }

    if (popover) {
      popover.updateSize()
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
    return this.cellEls[row][col]
  }


  getCellRange(row, col) {
    let start = this.props.cells[row][col].date
    let end = addDays(start, 1)

    return { start, end }
  }


  /* More+ Link Popover
  ------------------------------------------------------------------------------------------------------------------*/


  updateEventLimitSizing() {
    let { props, rowStructs } = this

    if (props.vGrow) {
      this._limitRows(props.eventLimit, this.rowEls, rowStructs, this.props.cells, this.context)

    } else {
      for (let row = 0; row < rowStructs.length; row++) {
        this.unlimitRow(row, rowStructs)
      }
    }
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
        this.limitRow(row, rowLevelLimit, rowStructs, cells, context)
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
  limitRow(row, levelLimit, rowStructs, cells, context: ComponentContext) {
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
          moreLink = this.renderMoreLink(row, col, segsBelow, cells, rowStructs, context)
          moreWrap = document.createElement('div')
          moreWrap.appendChild(moreLink)
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
        let { firstCol, lastCol } = seg

        emptyCellsUntil(firstCol) // process empty cells before the segment

        // determine *all* segments below `seg` that occupy the same columns
        colSegsBelow = []
        totalSegsBelow = 0
        while (col <= lastCol) {
          segsBelow = getCellSegs(rowStructs[row], col, levelLimit)
          colSegsBelow.push(segsBelow)
          totalSegsBelow += segsBelow.length
          col++
        }

        if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
          td = cellMatrix[levelLimit - 1][firstCol] // the segment's parent cell
          rowSpan = td.rowSpan || 1
          segMoreNodes = []

          // make a replacement <td> for each column the segment occupies. will be one for each colspan
          for (j = 0; j < colSegsBelow.length; j++) {
            moreTd = document.createElement('td')
            moreTd.className = 'fc-more-cell'
            moreTd.rowSpan = rowSpan
            segsBelow = colSegsBelow[j]
            moreLink = this.renderMoreLink(
              row,
              firstCol + j,
              [ seg ].concat(segsBelow), // count seg as hidden too
              cells,
              rowStructs,
              context
            )
            moreWrap = document.createElement('div')
            moreWrap.appendChild(moreLink)
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
  renderMoreLink(row, col, hiddenSegs, cells, rowStructs, context: ComponentContext) {
    let { calendar, view, dateEnv, options } = context

    let a = document.createElement('a')
    a.className = 'fc-more'
    a.innerText = getMoreLinkText(hiddenSegs.length, options)
    a.addEventListener('click', (ev) => {
      let clickOption = options.eventLimitClick
      let date = cells[row][col].date
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
        let date = cells[row][col].date
        let title = dateEnv.format(date, createFormatter(options.dayPopoverFormat)) // TODO: cache formatter

        this.setState({
          segPopover: {
            origFgSegs: this.props.fgEventSegs,
            date,
            title,
            fgSegs: reslicedAllSegs,
            alignmentEl: dayEl
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

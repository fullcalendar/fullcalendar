import {
  EventSegUiInteractionState,
  DateComponent,
  PositionCache,
  memoize,
  addDays,
  RefMap,
  DateRange,
  NowTimer,
  DateMarker,
  DateProfile,
  Hit,
  DayTableCell,
} from '@fullcalendar/core/internal'
import { VNode, createElement, Fragment } from '@fullcalendar/core/preact'
import { TableSeg, splitSegsByRow, splitInteractionByRow } from './TableSeg.js'
import { TableRow } from './TableRow.js'

export interface TableRowsProps {
  dateProfile: DateProfile
  cells: DayTableCell[][] // cells-BY-ROW
  renderRowIntro?: () => VNode
  showWeekNumbers: boolean
  clientWidth: number | null // of outer view container. weird, i know
  clientHeight: number | null // of outer view container. weird, i know
  businessHourSegs: TableSeg[]
  bgEventSegs: TableSeg[]
  fgEventSegs: TableSeg[]
  dateSelectionSegs: TableSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

export class TableRows extends DateComponent<TableRowsProps> {
  private splitBusinessHourSegs = memoize(splitSegsByRow)
  private splitBgEventSegs = memoize(splitSegsByRow)
  private splitFgEventSegs = memoize(splitSegsByRow)
  private splitDateSelectionSegs = memoize(splitSegsByRow)
  private splitEventDrag = memoize(splitInteractionByRow)
  private splitEventResize = memoize(splitInteractionByRow)
  private rootEl: HTMLElement
  private rowRefs = new RefMap<TableRow>()
  private rowPositions: PositionCache
  private colPositions: PositionCache

  render() {
    let { props, context } = this
    let rowCnt = props.cells.length

    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, rowCnt)
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, rowCnt)
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, rowCnt)
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, rowCnt)
    let eventDragByRow = this.splitEventDrag(props.eventDrag, rowCnt)
    let eventResizeByRow = this.splitEventResize(props.eventResize, rowCnt)

    // for DayGrid view with many rows, force a min-height on cells so doesn't appear squished
    // choose 7 because a month view will have max 6 rows
    let cellMinHeight = (rowCnt >= 7 && props.clientWidth) ?
      props.clientWidth / context.options.aspectRatio / 6 :
      null

    return (
      <NowTimer unit="day">{(nowDate: DateMarker, todayRange: DateRange) => (
        <Fragment>
          {props.cells.map((cells, row) => (
            <TableRow
              ref={this.rowRefs.createRef(row)}
              key={
                cells.length
                  ? cells[0].date.toISOString() /* best? or put key on cell? or use diff formatter? */
                  : row // in case there are no cells (like when resource view is loading)
              }
              showDayNumbers={rowCnt > 1}
              showWeekNumbers={props.showWeekNumbers}
              todayRange={todayRange}
              dateProfile={props.dateProfile}
              cells={cells}
              renderIntro={props.renderRowIntro}
              businessHourSegs={businessHourSegsByRow[row]}
              eventSelection={props.eventSelection}
              bgEventSegs={bgEventSegsByRow[row].filter(isSegAllDay) /* hack */}
              fgEventSegs={fgEventSegsByRow[row]}
              dateSelectionSegs={dateSelectionSegsByRow[row]}
              eventDrag={eventDragByRow[row]}
              eventResize={eventResizeByRow[row]}
              dayMaxEvents={props.dayMaxEvents}
              dayMaxEventRows={props.dayMaxEventRows}
              clientWidth={props.clientWidth}
              clientHeight={props.clientHeight}
              cellMinHeight={cellMinHeight}
              forPrint={props.forPrint}
            />
          ))}
        </Fragment>
      )}</NowTimer>
    )
  }

  componentDidMount(): void {
    this.registerInteractiveComponent()
  }

  componentDidUpdate(): void {
    // for if started with zero cells
    this.registerInteractiveComponent()
  }

  registerInteractiveComponent() {
    if (!this.rootEl) {
      // HACK: need a daygrid wrapper parent to do positioning
      // NOTE: a daygrid resource view w/o resources can have zero cells
      const firstCellEl = this.rowRefs.currentMap[0].getCellEls()[0]
      const rootEl = firstCellEl ? firstCellEl.closest('.fc-daygrid-body')! as HTMLElement : null

      if (rootEl) {
        this.rootEl = rootEl

        this.context.registerInteractiveComponent(this, {
          el: rootEl,
          isHitComboAllowed: this.props.isHitComboAllowed,
        })
      }
    }
  }

  componentWillUnmount(): void {
    if (this.rootEl) {
      this.context.unregisterInteractiveComponent(this)
      this.rootEl = null
    }
  }

  // Hit System
  // ----------------------------------------------------------------------------------------------------

  prepareHits() {
    this.rowPositions = new PositionCache(
      this.rootEl,
      this.rowRefs.collect().map((rowObj) => rowObj.getCellEls()[0]), // first cell el in each row. TODO: not optimal
      false,
      true, // vertical
    )

    this.colPositions = new PositionCache(
      this.rootEl,
      this.rowRefs.currentMap[0].getCellEls(), // cell els in first row
      true, // horizontal
      false,
    )
  }

  queryHit(positionLeft: number, positionTop: number): Hit {
    let { colPositions, rowPositions } = this
    let col = colPositions.leftToIndex(positionLeft)
    let row = rowPositions.topToIndex(positionTop)

    if (row != null && col != null) {
      let cell = this.props.cells[row][col]

      return {
        dateProfile: this.props.dateProfile,
        dateSpan: {
          range: this.getCellRange(row, col),
          allDay: true,
          ...cell.extraDateSpan,
        },
        dayEl: this.getCellEl(row, col),
        rect: {
          left: colPositions.lefts[col],
          right: colPositions.rights[col],
          top: rowPositions.tops[row],
          bottom: rowPositions.bottoms[row],
        },
        layer: 0,
      }
    }

    return null
  }

  private getCellEl(row, col) {
    return this.rowRefs.currentMap[row].getCellEls()[col] // TODO: not optimal
  }

  private getCellRange(row, col) {
    let start = this.props.cells[row][col].date
    let end = addDays(start, 1)
    return { start, end }
  }
}

function isSegAllDay(seg: TableSeg) {
  return seg.eventRange.def.allDay
}

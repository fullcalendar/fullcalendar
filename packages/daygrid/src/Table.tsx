import {
  EventSegUiInteractionState,
  VNode,
  DateComponent,
  RefObject,
  CssDimValue,
  createElement,
  PositionCache,
  memoize,
  addDays,
  RefMap,
  DateRange,
  NowTimer,
  DateMarker,
  DateProfile,
  Fragment,
  Hit,
  DayTableCell,
} from '@fullcalendar/common'
import { TableSeg, splitSegsByRow, splitInteractionByRow } from './TableSeg'
import { TableRow } from './TableRow'

export interface TableProps {
  dateProfile: DateProfile
  cells: DayTableCell[][] // cells-BY-ROW
  renderRowIntro?: () => VNode
  colGroupNode: VNode
  tableMinWidth: CssDimValue
  expandRows: boolean
  showWeekNumbers: boolean
  clientWidth: number | null
  clientHeight: number | null
  businessHourSegs: TableSeg[]
  bgEventSegs: TableSeg[]
  fgEventSegs: TableSeg[]
  dateSelectionSegs: TableSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  dayMaxEvents: boolean | number
  dayMaxEventRows: boolean | number
  headerAlignElRef?: RefObject<HTMLElement>
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

export class Table extends DateComponent<TableProps> {
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
    let { props } = this
    let { dateProfile, dayMaxEventRows, dayMaxEvents, expandRows } = props
    let rowCnt = props.cells.length

    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, rowCnt)
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, rowCnt)
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, rowCnt)
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, rowCnt)
    let eventDragByRow = this.splitEventDrag(props.eventDrag, rowCnt)
    let eventResizeByRow = this.splitEventResize(props.eventResize, rowCnt)

    let limitViaBalanced = dayMaxEvents === true || dayMaxEventRows === true

    // if rows can't expand to fill fixed height, can't do balanced-height event limit
    // TODO: best place to normalize these options?
    if (limitViaBalanced && !expandRows) {
      limitViaBalanced = false
      dayMaxEventRows = null
      dayMaxEvents = null
    }

    let classNames = [
      'fc-daygrid-body',
      limitViaBalanced ? 'fc-daygrid-body-balanced' : 'fc-daygrid-body-unbalanced', // will all row heights be equal?
      expandRows ? '' : 'fc-daygrid-body-natural', // will height of one row depend on the others?
    ]

    return (
      <div
        className={classNames.join(' ')}
        ref={this.handleRootEl}
        style={{
          // these props are important to give this wrapper correct dimensions for interactions
          // TODO: if we set it here, can we avoid giving to inner tables?
          width: props.clientWidth,
          minWidth: props.tableMinWidth,
        }}
      >
        <NowTimer unit="day">
          {(nowDate: DateMarker, todayRange: DateRange) => (
            <Fragment>
              <table
                className="fc-scrollgrid-sync-table"
                style={{
                  width: props.clientWidth,
                  minWidth: props.tableMinWidth,
                  height: expandRows ? props.clientHeight : '',
                }}
              >
                {props.colGroupNode}
                <tbody>
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
                      dateProfile={dateProfile}
                      cells={cells}
                      renderIntro={props.renderRowIntro}
                      businessHourSegs={businessHourSegsByRow[row]}
                      eventSelection={props.eventSelection}
                      bgEventSegs={bgEventSegsByRow[row].filter(isSegAllDay) /* hack */}
                      fgEventSegs={fgEventSegsByRow[row]}
                      dateSelectionSegs={dateSelectionSegsByRow[row]}
                      eventDrag={eventDragByRow[row]}
                      eventResize={eventResizeByRow[row]}
                      dayMaxEvents={dayMaxEvents}
                      dayMaxEventRows={dayMaxEventRows}
                      clientWidth={props.clientWidth}
                      clientHeight={props.clientHeight}
                      forPrint={props.forPrint}
                    />
                  ))}
                </tbody>
              </table>
            </Fragment>
          )}
        </NowTimer>
      </div>
    )
  }

  handleRootEl = (rootEl: HTMLElement | null) => {
    this.rootEl = rootEl

    if (rootEl) {
      this.context.registerInteractiveComponent(this, {
        el: rootEl,
        isHitComboAllowed: this.props.isHitComboAllowed,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
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

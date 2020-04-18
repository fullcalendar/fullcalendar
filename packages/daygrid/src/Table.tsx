import {
  EventSegUiInteractionState,
  VNode,
  DateComponent,
  RefObject,
  CssDimValue,
  h,
  PositionCache,
  Ref,
  memoize,
  addDays,
  RefMap,
  setRef,
  ComponentContext,
  DateRange,
  NowTimer,
  DateMarker,
  EventApi,
  DateProfile
} from '@fullcalendar/core'
import { TableSeg, splitSegsByRow, splitInteractionByRow } from './TableSeg'
import { TableRow } from './TableRow'
import { TableCellModel, MoreLinkArg } from './TableCell'
import { MorePopover } from './MorePopover'


export interface TableProps {
  elRef?: Ref<HTMLDivElement>
  dateProfile: DateProfile
  cells: TableCellModel[][] // cells-BY-ROW
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
}

interface TableState {
  morePopoverState: MorePopoverState | null
}

interface MorePopoverState extends MoreLinkArg {
  currentFgEventSegs: TableSeg[]
}


export class Table extends DateComponent<TableProps, TableState> {

  private splitBusinessHourSegs = memoize(splitSegsByRow)
  private splitBgEventSegs = memoize(splitSegsByRow)
  private splitFgEventSegs = memoize(splitSegsByRow)
  private splitDateSelectionSegs = memoize(splitSegsByRow)
  private splitEventDrag = memoize(splitInteractionByRow)
  private splitEventResize = memoize(splitInteractionByRow)
  private buildBuildMoreLinkText = memoize(buildBuildMoreLinkText)
  private rootEl: HTMLElement
  private rowRefs = new RefMap<TableRow>()
  private rowPositions: PositionCache
  private colPositions: PositionCache


  render(props: TableProps, state: TableState, context: ComponentContext) {
    let { dateProfile, dayMaxEventRows, dayMaxEvents, expandRows } = props
    let { morePopoverState } = state
    let rowCnt = props.cells.length

    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, rowCnt)
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, rowCnt)
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, rowCnt)
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, rowCnt)
    let eventDragByRow = this.splitEventDrag(props.eventDrag, rowCnt)
    let eventResizeByRow = this.splitEventResize(props.eventResize, rowCnt)
    let buildMoreLinkText = this.buildBuildMoreLinkText(context.options.moreLinkText)

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
      expandRows ? '' : 'fc-daygrid-body-natural' // will height of one row depend on the others?
    ]

    return (
      <div class={classNames.join(' ')} ref={this.handleRootEl} style={{
        // these props are important to give this wrapper correct dimensions for interactions
        // TODO: if we set it here, can we avoid giving to inner tables?
        width: props.clientWidth,
        minWidth: props.tableMinWidth
      }}>
        <NowTimer unit='day' content={(nowDate: DateMarker, todayRange: DateRange) => [
          <table
            className='fc-scrollgrid-sync-table'
            style={{
              width: props.clientWidth,
              minWidth: props.tableMinWidth,
              height: expandRows ? props.clientHeight : ''
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
                  bgEventSegs={bgEventSegsByRow[row]}
                  fgEventSegs={fgEventSegsByRow[row]}
                  dateSelectionSegs={dateSelectionSegsByRow[row]}
                  eventDrag={eventDragByRow[row]}
                  eventResize={eventResizeByRow[row]}
                  dayMaxEvents={dayMaxEvents}
                  dayMaxEventRows={dayMaxEventRows}
                  clientWidth={props.clientWidth}
                  buildMoreLinkText={buildMoreLinkText}
                  onMoreClick={this.handleMoreLinkClick}
                />
              ))}
            </tbody>
          </table>,
          (morePopoverState && morePopoverState.currentFgEventSegs === props.fgEventSegs) && // clear popover on event mod
            <MorePopover
              date={state.morePopoverState.date}
              dateProfile={dateProfile}
              segs={state.morePopoverState.allSegs}
              alignmentEl={state.morePopoverState.dayEl}
              topAlignmentEl={rowCnt === 1 ? props.headerAlignElRef.current : null}
              onCloseClick={this.handleMorePopoverClose}
              selectedInstanceId={props.eventSelection}
              hiddenInstances={ // yuck
                (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
                (props.eventResize ? props.eventResize.affectedInstances : null) ||
                {}
              }
              todayRange={todayRange}
            />
        ]} />
      </div>
    )
  }


  handleRootEl = (rootEl: HTMLElement | null) => {
    this.rootEl = rootEl
    setRef(this.props.elRef, rootEl)
  }


  handleMoreLinkClick = (arg: MoreLinkArg) => { // TODO: bad names "more link click" versus "more click"
    let { calendar, viewApi, options, dateEnv } = this.context
    let clickOption = options.moreLinkClick

    function segForPublic(seg: TableSeg) {
      let { def, instance, range } = seg.eventRange

      return {
        event: new EventApi(calendar, def, instance),
        start: dateEnv.toDate(range.start),
        end: dateEnv.toDate(range.end),
        isStart: seg.isStart,
        isEnd: seg.isEnd
      }
    }

    if (typeof clickOption === 'function') {
      // the returned value can be an atomic option
      // TODO: weird how we don't use the `clickOption`
      clickOption = calendar.emitter.trigger('moreLinkClick', {
        date: dateEnv.toDate(arg.date),
        allDay: true,
        allSegs: arg.allSegs.map(segForPublic),
        hiddenSegs: arg.hiddenSegs.map(segForPublic),
        jsEvent: arg.ev as MouseEvent, // TODO: better
        view: viewApi
      })
    }

    if (clickOption === 'popover') {
      this.setState({
        morePopoverState: {
          ...arg,
          currentFgEventSegs: this.props.fgEventSegs
        }
      })

    } else if (typeof clickOption === 'string') { // a view name
      calendar.zoomTo(arg.date, clickOption)
    }
  }


  handleMorePopoverClose = () => {
    this.setState({
      morePopoverState: null
    })
  }


  // Hit System
  // ----------------------------------------------------------------------------------------------------


  prepareHits() {
    this.rowPositions = new PositionCache(
      this.rootEl,
      this.rowRefs.collect().map((rowObj) => rowObj.getCellEls()[0]), // first cell el in each row. TODO: not optimal
      false,
      true // vertical
    )

    this.colPositions = new PositionCache(
      this.rootEl,
      this.rowRefs.currentMap[0].getCellEls(), // cell els in first row
      true, // horizontal
      false
    )
  }


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


  private getCellEl(row, col) {
    return this.rowRefs.currentMap[row].getCellEls()[col] // TODO: not optimal
  }


  private getCellRange(row, col) {
    let start = this.props.cells[row][col].date
    let end = addDays(start, 1)
    return { start, end }
  }

}


function buildBuildMoreLinkText(moreLinkTextInput): (num: number) => string {
  if (typeof moreLinkTextInput === 'function') {
    return moreLinkTextInput
  } else {
    return function(num) {
      return `+${num} ${moreLinkTextInput}`
    }
  }
}

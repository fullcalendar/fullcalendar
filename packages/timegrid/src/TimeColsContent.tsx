import {
  createElement, VNode,
  BaseComponent,
  EventSegUiInteractionState,
  CssDimValue,
  DateMarker,
  RefMap,
  createRef,
  PositionCache,
  memoize,
  DateRange,
  NowIndicatorRoot,
  DateProfile,
  DayTableCell,
} from '@fullcalendar/common'
import { TimeColsSeg, splitSegsByCol, splitInteractionByCol } from './TimeColsSeg'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'
import { TimeCol } from './TimeCol'

export interface TimeColsContentProps {
  axis: boolean
  cells: DayTableCell[]
  dateProfile: DateProfile
  nowDate: DateMarker
  todayRange: DateRange
  businessHourSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  fgEventSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  nowIndicatorSegs: TimeColsSeg[]
  clientWidth: number | null
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  slatCoords: TimeColsSlatsCoords
  onColCoords?: (colCoords: PositionCache) => void
  forPrint: boolean
}

export class TimeColsContent extends BaseComponent<TimeColsContentProps> { // TODO: rename
  private splitFgEventSegs = memoize(splitSegsByCol)
  private splitBgEventSegs = memoize(splitSegsByCol)
  private splitBusinessHourSegs = memoize(splitSegsByCol)
  private splitNowIndicatorSegs = memoize(splitSegsByCol)
  private splitDateSelectionSegs = memoize(splitSegsByCol)
  private splitEventDrag = memoize(splitInteractionByCol)
  private splitEventResize = memoize(splitInteractionByCol)
  private rootElRef = createRef<HTMLDivElement>()
  private cellElRefs = new RefMap<HTMLTableCellElement>()

  render() {
    let { props, context } = this
    let nowIndicatorTop =
      context.options.nowIndicator &&
      props.slatCoords &&
      props.slatCoords.safeComputeTop(props.nowDate) // might return void

    let colCnt = props.cells.length
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, colCnt)
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, colCnt)
    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, colCnt)
    let nowIndicatorSegsByRow = this.splitNowIndicatorSegs(props.nowIndicatorSegs, colCnt)
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, colCnt)
    let eventDragByRow = this.splitEventDrag(props.eventDrag, colCnt)
    let eventResizeByRow = this.splitEventResize(props.eventResize, colCnt)

    return (
      <div className="fc-timegrid-cols" ref={this.rootElRef}>
        <table style={{
          minWidth: props.tableMinWidth,
          width: props.clientWidth,
        }}
        >
          {props.tableColGroupNode}
          <tbody>
            <tr>
              {props.axis && (
                <td className="fc-timegrid-col fc-timegrid-axis">
                  <div className="fc-timegrid-col-frame">
                    <div className="fc-timegrid-now-indicator-container">
                      {typeof nowIndicatorTop === 'number' && (
                        <NowIndicatorRoot isAxis date={props.nowDate}>
                          {(rootElRef, classNames, innerElRef, innerContent) => (
                            <div
                              ref={rootElRef}
                              className={['fc-timegrid-now-indicator-arrow'].concat(classNames).join(' ')}
                              style={{ top: nowIndicatorTop }}
                            >
                              {innerContent}
                            </div>
                          )}
                        </NowIndicatorRoot>
                      )}
                    </div>
                  </div>
                </td>
              )}
              {props.cells.map((cell, i) => (
                <TimeCol
                  key={cell.key}
                  elRef={this.cellElRefs.createRef(cell.key)}
                  dateProfile={props.dateProfile}
                  date={cell.date}
                  nowDate={props.nowDate}
                  todayRange={props.todayRange}
                  extraHookProps={cell.extraHookProps}
                  extraDataAttrs={cell.extraDataAttrs}
                  extraClassNames={cell.extraClassNames}
                  extraDateSpan={cell.extraDateSpan}
                  fgEventSegs={fgEventSegsByRow[i]}
                  bgEventSegs={bgEventSegsByRow[i]}
                  businessHourSegs={businessHourSegsByRow[i]}
                  nowIndicatorSegs={nowIndicatorSegsByRow[i]}
                  dateSelectionSegs={dateSelectionSegsByRow[i]}
                  eventDrag={eventDragByRow[i]}
                  eventResize={eventResizeByRow[i]}
                  slatCoords={props.slatCoords}
                  eventSelection={props.eventSelection}
                  forPrint={props.forPrint}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  componentDidMount() {
    this.updateCoords()
  }

  componentDidUpdate() {
    this.updateCoords()
  }

  updateCoords() {
    let { props } = this

    if (
      props.onColCoords &&
      props.clientWidth !== null // means sizing has stabilized
    ) {
      props.onColCoords(
        new PositionCache(
          this.rootElRef.current,
          collectCellEls(this.cellElRefs.currentMap, props.cells),
          true, // horizontal
          false,
        ),
      )
    }
  }
}

function collectCellEls(elMap: { [key: string]: HTMLElement }, cells: DayTableCell[]) {
  return cells.map((cell) => elMap[cell.key])
}

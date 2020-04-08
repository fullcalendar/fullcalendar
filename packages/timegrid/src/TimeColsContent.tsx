import {
  h, VNode,
  BaseComponent,
  EventSegUiInteractionState,
  CssDimValue,
  DateMarker,
  RefMap,
  createRef,
  PositionCache,
  ComponentContext,
  memoize,
  DateRange,
  DateProfile,
  NowIndicatorRoot
} from '@fullcalendar/core'
import { TableCellModel } from '@fullcalendar/daygrid' // TODO: good to use this interface?
import TimeColsSeg, { splitSegsByCol, splitInteractionByCol } from './TimeColsSeg'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'
import TimeCol from './TimeCol'


export interface TimeColsContentProps {
  axis: boolean
  cells: TableCellModel[]
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
  forPrint: boolean
  clientWidth: number | null
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  slatCoords: TimeColsSlatsCoords
  onColCoords?: (colCoords: PositionCache) => void
}


export default class TimeColsContent extends BaseComponent<TimeColsContentProps> { // TODO: rename

  private splitFgEventSegs = memoize(splitSegsByCol)
  private splitBgEventSegs = memoize(splitSegsByCol)
  private splitBusinessHourSegs = memoize(splitSegsByCol)
  private splitNowIndicatorSegs = memoize(splitSegsByCol)
  private splitDateSelectionSegs = memoize(splitSegsByCol)
  private splitEventDrag = memoize(splitInteractionByCol)
  private splitEventResize = memoize(splitInteractionByCol)
  private rootElRef = createRef<HTMLDivElement>()
  private cellElRefs = new RefMap<HTMLTableCellElement>()


  render(props: TimeColsContentProps, state: {}, context: ComponentContext) {
    let nowIndicatorTop =
      context.options.nowIndicator &&
      props.slatCoords &&
      props.slatCoords.safeComputeTop(props.nowDate)

    let colCnt = props.cells.length
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, colCnt)
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, colCnt)
    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, colCnt)
    let nowIndicatorSegsByRow = this.splitNowIndicatorSegs(props.nowIndicatorSegs, colCnt)
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, colCnt)
    let eventDragByRow = this.splitEventDrag(props.eventDrag, colCnt)
    let eventResizeByRow = this.splitEventResize(props.eventResize, colCnt)

    return (
      <div class='fc-timegrid-cols' ref={this.rootElRef}>
        <table style={{
          minWidth: props.tableMinWidth,
          width: props.clientWidth
        }}>
          {props.tableColGroupNode}
          <tbody>
            <tr>
              {props.axis &&
                <td class='fc-timegrid-axis' />
              }
              {props.cells.map((cell, i) => {
                let key = cell.date.toISOString()
                return (
                  <TimeCol
                    key={key}
                    elRef={this.cellElRefs.createRef(key)}
                    date={cell.date}
                    dateProfile={props.dateProfile}
                    nowDate={props.nowDate}
                    todayRange={props.todayRange}
                    extraHookProps={cell.extraHookProps}
                    extraDataAttrs={cell.extraDataAttrs}
                    extraClassNames={cell.extraClassNames}
                    fgEventSegs={fgEventSegsByRow[i]}
                    bgEventSegs={bgEventSegsByRow[i]}
                    businessHourSegs={businessHourSegsByRow[i]}
                    nowIndicatorSegs={nowIndicatorSegsByRow[i]}
                    dateSelectionSegs={dateSelectionSegsByRow[i]}
                    eventDrag={eventDragByRow[i]}
                    eventResize={eventResizeByRow[i]}
                    slatCoords={props.slatCoords}
                    eventSelection={props.eventSelection}
                  />
                )
              })}
            </tr>
          </tbody>
        </table>
        {nowIndicatorTop != null &&
          <NowIndicatorRoot isAxis={true} date={props.nowDate}>
            {(rootElRef, classNames, innerElRef, innerContent) => (
              <div
                ref={rootElRef}
                class={[ 'fc-timegrid-now-indicator-arrow' ].concat(classNames).join(' ')}
                style={{ top: nowIndicatorTop }}
              >{innerContent}</div>
            )}
          </NowIndicatorRoot>
        }
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

    if (props.onColCoords && props.clientWidth !== null) { // means sizing has stabilized
      props.onColCoords(
        new PositionCache(
          this.rootElRef.current,
          collectCellEls(this.cellElRefs.currentMap, props.cells),
          true, // horizontal
          false
        )
      )
    }
  }

}


function collectCellEls(elMap: { [key: string]: HTMLElement }, cells: TableCellModel[]) {
  return cells.map((cell) => {
    let key = cell.date.toISOString() // store in the cell! bad to keep recomputing
    return elMap[key]
  })
}

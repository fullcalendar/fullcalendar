import {
  h, VNode, Ref,
  addDurations,
  multiplyDuration,
  wholeDivideDurations,
  DateMarker,
  BaseComponent,
  EventSegUiInteractionState,
  memoize,
  CssDimValue,
  PositionCache,
  ScrollResponder,
  ScrollRequest,
  DateRange,
  Duration,
  DateProfile
} from '@fullcalendar/core'
import { TableCellModel } from '@fullcalendar/daygrid' // TODO: good to use this interface?
import { TimeColsSlats, TimeSlatMeta } from './TimeColsSlats'
import { TimeColsContent } from './TimeColsContent'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'
import { TimeColsSeg } from './TimeColsSeg'


export interface TimeColsProps {
  cells: TableCellModel[]
  dateProfile: DateProfile
  slotDuration: Duration
  nowDate: DateMarker
  todayRange: DateRange
  businessHourSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  fgEventSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  rootElRef?: Ref<HTMLDivElement>
  tableColGroupNode: VNode
  tableMinWidth: CssDimValue
  clientWidth: number | null
  clientHeight: number | null
  expandRows: boolean
  nowIndicatorSegs: TimeColsSeg[]
  onScrollTopRequest?: (scrollTop: number) => void
  forPrint: boolean
  axis: boolean
  slatMetas: TimeSlatMeta[]
}

interface TimeColsState {
  slatCoords: TimeColsSlatsCoords | null
}


/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

export class TimeCols extends BaseComponent<TimeColsProps, TimeColsState> {

  private processSlotOptions = memoize(processSlotOptions)
  private scrollResponder: ScrollResponder
  private colCoords: PositionCache

  state = {
    slatCoords: null
  }


  render() {
    let { props, state } = this

    return (
      <div className='fc-timegrid-body' ref={props.rootElRef} style={{
        // these props are important to give this wrapper correct dimensions for interactions
        // TODO: if we set it here, can we avoid giving to inner tables?
        width: props.clientWidth,
        minWidth: props.tableMinWidth
      }}>
        <TimeColsSlats
          axis={props.axis}
          dateProfile={props.dateProfile}
          slatMetas={props.slatMetas}
          clientWidth={props.clientWidth}
          minHeight={props.expandRows ? props.clientHeight : ''}
          tableMinWidth={props.tableMinWidth}
          tableColGroupNode={props.axis ? props.tableColGroupNode : null /* axis depends on the colgroup's shrinking */}
          onCoords={this.handleSlatCoords}
        />
        <TimeColsContent
          cells={props.cells}
          axis={props.axis}
          dateProfile={props.dateProfile}
          businessHourSegs={props.businessHourSegs}
          bgEventSegs={props.bgEventSegs}
          fgEventSegs={props.fgEventSegs}
          dateSelectionSegs={props.dateSelectionSegs}
          eventSelection={props.eventSelection}
          eventDrag={props.eventDrag}
          eventResize={props.eventResize}
          todayRange={props.todayRange}
          nowDate={props.nowDate}
          nowIndicatorSegs={props.nowIndicatorSegs}
          clientWidth={props.clientWidth}
          tableMinWidth={props.tableMinWidth}
          tableColGroupNode={props.tableColGroupNode}
          slatCoords={state.slatCoords}
          onColCoords={this.handleColCoords}
          forPrint={props.forPrint}
        />
      </div>
    )
  }


  componentDidMount() {
    this.scrollResponder = this.context.createScrollResponder(this.handleScrollRequest)
  }


  componentDidUpdate(prevProps: TimeColsProps) {
    this.scrollResponder.update(prevProps.dateProfile !== this.props.dateProfile)
  }


  componentWillUnmount() {
    this.scrollResponder.detach()
  }


  handleScrollRequest = (request: ScrollRequest) => {
    let { onScrollTopRequest } = this.props
    let { slatCoords } = this.state

    if (onScrollTopRequest && slatCoords) {

      if (request.time) {
        let top = slatCoords.computeTimeTop(request.time)
        top = Math.ceil(top) // zoom can give weird floating-point values. rather scroll a little bit further
        if (top) { top++ } // to overcome top border that slots beyond the first have. looks better

        onScrollTopRequest(top)
      }

      return true
    }
  }


  handleColCoords = (colCoords: PositionCache | null) => {
    this.colCoords = colCoords
  }


  handleSlatCoords = (slatCoords: TimeColsSlatsCoords | null) => {
    this.setState({ slatCoords })
  }


  positionToHit(positionLeft, positionTop) {
    let { dateEnv, computedOptions } = this.context
    let { colCoords } = this
    let { dateProfile } = this.props
    let { slatCoords } = this.state
    let { snapDuration, snapsPerSlot } = this.processSlotOptions(this.props.slotDuration, computedOptions.snapDuration)

    let colIndex = colCoords.leftToIndex(positionLeft)
    let slatIndex = slatCoords.positions.topToIndex(positionTop)

    if (colIndex != null && slatIndex != null) {
      let slatTop = slatCoords.positions.tops[slatIndex]
      let slatHeight = slatCoords.positions.getHeight(slatIndex)
      let partial = (positionTop - slatTop) / slatHeight // floating point number between 0 and 1
      let localSnapIndex = Math.floor(partial * snapsPerSlot) // the snap # relative to start of slat
      let snapIndex = slatIndex * snapsPerSlot + localSnapIndex

      let dayDate = this.props.cells[colIndex].date
      let time = addDurations(
        dateProfile.slotMinTime,
        multiplyDuration(snapDuration, snapIndex)
      )

      let start = dateEnv.add(dayDate, time)
      let end = dateEnv.add(start, snapDuration)

      return {
        col: colIndex,
        dateSpan: {
          range: { start, end },
          allDay: false
        },
        dayEl: colCoords.els[colIndex],
        relativeRect: {
          left: colCoords.lefts[colIndex],
          right: colCoords.rights[colIndex],
          top: slatTop,
          bottom: slatTop + slatHeight
        }
      }
    }
  }

}


function processSlotOptions(slotDuration: Duration, snapDurationOverride: Duration | null) {
  let snapDuration = snapDurationOverride || slotDuration
  let snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration)

  if (snapsPerSlot === null) {
    snapDuration = slotDuration
    snapsPerSlot = 1
    // TODO: say warning?
  }

  return { snapDuration, snapsPerSlot }
}

import {
  h, VNode, Ref,
  removeElement,
  createDuration,
  addDurations,
  multiplyDuration,
  wholeDivideDurations,
  DateMarker,
  ComponentContext,
  BaseComponent,
  Seg,
  EventSegUiInteractionState,
  DateProfile,
  sortEventSegs,
  memoize,
  CssDimValue,
  PositionCache,
  Duration,
  ScrollResponder,
  ScrollRequest
} from '@fullcalendar/core'
import { DayBgCellModel } from '@fullcalendar/daygrid'
import TimeColsSlats from './TimeColsSlats'
import TimeColsContent from './TimeColsContent'
import TimeColsBg from './TimeColsBg'
import { __assign } from 'tslib'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'


export interface TimeColsProps {
  dateProfile: DateProfile
  cells: DayBgCellModel[]
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
  clientWidth: CssDimValue
  clientHeight: CssDimValue
  vGrowRows: boolean
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
  nowIndicatorDate: DateMarker
  nowIndicatorSegs: TimeColsSeg[]
  onScrollTopRequest?: (scrollTop: number) => void
  forPrint: boolean
}

export interface TimeColsSeg extends Seg {
  col: number
  start: DateMarker
  end: DateMarker
}

export const TIME_COLS_NOW_INDICATOR_UNIT = 'minute'

interface TimeColsState {
  slatCoords?: TimeColsSlatsCoords
}


/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

export default class TimeCols extends BaseComponent<TimeColsProps, TimeColsState> {

  private processSlotOptions = memoize(processSlotOptions)
  private snapDuration: Duration
  private snapsPerSlot: number
  private scrollResponder: ScrollResponder
  private colCoords: PositionCache


  render(props: TimeColsProps, state: TimeColsState, context: ComponentContext) {
    let { options } = context
    let { dateProfile } = props

    let { slotDuration, snapDuration, snapsPerSlot } = this.processSlotOptions(options)
    this.snapDuration = snapDuration
    this.snapsPerSlot = snapsPerSlot

    return (
      <div class='fc-time-grid' ref={props.rootElRef}>
        <TimeColsBg
          dateProfile={dateProfile}
          cells={props.cells}
          clientWidth={props.clientWidth}
          tableMinWidth={props.tableMinWidth}
          tableColGroupNode={props.tableColGroupNode}
          renderIntro={props.renderBgIntro}
          onCoords={this.handlColCoords}
        />
        <TimeColsSlats
          dateProfile={dateProfile}
          slotDuration={slotDuration}
          clientWidth={props.clientWidth}
          minHeight={props.vGrowRows ? props.clientHeight : ''}
          tableMinWidth={props.tableMinWidth}
          tableColGroupNode={props.tableColGroupNode}
          onCoords={this.handleSlatCoords}
        />
        <TimeColsContent
          cells={props.cells}
          renderIntro={props.renderIntro}
          businessHourSegs={props.businessHourSegs}
          bgEventSegs={props.bgEventSegs}
          fgEventSegs={props.fgEventSegs}
          dateSelectionSegs={props.dateSelectionSegs}
          eventSelection={props.eventSelection}
          eventDrag={props.eventDrag}
          eventResize={props.eventResize}
          nowIndicatorDate={props.nowIndicatorDate}
          nowIndicatorSegs={props.nowIndicatorSegs}
          clientWidth={props.clientWidth}
          tableMinWidth={props.tableMinWidth}
          tableColGroupNode={props.tableColGroupNode}
          coords={state.slatCoords}
          forPrint={props.forPrint}
        />
      </div>
    )
  }


  componentDidMount() {
    this.scrollResponder = this.context.createScrollResponder(this.handleScrollRequest)
  }


  componentDidUpdate(prevProps: TimeColsProps) {
    this.scrollResponder.update(this.props.dateProfile !== prevProps.dateProfile)
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


  handlColCoords = (colCoords: PositionCache | null) => {
    this.colCoords = colCoords
  }


  handleSlatCoords = (slatCoords: TimeColsSlatsCoords | null) => {
    this.setState({ slatCoords })
  }


  positionToHit(positionLeft, positionTop) {
    let { dateEnv } = this.context
    let { snapsPerSlot, snapDuration, colCoords } = this
    let { slatCoords } = this.state

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
        this.props.dateProfile.minTime,
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


// Given segments grouped by column, insert the segments' elements into a parallel array of container
// elements, each living within a column.
export function attachSegs({ segs, containerEls }: { segs: Seg[], containerEls: HTMLElement[] }, context: ComponentContext) {
  let segsByCol = groupSegsByCol(segs, containerEls.length)

  for (let col = 0; col < segsByCol.length; col++) {
    segsByCol[col] = sortEventSegs(segsByCol[col], context.eventOrderSpecs)
  }

  for (let col = 0; col < containerEls.length; col++) { // iterate each column grouping
    let segs = segsByCol[col]

    for (let seg of segs) {
      containerEls[col].appendChild(seg.el)
    }
  }

  return segsByCol
}


export function detachSegs(segsByCol: Seg[][]) {
  for (let segGroup of segsByCol) {
    for (let seg of segGroup) {
      removeElement(seg.el)
    }
  }
}


function groupSegsByCol(segs, colCnt) {
  let segsByCol = []
  let i

  for (i = 0; i < colCnt; i++) {
    segsByCol.push([])
  }

  for (i = 0; i < segs.length; i++) {
    segsByCol[segs[i].col].push(segs[i])
  }

  return segsByCol
}


function processSlotOptions(options) {
  let { slotDuration, snapDuration } = options
  let snapsPerSlot

  slotDuration = createDuration(slotDuration)
  snapDuration = snapDuration ? createDuration(snapDuration) : slotDuration
  snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration)

  if (snapsPerSlot === null) {
    snapDuration = slotDuration
    snapsPerSlot = 1
    // TODO: say warning?
  }

  return { slotDuration, snapDuration, snapsPerSlot }
}

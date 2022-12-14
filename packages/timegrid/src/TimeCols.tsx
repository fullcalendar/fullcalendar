import { Duration, CssDimValue } from '@fullcalendar/core'
import {
  addDurations,
  multiplyDuration,
  wholeDivideDurations,
  DateMarker,
  EventSegUiInteractionState,
  memoize,
  PositionCache,
  ScrollResponder,
  ScrollRequest,
  DateRange,
  DateProfile,
  DayTableCell,
  Hit,
  DateComponent,
} from '@fullcalendar/core/internal'
import {
  createElement,
  VNode,
} from '@fullcalendar/core/preact'
import { TimeColsSlats } from './TimeColsSlats.js'
import { TimeSlatMeta } from './time-slat-meta.js'
import { TimeColsContent } from './TimeColsContent.js'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords.js'
import { TimeColsSeg } from './TimeColsSeg.js'

export interface TimeColsProps {
  cells: DayTableCell[]
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
  onSlatCoords?: (slatCoords: TimeColsSlatsCoords) => void
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

interface TimeColsState {
  slatCoords: TimeColsSlatsCoords | null
}

/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

export class TimeCols extends DateComponent<TimeColsProps, TimeColsState> {
  private processSlotOptions = memoize(processSlotOptions)
  private scrollResponder: ScrollResponder
  private colCoords: PositionCache

  state = {
    slatCoords: null,
  }

  render() {
    let { props, state } = this

    return (
      <div
        className="fc-timegrid-body"
        ref={this.handleRootEl}
        style={{
          // these props are important to give this wrapper correct dimensions for interactions
          // TODO: if we set it here, can we avoid giving to inner tables?
          width: props.clientWidth,
          minWidth: props.tableMinWidth,
        }}
      >
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

  handleRootEl = (el: HTMLElement | null) => {
    if (el) {
      this.context.registerInteractiveComponent(this, {
        el,
        isHitComboAllowed: this.props.isHitComboAllowed,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
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
        if (top) {
          top += 1 // to overcome top border that slots beyond the first have. looks better
        }

        onScrollTopRequest(top)
      }

      return true
    }

    return false
  }

  handleColCoords = (colCoords: PositionCache | null) => {
    this.colCoords = colCoords
  }

  handleSlatCoords = (slatCoords: TimeColsSlatsCoords | null) => {
    this.setState({ slatCoords })

    if (this.props.onSlatCoords) {
      this.props.onSlatCoords(slatCoords)
    }
  }

  queryHit(positionLeft: number, positionTop: number): Hit {
    let { dateEnv, options } = this.context
    let { colCoords } = this
    let { dateProfile } = this.props
    let { slatCoords } = this.state
    let { snapDuration, snapsPerSlot } = this.processSlotOptions(this.props.slotDuration, options.snapDuration)

    let colIndex = colCoords.leftToIndex(positionLeft)
    let slatIndex = slatCoords.positions.topToIndex(positionTop)

    if (colIndex != null && slatIndex != null) {
      let cell = this.props.cells[colIndex]
      let slatTop = slatCoords.positions.tops[slatIndex]
      let slatHeight = slatCoords.positions.getHeight(slatIndex)
      let partial = (positionTop - slatTop) / slatHeight // floating point number between 0 and 1
      let localSnapIndex = Math.floor(partial * snapsPerSlot) // the snap # relative to start of slat
      let snapIndex = slatIndex * snapsPerSlot + localSnapIndex

      let dayDate = this.props.cells[colIndex].date
      let time = addDurations(
        dateProfile.slotMinTime,
        multiplyDuration(snapDuration, snapIndex),
      )

      let start = dateEnv.add(dayDate, time)
      let end = dateEnv.add(start, snapDuration)

      return {
        dateProfile,
        dateSpan: {
          range: { start, end },
          allDay: false,
          ...cell.extraDateSpan,
        },
        dayEl: colCoords.els[colIndex],
        rect: {
          left: colCoords.lefts[colIndex],
          right: colCoords.rights[colIndex],
          top: slatTop,
          bottom: slatTop + slatHeight,
        },
        layer: 0,
      }
    }

    return null
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

import {
  h, createRef, VNode,
  DateComponent,
  DateProfile,
  EventStore,
  EventUiHash,
  EventInteractionState,
  DateSpan,
  memoize,
  intersectRanges, DateRange,
  DayTableModel,
  DateEnv,
  DateMarker,
  Slicer,
  Hit,
  ComponentContext,
  subrenderer,
  NowTimer
} from '@fullcalendar/core'
import TimeCols, { TimeColsSeg, TIME_COLS_NOW_INDICATOR_UNIT } from './TimeCols'


export interface DayTimeColsProps {
  dateProfile: DateProfile | null
  dayTableModel: DayTableModel
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  colGroupNode: VNode
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
}

interface DayTimeColsState {
  nowIndicatorDate: DateMarker
}


export default class DayTimeCols extends DateComponent<DayTimeColsProps, DayTimeColsState> {

  private buildDayRanges = memoize(buildDayRanges)
  private updateNowTimer = subrenderer(NowTimer)
  private dayRanges: DateRange[] // for now indicator
  private slicer = new DayTimeColsSlicer()
  private timeColsRef = createRef<TimeCols>()

  get timeCols() { return this.timeColsRef.current } // used for view's computeDateScroll :(


  render(props: DayTimeColsProps, state: DayTimeColsState, context: ComponentContext) {
    let { dateEnv } = context
    let { dateProfile, dayTableModel } = props
    let dayRanges = this.dayRanges = this.buildDayRanges(dayTableModel, dateProfile, dateEnv)

    // give it the first row of cells
    return (
      <TimeCols
        ref={this.timeColsRef}
        rootElRef={this.handleRootEl}
        {...this.slicer.sliceProps(props, dateProfile, null, context.calendar, dayRanges)}
        dateProfile={dateProfile}
        cells={dayTableModel.cells[0]}
        colGroupNode={props.colGroupNode}
        renderBgIntro={props.renderBgIntro}
        renderIntro={props.renderIntro}
        nowIndicatorDate={state.nowIndicatorDate}
        nowIndicatorSegs={state.nowIndicatorDate && this.slicer.sliceNowDate(state.nowIndicatorDate, this.context.calendar, this.dayRanges)}
      />
    )
  }


  handleRootEl = (rootEl: HTMLDivElement | null) => {
    let { calendar } = this.context

    if (rootEl) {
      calendar.registerInteractiveComponent(this, { el: rootEl })
    } else {
      calendar.unregisterInteractiveComponent(this)
    }
  }


  componentDidMount() {
    this.subrender()
  }


  componentDidUpdate() {
    this.subrender()
  }


  componentWillUnmount() {
    this.subrenderDestroy()
  }


  subrender() {
    this.updateNowTimer({
      enabled: this.context.options.nowIndicator,
      unit: TIME_COLS_NOW_INDICATOR_UNIT,
      callback: this.handleNowDate
    })
  }


  handleNowDate = (date: DateMarker) => {
    this.setState({
      nowIndicatorDate: date
    })
  }


  buildPositionCaches() {
    this.timeCols.buildPositionCaches()
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.timeCols.positionToHit(positionLeft, positionTop)

    if (rawHit) {
      return {
        component: this,
        dateSpan: rawHit.dateSpan,
        dayEl: rawHit.dayEl,
        rect: {
          left: rawHit.relativeRect.left,
          right: rawHit.relativeRect.right,
          top: rawHit.relativeRect.top,
          bottom: rawHit.relativeRect.bottom
        },
        layer: 0
      }
    }
  }

}


export function buildDayRanges(dayTableModel: DayTableModel, dateProfile: DateProfile, dateEnv: DateEnv): DateRange[] {
  let ranges: DateRange[] = []

  for (let date of dayTableModel.headerDates) {
    ranges.push({
      start: dateEnv.add(date, dateProfile.minTime),
      end: dateEnv.add(date, dateProfile.maxTime)
    })
  }

  return ranges
}


export class DayTimeColsSlicer extends Slicer<TimeColsSeg, [DateRange[]]> {

  sliceRange(range: DateRange, dayRanges: DateRange[]): TimeColsSeg[] {
    let segs: TimeColsSeg[] = []

    for (let col = 0; col < dayRanges.length; col++) {
      let segRange = intersectRanges(range, dayRanges[col])

      if (segRange) {
        segs.push({
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col
        })
      }
    }

    return segs
  }

}

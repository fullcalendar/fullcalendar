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
  ComponentContext
} from '@fullcalendar/core'
import TimeCols, { TimeColsSeg } from './TimeCols'


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
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
}


export default class DayTimeCols extends DateComponent<DayTimeColsProps> {

  private buildDayRanges = memoize(buildDayRanges)
  private dayRanges: DateRange[] // for now indicator
  private slicer = new DayTimeColsSlicer()
  private timeColsRef = createRef<TimeCols>()

  get timeCols() { return this.timeColsRef.current }


  render(props: DayTimeColsProps, state: {}, context: ComponentContext) {
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
        renderBgIntro={props.renderBgIntro}
        renderIntro={props.renderIntro}
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


  updateSize(isResize: boolean) {
    this.timeCols.updateSize(isResize)
  }


  getNowIndicatorUnit() {
    return this.timeCols.getNowIndicatorUnit()
  }


  renderNowIndicator(date: DateMarker) {
    this.timeCols.renderNowIndicator(
      this.slicer.sliceNowDate(date, this.context.calendar, this.dayRanges),
      date
    )
  }


  unrenderNowIndicator() {
    this.timeCols.unrenderNowIndicator()
  }


  buildPositionCaches() {
    this.timeCols.buildPositionCaches()
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let timeCols = this.timeColsRef.current
    let rawHit = timeCols.positionToHit(positionLeft, positionTop)

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

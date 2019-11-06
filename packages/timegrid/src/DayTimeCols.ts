import {
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
  renderer,
  DomLocation
} from '@fullcalendar/core'
import TimeCols, { TimeColsSeg, TimeColsRenderProps } from './TimeCols'

export interface DayTimeColsProps extends DomLocation {
  renderProps: TimeColsRenderProps
  dateProfile: DateProfile | null
  dayTableModel: DayTableModel
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
}

export default class DayTimeCols extends DateComponent<DayTimeColsProps> {

  private buildDayRanges = memoize(buildDayRanges)
  private renderTimeCols = renderer(TimeCols)
  private registerInteractive = renderer(this._registerInteractive, this._unregisterInteractive)

  private dayRanges: DateRange[] // for now indicator
  private slicer = new DayTimeColsSlicer()
  timeCols: TimeCols


  render(props: DayTimeColsProps, context: ComponentContext) {
    let { dateEnv } = context
    let { dateProfile, dayTableModel } = props

    let dayRanges = this.buildDayRanges(dayTableModel, dateProfile, dateEnv)

    let timeCols = this.renderTimeCols({
      ...this.slicer.sliceProps(props, dateProfile, null, context.calendar, dayRanges),
      renderProps: props.renderProps,
      dateProfile,
      cells: dayTableModel.cells[0] // give the first row
    })

    this.registerInteractive({ el: timeCols.rootEl })

    this.dayRanges = dayRanges
    this.timeCols = timeCols

    return timeCols
  }


  _registerInteractive({ el }: { el: HTMLElement }, context: ComponentContext) {
    context.calendar.registerInteractiveComponent(this, { el })
  }


  _unregisterInteractive(funcState: void, context: ComponentContext) {
    context.calendar.unregisterInteractiveComponent(this)
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

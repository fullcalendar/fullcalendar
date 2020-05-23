import {
  createElement, createRef, VNode,
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
  NowTimer,
  CssDimValue,
  Duration
} from '@fullcalendar/common'
import { TimeColsSeg } from './TimeColsSeg'
import { TimeCols } from './TimeCols'
import { TimeSlatMeta } from './TimeColsSlats'


export interface DayTimeColsProps {
  dateProfile: DateProfile
  dayTableModel: DayTableModel
  axis: boolean
  slotDuration: Duration
  slatMetas: TimeSlatMeta[]
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
  tableColGroupNode: VNode
  tableMinWidth: CssDimValue
  clientWidth: number | null
  clientHeight: number | null
  expandRows: boolean
  onScrollTopRequest?: (scrollTop: number) => void
  forPrint: boolean
}


export class DayTimeCols extends DateComponent<DayTimeColsProps> {

  private buildDayRanges = memoize(buildDayRanges)
  private slicer = new DayTimeColsSlicer()
  private timeColsRef = createRef<TimeCols>()


  render() {
    let { props, context } = this
    let { dateProfile, dayTableModel } = props

    let isNowIndicator = context.options.nowIndicator
    let dayRanges = this.buildDayRanges(dayTableModel, dateProfile, context.dateEnv)

    // give it the first row of cells
    // TODO: would move this further down hierarchy, but sliceNowDate needs it
    return (
      <NowTimer unit={isNowIndicator ? 'minute' : 'day'}>
        {(nowDate: DateMarker, todayRange: DateRange) => (
          <TimeCols
            ref={this.timeColsRef}
            rootElRef={this.handleRootEl}
            {...this.slicer.sliceProps(props, dateProfile, null, context, dayRanges)}
            forPrint={props.forPrint}
            axis={props.axis}
            dateProfile={dateProfile}
            slatMetas={props.slatMetas}
            slotDuration={props.slotDuration}
            cells={dayTableModel.cells[0]}
            tableColGroupNode={props.tableColGroupNode}
            tableMinWidth={props.tableMinWidth}
            clientWidth={props.clientWidth}
            clientHeight={props.clientHeight}
            expandRows={props.expandRows}
            nowDate={nowDate}
            nowIndicatorSegs={isNowIndicator && this.slicer.sliceNowDate(nowDate, context, dayRanges)}
            todayRange={todayRange}
            onScrollTopRequest={props.onScrollTopRequest}
          />
        )}
      </NowTimer>
    )
  }


  handleRootEl = (rootEl: HTMLDivElement | null) => {
    if (rootEl) {
      this.context.registerInteractiveComponent(this, { el: rootEl })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }


  queryHit(positionLeft: number, positionTop: number): Hit {
    let rawHit = this.timeColsRef.current.positionToHit(positionLeft, positionTop)

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
      start: dateEnv.add(date, dateProfile.slotMinTime),
      end: dateEnv.add(date, dateProfile.slotMaxTime)
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

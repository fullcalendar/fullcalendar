import { DateComponent } from '../../component/DateComponent'
import { DateMarker, DateRange } from '@full-ui/headless-calendar'
import { EventRangeProps } from '../../component-util/event-rendering'
import { memoize } from '../../util/memoize'
import { NowTimer } from '../../NowTimer'
import { ViewProps } from '../../component-util/View'
import { buildDateRowConfigs } from '../../daygrid/header-tier'
import { createDayHeaderFormatter } from '../../daygrid/components/util'
import { DayTableSlicer } from '../../daygrid/DayTableSlicer'
import { AllDaySplitter } from "../AllDaySplitter"
import { DayTimeColsSlicer } from "../DayTimeColsSlicer"
import { organizeSegsByCol, splitInteractionByCol, TimeGridRange } from "../TimeColsSeg"
import { TimeGridLayout } from './TimeGridLayout'
import { buildDayRanges, buildTimeColsModel } from "./util"

export class TimeGridView extends DateComponent<ViewProps> {
  // memo
  private createDayHeaderFormatter = memoize(createDayHeaderFormatter)
  private buildTimeColsModel = memoize(buildTimeColsModel)
  private buildDayRanges = memoize(buildDayRanges)
  private buildDateRowConfigs = memoize(buildDateRowConfigs)
  private splitFgEventSegs = memoize(organizeSegsByCol<TimeGridRange & EventRangeProps>)
  private splitBgEventSegs = memoize(organizeSegsByCol<TimeGridRange & EventRangeProps>)
  private splitBusinessHourSegs = memoize(organizeSegsByCol<TimeGridRange & EventRangeProps>)
  private splitNowIndicatorSegs = memoize(organizeSegsByCol<TimeGridRange>)
  private splitDateSelectionSegs = memoize(organizeSegsByCol<TimeGridRange & EventRangeProps>)
  private splitEventDrag = memoize(splitInteractionByCol)
  private splitEventResize = memoize(splitInteractionByCol)

  // internal
  private allDaySplitter = new AllDaySplitter()
  private dayTableSlicer = new DayTableSlicer()
  private dayTimeColsSlicer = new DayTimeColsSlicer()

  render() {
    const { props, context } = this
    const { dateProfile } = props
    const { options, dateProfileGenerator } = context

    const dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator, context.dateEnv)
    const dayRanges = this.buildDayRanges(dayTableModel, dateProfile, context.dateEnv)
    const splitProps = this.allDaySplitter.splitProps(props)
    const allDayProps = this.dayTableSlicer.sliceProps(
      splitProps.allDay,
      dateProfile,
      options.nextDayThreshold,
      context,
      dayTableModel,
    )
    const timedProps = this.dayTimeColsSlicer.sliceProps(
      splitProps.timed,
      dateProfile,
      null,
      context,
      dayRanges,
    )
    const dayHeaderFormat = this.createDayHeaderFormatter(
      context.options.dayHeaderFormat,
      true, // datesRepDistinctDays
      dayTableModel.colCount,
    )

    return (
      <NowTimer unit={options.nowIndicator ? 'minute' : 'day' /* hacky */}>
        {(nowDate: DateMarker, todayRange: DateRange) => {
          const colCount = dayTableModel.cellRows[0].length
          const nowIndicatorSeg = !props.forPrint && options.nowIndicator &&
            this.dayTimeColsSlicer.sliceNowDate(nowDate, dateProfile, options.nextDayThreshold, context, dayRanges)

          const fgEventSegsByCol = this.splitFgEventSegs(timedProps.fgEventSegs, colCount)
          const bgEventSegsByCol = this.splitBgEventSegs(timedProps.bgEventSegs, colCount)
          const businessHourSegsByCol = this.splitBusinessHourSegs(timedProps.businessHourSegs, colCount)
          const nowIndicatorSegsByCol = this.splitNowIndicatorSegs(nowIndicatorSeg, colCount)
          const dateSelectionSegsByCol = this.splitDateSelectionSegs(timedProps.dateSelectionSegs, colCount)
          const eventDragByCol = this.splitEventDrag(timedProps.eventDrag, colCount)
          const eventResizeByCol = this.splitEventResize(timedProps.eventResize, colCount)

          const headerTiers = this.buildDateRowConfigs(
            dayTableModel.headerDates,
            true, // datesRepDistinctDays
            props.dateProfile,
            todayRange,
            dayHeaderFormat,
            context,
          )

          return (
            <TimeGridLayout
              labelId={props.labelId}
              labelStr={props.labelStr}

              dateProfile={dateProfile}
              nowDate={nowDate}
              todayRange={todayRange}
              cells={dayTableModel.cellRows[0]}
              forPrint={props.forPrint}
              className={props.className}

              // header content
              headerTiers={headerTiers}

              // all-day content
              fgEventSegs={allDayProps.fgEventSegs}
              bgEventSegs={allDayProps.bgEventSegs}
              businessHourSegs={allDayProps.businessHourSegs}
              dateSelectionSegs={allDayProps.dateSelectionSegs}
              eventDrag={allDayProps.eventDrag}
              eventResize={allDayProps.eventResize}

              // timed content
              fgEventSegsByCol={fgEventSegsByCol}
              bgEventSegsByCol={bgEventSegsByCol}
              businessHourSegsByCol={businessHourSegsByCol}
              nowIndicatorSegsByCol={nowIndicatorSegsByCol}
              dateSelectionSegsByCol={dateSelectionSegsByCol}
              eventDragByCol={eventDragByCol}
              eventResizeByCol={eventResizeByCol}

              // universal content
              eventSelection={props.eventSelection}
            />
          )
        }}
      </NowTimer>
    )
  }
}

import { BaseComponent } from '../../vdom-util'
import { DateMarker, DateRange } from '@full-ui/headless-calendar'
import { memoize } from '../../util/memoize'
import { NowTimer } from '../../NowTimer'
import { ViewProps } from '../../component-util/View'
import { DayTableSlicer } from '../DayTableSlicer'
import { buildDateRowConfigs } from '../header-tier'
import { DayGridLayout } from './DayGridLayout'
import { createDayHeaderFormatter } from './util'
import { buildDayTableModel } from './util'

export class DayGridView extends BaseComponent<ViewProps> {
  // memo
  private buildDayTableModel = memoize(buildDayTableModel)
  private buildDateRowConfigs = memoize(buildDateRowConfigs)
  private createDayHeaderFormatter = memoize(createDayHeaderFormatter)

  // internal
  private slicer = new DayTableSlicer()

  render() {
    const { props, context } = this
    const { dateProfile } = props
    const { options, dateEnv } = context
    const dayTableModel = this.buildDayTableModel(dateProfile, context.dateProfileGenerator, dateEnv)
    const datesRepDistinctDays = dayTableModel.rowCount === 1
    const dayHeaderFormat = this.createDayHeaderFormatter(
      context.options.dayHeaderFormat,
      datesRepDistinctDays,
      dayTableModel.colCount,
    )
    const slicedProps = this.slicer.sliceProps(props, dateProfile, options.nextDayThreshold, context, dayTableModel)

    return (
      <NowTimer unit="day">
        {(nowDate: DateMarker, todayRange: DateRange) => {
          const headerTiers = this.buildDateRowConfigs(
            dayTableModel.headerDates,
            datesRepDistinctDays,
            dateProfile,
            todayRange,
            dayHeaderFormat,
            context,
          )

          return (
            <DayGridLayout
              labelId={props.labelId}
              labelStr={props.labelStr}
              dateProfile={dateProfile}
              todayRange={todayRange}
              cellRows={dayTableModel.cellRows}
              forPrint={props.forPrint}
              className={props.className}

              // header content
              headerTiers={headerTiers}

              // body content
              fgEventSegs={slicedProps.fgEventSegs}
              bgEventSegs={slicedProps.bgEventSegs}
              businessHourSegs={slicedProps.businessHourSegs}
              dateSelectionSegs={slicedProps.dateSelectionSegs}
              eventDrag={slicedProps.eventDrag}
              eventResize={slicedProps.eventResize}
              eventSelection={slicedProps.eventSelection}
            />
          )
        }}
      </NowTimer>
    )
  }
}

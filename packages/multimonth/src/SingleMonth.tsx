import { CssDimValue } from '@fullcalendar/core'
import { DateComponent, DayHeader, ViewProps, memoize, DateFormatter, getUniqueDomId } from '@fullcalendar/core/internal'
import { TableRows, buildDayTableModel, DayTableSlicer } from '@fullcalendar/daygrid/internal'
import { createElement, Ref } from '@fullcalendar/core/preact'

export interface SingleMonthProps extends ViewProps {
  elRef?: Ref<HTMLDivElement>
  titleFormat: DateFormatter
  width: CssDimValue
  tableHeight: CssDimValue
  clientWidth: number | null
  clientHeight: number | null
}

interface SingleMonthState {
  labelId: string
}

export class SingleMonth extends DateComponent<SingleMonthProps, SingleMonthState> {
  private buildDayTableModel = memoize(buildDayTableModel)
  private slicer = new DayTableSlicer()

  state: SingleMonthState = {
    labelId: getUniqueDomId(),
  }

  render() {
    const { props, state, context } = this
    const { options } = context
    const dayTableModel = this.buildDayTableModel(props.dateProfile, context.dateProfileGenerator)

    return (
      <div
        ref={props.elRef}
        className="fc-multimonth-month"
        style={{ width: props.width }}
        role="grid"
        aria-labelledby={state.labelId}
      >
        <div className="fc-multimonth-header" role="presentation">
          <div className="fc-multimonth-title" id={state.labelId}>
            {context.dateEnv.format(
              props.dateProfile.currentRange.start,
              props.titleFormat,
            )}
          </div>
          <table
            className="fc-multimonth-header-table"
            role="presentation"
          >
            <thead role="rowgroup">
              <DayHeader
                dateProfile={props.dateProfile}
                dates={dayTableModel.headerDates}
                datesRepDistinctDays={false}
              />
            </thead>
          </table>
        </div>
        <div className={[
          'fc-multimonth-daygrid',
          'fc-daygrid',
          'fc-daygrid-body', // necessary for TableRows DnD parent
          'fc-daygrid-body-balanced',
        ].join(' ')}>
          <table
            className="fc-multimonth-daygrid-table"
            style={{ height: props.tableHeight }}
            role="presentation"
          >
            <tbody role="rowgroup">
              <TableRows
                {...this.slicer.sliceProps(props, props.dateProfile, options.nextDayThreshold, context, dayTableModel)}
                dateProfile={props.dateProfile}
                cells={dayTableModel.cells}
                eventSelection={props.eventSelection}
                dayMaxEvents={true}
                dayMaxEventRows={true}
                showWeekNumbers={options.weekNumbers}
                clientWidth={props.clientWidth}
                clientHeight={props.clientHeight}
                forPrint={props.forPrint}
              />
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

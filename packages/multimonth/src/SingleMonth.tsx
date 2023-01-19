import { CssDimValue } from '@fullcalendar/core'
import { DateComponent, DayHeader, ViewProps, memoize } from '@fullcalendar/core/internal'
import { TableRows, buildDayTableModel, DayTableSlicer } from '@fullcalendar/daygrid/internal'
import { createElement } from '@fullcalendar/core/preact'

export interface SingleMonthProps extends ViewProps {
  clientWidth: number | null
  clientHeight: number | null
  tableHeight: CssDimValue
}

export class SingleMonth extends DateComponent<SingleMonthProps> {
  private buildDayTableModel = memoize(buildDayTableModel)
  private slicer = new DayTableSlicer()

  render() {
    const { props, context } = this
    const { options } = context
    const dayTableModel = this.buildDayTableModel(props.dateProfile, context.dateProfileGenerator)
    const dayGridClassNames = [
      'fc-multimonth-daygrid',
      'fc-daygrid',
      'fc-daygrid-body', // necessary for TableRows DnD parent
      'fc-daygrid-body-balanced',
    ]

    return (
      <div className={dayGridClassNames.join(' ')}>
        <table className="fc-multimonth-daygrid-table" style={{ height: props.tableHeight }}>
          <thead>
            <DayHeader
              dateProfile={props.dateProfile}
              dates={dayTableModel.headerDates}
              datesRepDistinctDays={false}
            />
          </thead>
          <tbody>
            <TableRows
              {...this.slicer.sliceProps(props, props.dateProfile, options.nextDayThreshold, context, dayTableModel)}
              dateProfile={props.dateProfile}
              cells={dayTableModel.cells}
              eventSelection={props.eventSelection}
              dayMaxEvents={options.dayMaxEvents}
              dayMaxEventRows={options.dayMaxEventRows}
              showWeekNumbers={options.weekNumbers}
              clientWidth={props.clientWidth}
              clientHeight={props.clientHeight}
              forPrint={props.forPrint}
            />
          </tbody>
        </table>
      </div>
    )
  }
}

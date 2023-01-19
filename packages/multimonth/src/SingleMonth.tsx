import { DateComponent, DayHeader, ViewProps, memoize } from '@fullcalendar/core/internal'
import { TableRows, buildDayTableModel, DayTableSlicer } from '@fullcalendar/daygrid/internal'
import { createElement } from '@fullcalendar/core/preact'

/*
Accepts all ViewProps but isn't actually a view!
*/
export class SingleMonth extends DateComponent<ViewProps> {
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
        <table className="fc-multimonth-daygrid-table">
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
              eventDrag={props.eventDrag as any}
              eventResize={props.eventResize as any}
              dayMaxEvents={options.dayMaxEvents}
              dayMaxEventRows={options.dayMaxEventRows}
              showWeekNumbers={options.weekNumbers}
              clientWidth={null}
              clientHeight={null}
              forPrint={props.forPrint}
            />
          </tbody>
        </table>
      </div>
    )
  }
}

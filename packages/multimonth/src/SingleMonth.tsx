import { CssDimValue } from '@fullcalendar/core'
import { DateComponent, DayHeader, ViewProps, memoize, DateFormatter, getUniqueDomId } from '@fullcalendar/core/internal'
import { TableRows, buildDayTableModel, DayTableSlicer } from '@fullcalendar/daygrid/internal'
import { createElement, Ref } from '@fullcalendar/core/preact'

export interface SingleMonthProps extends ViewProps {
  elRef?: Ref<HTMLDivElement>
  titleFormat: DateFormatter
  width: CssDimValue
  tableWidth: number | null // solely for computation purposes
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
    const slicedProps = this.slicer.sliceProps(props, props.dateProfile, options.nextDayThreshold, context, dayTableModel)

    // ensure day-cell aspect ratio
    const rowCnt = dayTableModel.cells.length
    const rowHeight = props.tableWidth == null ? null :
      props.tableWidth / options.aspectRatio / 6
    const tableHeight = rowHeight == null ? null :
      rowHeight * rowCnt

    return (
      <div
        ref={props.elRef}
        className="fc-multimonth-month"
        style={{ width: props.width }}
        role="grid"
        aria-labelledby={state.labelId}
      >
        <div
          className="fc-multimonth-header"
          style={{ marginBottom: rowHeight }} // for stickyness
          role="presentation"
        >
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
        <div
          className={[
            'fc-multimonth-daygrid',
            'fc-daygrid',
            'fc-daygrid-body', // necessary for TableRows DnD parent
            'fc-daygrid-body-balanced',
          ].join(' ')}
          style={{ marginTop: -rowHeight }} // for stickyness
        >
          <table
            className="fc-multimonth-daygrid-table"
            style={{ height: tableHeight }}
            role="presentation"
          >
            <tbody role="rowgroup">
              <TableRows
                {...slicedProps}
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

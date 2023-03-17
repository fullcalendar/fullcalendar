import { CssDimValue } from '@fullcalendar/core'
import { DateComponent, DayHeader, ViewProps, memoize, DateFormatter, getUniqueDomId } from '@fullcalendar/core/internal'
import { TableRows, buildDayTableModel, DayTableSlicer } from '@fullcalendar/daygrid/internal'
import { createElement, Ref } from '@fullcalendar/core/preact'

export interface SingleMonthProps extends ViewProps {
  elRef?: Ref<HTMLDivElement>
  isoDateStr?: string
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
    const { dateProfile, forPrint } = props
    const { options } = context
    const dayTableModel = this.buildDayTableModel(dateProfile, context.dateProfileGenerator)
    const slicedProps = this.slicer.sliceProps(props, dateProfile, options.nextDayThreshold, context, dayTableModel)

    // ensure single-month has aspect ratio
    const tableHeight = props.tableWidth != null ? props.tableWidth / options.aspectRatio : null
    const rowCnt = dayTableModel.cells.length
    const rowHeight = tableHeight != null ? tableHeight / rowCnt : null

    return (
      <div
        ref={props.elRef}
        data-date={props.isoDateStr}
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
            className={[
              'fc-multimonth-header-table',
              context.theme.getClass('table'),
            ].join(' ')}
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
            !forPrint && 'fc-daygrid-body-balanced',
            forPrint && 'fc-daygrid-body-unbalanced',
            forPrint && 'fc-daygrid-body-natural',
          ].join(' ')}
          style={{ marginTop: -rowHeight }} // for stickyness
        >
          <table
            className={[
              'fc-multimonth-daygrid-table',
              context.theme.getClass('table'),
            ].join(' ')}
            style={{ height: forPrint ? '' : tableHeight }}
            role="presentation"
          >
            <tbody role="rowgroup">
              <TableRows
                {...slicedProps}
                dateProfile={dateProfile}
                cells={dayTableModel.cells}
                eventSelection={props.eventSelection}
                dayMaxEvents={!forPrint}
                dayMaxEventRows={!forPrint}
                showWeekNumbers={options.weekNumbers}
                clientWidth={props.clientWidth}
                clientHeight={props.clientHeight}
                forPrint={forPrint}
              />
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

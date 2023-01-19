import { CssDimValue } from '@fullcalendar/core'
import { DateComponent } from '@fullcalendar/core/internal'
import { VNode, RefObject, createElement } from '@fullcalendar/core/preact'
import { TableRows, TableRowsProps } from './TableRows.js'

export interface TableProps extends TableRowsProps {
  colGroupNode: VNode
  tableMinWidth: CssDimValue
  expandRows: boolean
  headerAlignElRef?: RefObject<HTMLElement>
}

export class Table extends DateComponent<TableProps> {
  render() {
    let { props } = this
    let { dayMaxEventRows, dayMaxEvents, expandRows } = props
    let limitViaBalanced = dayMaxEvents === true || dayMaxEventRows === true

    // if rows can't expand to fill fixed height, can't do balanced-height event limit
    // TODO: best place to normalize these options?
    if (limitViaBalanced && !expandRows) {
      limitViaBalanced = false
      dayMaxEventRows = null
      dayMaxEvents = null
    }

    let classNames = [
      'fc-daygrid-body', // necessary for TableRows DnD parent
      limitViaBalanced ? 'fc-daygrid-body-balanced' : 'fc-daygrid-body-unbalanced', // will all row heights be equal?
      expandRows ? '' : 'fc-daygrid-body-natural', // will height of one row depend on the others?
    ]

    return (
      <div
        className={classNames.join(' ')}
        style={{
          // these props are important to give this wrapper correct dimensions for interactions
          // TODO: if we set it here, can we avoid giving to inner tables?
          width: props.clientWidth,
          minWidth: props.tableMinWidth,
        }}
      >
        <table
          role="presentation"
          className="fc-scrollgrid-sync-table"
          style={{
            width: props.clientWidth,
            minWidth: props.tableMinWidth,
            height: expandRows ? props.clientHeight : '',
          }}
        >
          {props.colGroupNode}
          <tbody role="presentation">
            <TableRows
              dateProfile={props.dateProfile}
              cells={props.cells}
              renderRowIntro={props.renderRowIntro}
              showWeekNumbers={props.showWeekNumbers}
              clientWidth={props.clientWidth}
              clientHeight={props.clientHeight}
              businessHourSegs={props.businessHourSegs}
              bgEventSegs={props.bgEventSegs}
              fgEventSegs={props.fgEventSegs}
              dateSelectionSegs={props.dateSelectionSegs}
              eventSelection={props.eventSelection}
              eventDrag={props.eventDrag}
              eventResize={props.eventResize}
              dayMaxEvents={dayMaxEvents}
              dayMaxEventRows={dayMaxEventRows}
              forPrint={props.forPrint}
              isHitComboAllowed={props.isHitComboAllowed}
            />
          </tbody>
        </table>
      </div>
    )
  }
}

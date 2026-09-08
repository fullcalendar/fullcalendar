import { DateRange } from '@full-ui/headless-calendar'
import { type CSSProperties, type Ref } from 'react'
import { EventRangeProps } from '../../component-util/event-rendering'
import { generateClassName } from '../../content-inject/ContentContainer'
import { DateProfile } from '../../DateProfileGenerator'
import { RefMap } from '../../util/RefMap'
import { joinClassNames } from '../../util/html'
import { BaseComponent } from '../../vdom-util'
import { DayGridRange, DayTableCell } from '../DayTableModel'
import { RowConfig } from '../header-tier'
import classNames from '../../styles.module.css'
import { DayGridHeaderRows } from './DayGridHeaderRows'
import { DayGridRows } from './DayGridRows'

export interface DayGridLayoutPrintProps {
  dateProfile: DateProfile
  todayRange: DateRange
  cellRows: DayTableCell[][]

  // header content
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]
  showHeader: boolean
  headerElRef?: Ref<HTMLTableSectionElement>

  // body content
  fgEventSegs: (DayGridRange & EventRangeProps)[]
  bgEventSegs: (DayGridRange & EventRangeProps)[]
  businessHourSegs: (DayGridRange & EventRangeProps)[]
  eventSelection: string
  dayMaxEventRows?: number | boolean

  // display
  borderlessX: boolean
  borderlessTop: boolean
  borderlessBottom: boolean
  multiMonthColumns: number
  visibleWidth?: number
  cellIsNarrow: boolean
  cellIsMicro: boolean
  style?: CSSProperties

  // refs
  rowHeightRefMap?: RefMap<string, number>
}

export class DayGridLayoutPrint extends BaseComponent<DayGridLayoutPrintProps> {
  render() {
    const { props, context } = this
    const { options } = context
    const tableDisplayInfo = {
      borderlessX: props.borderlessX,
      borderlessTop: props.borderlessTop,
      borderlessBottom: props.borderlessBottom,
      multiMonthColumns: props.multiMonthColumns,
    }

    return (
      <table
        role="presentation"
        className={joinClassNames(
          generateClassName(options.tableClass, tableDisplayInfo),
          classNames.printTable,
        )}
        style={props.style}
      >
        <colgroup>
          {props.cellRows[0].map((cell) => <col key={cell.key} />)}
        </colgroup>
        {props.showHeader && (
          <thead
            ref={props.headerElRef}
            role="rowgroup"
            className={generateClassName(options.tableHeaderClass, {
              ...tableDisplayInfo,
              isSticky: false,
            })}
          >
            <DayGridHeaderRows
              tableMode
              headerTiers={props.headerTiers}
              cellIsNarrow={props.cellIsNarrow}
              cellIsMicro={props.cellIsMicro}
            />
            <tr role="presentation">
              <th
                role="presentation"
                colSpan={props.cellRows[0].length}
                className={joinClassNames(
                  classNames.noPadding,
                  generateClassName(options.dayHeaderDividerClass, {
                    isSticky: false,
                    multiMonthColumns: props.multiMonthColumns,
                    options: { allDaySlot: Boolean(options.allDaySlot) },
                  }),
                )}
              />
            </tr>
          </thead>
        )}
        <DayGridRows
          dateProfile={props.dateProfile}
          todayRange={props.todayRange}
          cellRows={props.cellRows}
          forPrint
          tableMode
          className={generateClassName(options.tableBodyClass, tableDisplayInfo)}
          dayMaxEvents={undefined}
          dayMaxEventRows={props.dayMaxEventRows}

          fgEventSegs={props.fgEventSegs}
          bgEventSegs={props.bgEventSegs}
          businessHourSegs={props.businessHourSegs}
          dateSelectionSegs={[]}
          eventDrag={null}
          eventResize={null}
          eventSelection={props.eventSelection}

          visibleWidth={props.visibleWidth}
          cellIsNarrow={props.cellIsNarrow}
          cellIsMicro={props.cellIsMicro}
          rowHeightRefMap={props.rowHeightRefMap}
        />
      </table>
    )
  }
}

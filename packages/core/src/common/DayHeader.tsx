import { BaseComponent } from '../vdom-util'
import ComponentContext from '../component/ComponentContext'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, h } from '../vdom'
import TableDateCell from './TableDateCell'


export interface DayHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntro?: () => VNode[]
}


export default class DayHeader extends BaseComponent<DayHeaderProps> { // TODO: rename to DayHeaderTr?


  render(props: DayHeaderProps, state: {}, context: ComponentContext) {
    let { dateEnv } = this.context
    let { dates, datesRepDistinctDays } = props
    let cells: VNode[] = []

    if (props.renderIntro) {
      cells = props.renderIntro()
    }

    let colHeadFormat = createFormatter(
      context.options.columnHeaderFormat ||
      computeFallbackHeaderFormat(datesRepDistinctDays, dates.length)
    )

    for (let date of dates) {
      let distinctDateStr = datesRepDistinctDays ? dateEnv.formatIso(date, { omitTime: true }) : ''

      cells.push(
        <TableDateCell
          key={distinctDateStr || date.getDay()}
          distinctDateStr={distinctDateStr}
          dateMarker={date}
          dateProfile={props.dateProfile}
          colCnt={dates.length}
          colHeadFormat={colHeadFormat}
        />
      )
    }

    return (
      <tr>{cells}</tr>
    )
  }

}

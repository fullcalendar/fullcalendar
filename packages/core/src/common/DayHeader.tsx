import { BaseComponent } from '../vdom-util'
import ComponentContext from '../component/ComponentContext'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, h } from '../vdom'
import TableDateCell from './TableDateCell'
import NowTimer from '../NowTimer'
import { DateRange } from '../datelib/date-range'


export interface DayHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntro?: () => VNode
}


export default class DayHeader extends BaseComponent<DayHeaderProps> { // TODO: rename to DayHeaderTr?


  render(props: DayHeaderProps, state: {}, context: ComponentContext) {
    let { dates, datesRepDistinctDays } = props

    let dayLabelFormat = createFormatter(
      context.options.dayLabelFormat ||
      computeFallbackHeaderFormat(datesRepDistinctDays, dates.length)
    )

    return (
      <NowTimer unit='day' content={(nowDate: DateMarker, todayRange: DateRange) => (
        <tr>
          {props.renderIntro && props.renderIntro()}
          {dates.map((date) => {
            return (
              <TableDateCell
                key={datesRepDistinctDays ? date.toISOString() : date.getUTCDay()}
                isDateDistinct={datesRepDistinctDays}
                date={date}
                todayRange={todayRange}
                dateProfile={props.dateProfile}
                colCnt={dates.length}
                dayLabelFormat={dayLabelFormat}
              />
            )
          })}
        </tr>
      )} />
    )
  }

}

import { BaseComponent } from '../vdom-util'
import ComponentContext from '../component/ComponentContext'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, h } from '../vdom'
import TableDateCell, { TableDowCell } from './TableDateCell'
import NowTimer from '../NowTimer'
import { DateRange } from '../datelib/date-range'
import { memoize } from '../util/memoize'


export interface DayHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntro?: () => VNode
}


export default class DayHeader extends BaseComponent<DayHeaderProps> { // TODO: rename to DayHeaderTr?

  createDayHeaderFormatter = memoize(createDayHeaderFormatter)


  render(props: DayHeaderProps, state: {}, context: ComponentContext) {
    let { dates, datesRepDistinctDays } = props

    let dayLabelFormat = this.createDayHeaderFormatter(
      context.options.dayLabelFormat,
      datesRepDistinctDays,
      dates.length
    )

    return (
      <NowTimer unit='day' content={(nowDate: DateMarker, todayRange: DateRange) => (
        <tr>
          {props.renderIntro && props.renderIntro()}
          {dates.map((date) => (
            datesRepDistinctDays ?
              <TableDateCell
                key={date.toISOString()}
                date={date}
                todayRange={todayRange}
                dateProfile={props.dateProfile}
                colCnt={dates.length}
                dayLabelFormat={dayLabelFormat}
              /> :
              <TableDowCell
                key={date.getUTCDay()}
                dow={date.getUTCDay()}
                dayLabelFormat={dayLabelFormat}
              />
          ))}
        </tr>
      )} />
    )
  }

}


function createDayHeaderFormatter(input, datesRepDistinctDays, dateCnt) {
  return createFormatter(
    input ||
    computeFallbackHeaderFormat(datesRepDistinctDays, dateCnt)
  )
}

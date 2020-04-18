import { BaseComponent } from '../vdom-util'
import { ComponentContext } from '../component/ComponentContext'
import { DateMarker } from '../datelib/marker'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, h } from '../vdom'
import { TableDateCell, TableDowCell } from './TableDateCell'
import { NowTimer } from '../NowTimer'
import { DateRange } from '../datelib/date-range'
import { memoize } from '../util/memoize'
import { DateProfile } from 'fullcalendar'


export interface DayHeaderProps {
  dateProfile: DateProfile
  dates: DateMarker[]
  datesRepDistinctDays: boolean
  renderIntro?: () => VNode
}


export class DayHeader extends BaseComponent<DayHeaderProps> { // TODO: rename to DayHeaderTr?

  createDayHeaderFormatter = memoize(createDayHeaderFormatter)


  render(props: DayHeaderProps, state: {}, context: ComponentContext) {
    let { dates, dateProfile, datesRepDistinctDays } = props

    let dayHeaderFormat = this.createDayHeaderFormatter(
      context.options.dayHeaderFormat,
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
                dateProfile={dateProfile}
                todayRange={todayRange}
                colCnt={dates.length}
                dayHeaderFormat={dayHeaderFormat}
              /> :
              <TableDowCell
                key={date.getUTCDay()}
                dow={date.getUTCDay()}
                dayHeaderFormat={dayHeaderFormat}
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

import { BaseComponent } from '../vdom-util'
import { DateMarker } from '../datelib/marker'
import { computeFallbackHeaderFormat } from './table-utils'
import { VNode, createElement } from '../vdom'
import { TableDateCell } from './TableDateCell'
import { TableDowCell } from './TableDowCell'
import { NowTimer } from '../NowTimer'
import { DateRange } from '../datelib/date-range'
import { memoize } from '../util/memoize'
import { DateProfile } from '../DateProfileGenerator'
import { DateFormatter } from '../datelib/DateFormatter'

export interface DayHeaderProps {
  dateProfile: DateProfile
  dates: DateMarker[]
  datesRepDistinctDays: boolean
  renderIntro?: (rowKey: string) => VNode
}

export class DayHeader extends BaseComponent<DayHeaderProps> { // TODO: rename to DayHeaderTr?
  createDayHeaderFormatter = memoize(createDayHeaderFormatter)

  render() {
    let { context } = this
    let { dates, dateProfile, datesRepDistinctDays, renderIntro } = this.props

    let dayHeaderFormat = this.createDayHeaderFormatter(
      context.options.dayHeaderFormat,
      datesRepDistinctDays,
      dates.length,
    )

    return (
      <NowTimer unit="day">
        {(nowDate: DateMarker, todayRange: DateRange) => (
          <tr>
            {renderIntro && renderIntro('day')}
            {dates.map((date) => (
              datesRepDistinctDays ? (
                <TableDateCell
                  key={date.toISOString()}
                  date={date}
                  dateProfile={dateProfile}
                  todayRange={todayRange}
                  colCnt={dates.length}
                  dayHeaderFormat={dayHeaderFormat}
                />
              ) : (
                <TableDowCell
                  key={date.getUTCDay()}
                  dow={date.getUTCDay()}
                  dayHeaderFormat={dayHeaderFormat}
                />
              )
            ))}
          </tr>
        )}
      </NowTimer>
    )
  }
}

function createDayHeaderFormatter(explicitFormat: DateFormatter, datesRepDistinctDays, dateCnt) {
  return explicitFormat || computeFallbackHeaderFormat(datesRepDistinctDays, dateCnt)
}

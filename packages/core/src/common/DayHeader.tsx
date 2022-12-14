import { BaseComponent } from '../vdom-util.js'
import { DateMarker } from '../datelib/marker.js'
import { computeFallbackHeaderFormat } from './table-utils.js'
import { VNode, createElement } from '../preact.js'
import { TableDateCell } from './TableDateCell.js'
import { TableDowCell } from './TableDowCell.js'
import { NowTimer } from '../NowTimer.js'
import { DateRange } from '../datelib/date-range.js'
import { memoize } from '../util/memoize.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { DateFormatter } from '../datelib/DateFormatter.js'

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
          <tr role="row">
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

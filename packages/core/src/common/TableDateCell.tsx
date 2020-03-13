import { rangeContainsMarker, DateRange } from '../datelib/date-range'
import { getDayClassNames, getDayMeta } from '../component/date-rendering'
import GotoAnchor from './GotoAnchor'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext from '../component/ComponentContext'
import { h } from '../vdom'
import { __assign } from 'tslib'
import { DateFormatter, formatDayString } from '../datelib/formatting'
import { BaseComponent } from '../vdom-util'


export interface TableDateCellProps {
  isDateDistinct: boolean
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  colCnt: number
  colHeadFormat: DateFormatter
  colSpan?: number
  otherAttrs?: object
}

export default class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header

  render(props: TableDateCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date, dateProfile, isDateDistinct } = props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let innerText

    if (typeof options.columnHeaderText === 'function') {
      innerText = options.columnHeaderText(
        dateEnv.toDate(date)
      )
    } else {
      innerText = dateEnv.format(date, props.colHeadFormat)
    }

    let dayMeta = isDateDistinct // if only one row of days, the classNames on the header can represent the specific days beneath
      ? getDayMeta(date, props.todayRange, props.dateProfile)
      : getDayMeta(date)

    let classNames = [ 'fc-day-header' ].concat(getDayClassNames(dayMeta, context.theme))
    let attrs = {} as any

    if (isDateValid && isDateDistinct) {
      attrs['data-date'] = formatDayString(date)
    }

    if (props.colSpan > 1) {
      attrs.colSpan = props.colSpan
    }

    if (props.otherAttrs) {
      __assign(attrs, props.otherAttrs)
    }

    // if colCnt is 1, we are already in a day-view and don't need a navlink

    return (
      <th class={classNames.join(' ')} {...attrs}>
        {isDateValid &&
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date, forceOff: isDateValid && (!isDateDistinct || props.colCnt === 1) }}
          >{innerText}</GotoAnchor>
        }
      </th>
    )
  }

}

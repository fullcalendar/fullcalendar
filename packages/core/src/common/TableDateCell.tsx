import { rangeContainsMarker, DateRange } from '../datelib/date-range'
import { getDayClassNames, getDayMeta } from '../component/date-rendering'
import GotoAnchor from '../component/GotoAnchor'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext from '../component/ComponentContext'
import { h } from '../vdom'
import { __assign } from 'tslib'
import { DateFormatter } from '../datelib/formatting'
import { BaseComponent } from '../vdom-util'


export interface TableDateCellProps {
  distinctDateStr: string
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
    let { date, dateProfile, distinctDateStr } = props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let innerText

    if (typeof options.columnHeaderText === 'function') {
      innerText = options.columnHeaderText(
        dateEnv.toDate(date)
      )
    } else {
      innerText = dateEnv.format(date, props.colHeadFormat)
    }

    let dayMeta = distinctDateStr // if only one row of days, the classNames on the header can represent the specific days beneath
      ? getDayMeta(date, props.todayRange, props.dateProfile)
      : getDayMeta(date)

    let classNames = [ 'fc-day-header' ].concat(getDayClassNames(dayMeta, context.theme))
    let attrs = {} as any

    if (isDateValid && distinctDateStr) {
      attrs['data-date'] = distinctDateStr
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
            gotoOptions={{ date, forceOff: isDateValid && (!distinctDateStr || props.colCnt === 1) }}
          >{innerText}</GotoAnchor>
        }
      </th>
    )
  }

}

import { rangeContainsMarker } from '../datelib/date-range'
import { getDayClasses } from '../component/date-rendering'
import GotoAnchor from '../component/GotoAnchor'
import { DateMarker, DAY_IDS } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext from '../component/ComponentContext'
import { h } from '../vdom'
import { __assign } from 'tslib'
import { DateFormatter } from '../datelib/formatting'
import { BaseComponent } from '../vdom-util'


export interface TableDateCellProps {
  distinctDateStr: string
  dateMarker: DateMarker
  dateProfile: DateProfile
  colCnt: number
  colHeadFormat: DateFormatter
  colSpan?: number
  otherAttrs?: object
}

export default class TableDateCell extends BaseComponent<TableDateCellProps> {

  render(props: TableDateCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { dateMarker, dateProfile, distinctDateStr } = props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, dateMarker) // TODO: called too frequently. cache somehow.
    let classNames = [ 'fc-day-header' ]
    let innerText
    let innerHtml

    if (typeof options.columnHeaderHtml === 'function') {
      innerHtml = options.columnHeaderHtml(
        dateEnv.toDate(dateMarker)
      )
    } else if (typeof options.columnHeaderText === 'function') {
      innerText = options.columnHeaderText(
        dateEnv.toDate(dateMarker)
      )
    } else {
      innerText = dateEnv.format(dateMarker, props.colHeadFormat)
    }

    // if only one row of days, the classNames on the header can represent the specific days beneath
    if (distinctDateStr) {
      classNames = classNames.concat(
        // includes the day-of-week class
        // noThemeHighlight=true (don't highlight the header)
        getDayClasses(dateMarker, dateProfile, context, true)
      )
    } else {
      classNames.push('fc-' + DAY_IDS[dateMarker.getUTCDay()]) // only add the day-of-week class
    }

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

    return ( // TODO: add a key somehow (date+resource) ???
      <th class={classNames.join(' ')} {...attrs}>
        {isDateValid &&
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date: dateMarker, forceOff: isDateValid && (!distinctDateStr || props.colCnt === 1) }}
            htmlContent={innerHtml}
          >{innerText}</GotoAnchor>
        }
      </th>
    )
  }

}

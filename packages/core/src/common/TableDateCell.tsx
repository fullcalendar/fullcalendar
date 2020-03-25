import { DateRange } from '../datelib/date-range'
import { getDayClassNames, getDateMeta, DateMeta } from '../component/date-rendering'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext from '../component/ComponentContext'
import { h } from '../vdom'
import { __assign } from 'tslib'
import { DateFormatter, formatDayString } from '../datelib/formatting'
import { BaseComponent } from '../vdom-util'
import { RenderHook } from './render-hook'
import { buildNavLinkData } from './nav-link'
import ViewApi from '../ViewApi'


export interface TableDateCellProps {
  isDateDistinct: boolean
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  colCnt: number
  dayLabelFormat: DateFormatter
  colSpan?: number
  extraHookProps?: object
  extraDataAttrs?: object
  extraClassNames?: string[]
}

interface HookProps extends DateMeta {
  date: Date
  view: ViewApi
  text: string
  navLinkData: string
  [otherProp: string]: any
}


export default class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header

  render(props: TableDateCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date, isDateDistinct } = props
    let dayMeta = isDateDistinct // if only one row of days, the classNames on the header can represent the specific days beneath
      ? getDateMeta(date, props.todayRange, null, props.dateProfile)
      : getDateMeta(date)

    let classNames = [ 'fc-col-header-cell' ].concat(
      getDayClassNames(dayMeta, context.theme),
      props.extraClassNames || []
    )
    let text = dateEnv.format(date, props.dayLabelFormat)

    // if colCnt is 1, we are already in a day-view and don't need a navlink
    let navLinkData = (options.navLinks && !dayMeta.isDisabled && isDateDistinct && props.colCnt > 1)
      ? buildNavLinkData(date)
      : null

    let hookProps: HookProps = {
      date: dateEnv.toDate(date),
      view: context.view,
      ...props.extraHookProps,
      text,
      navLinkData,
      ...dayMeta
    }

    return (
      <RenderHook name='dayLabel' hookProps={hookProps} defaultContent={renderInner}>
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <th
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            data-date={(!dayMeta.isDisabled && isDateDistinct) ? formatDayString(date) : undefined}
            colSpan={props.colSpan > 1 ? props.colSpan : undefined}
            {...props.extraDataAttrs}
          >{innerContent}</th>
        )}
      </RenderHook>
    )
  }

}


function renderInner(hookProps: HookProps) {
  if (!hookProps.isDisabled) {
    return (
      <a data-navlink={hookProps.navLinkData}>
        {hookProps.text}
      </a>
    )
  }
}

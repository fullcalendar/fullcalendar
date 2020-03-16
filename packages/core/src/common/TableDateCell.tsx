import { DateRange } from '../datelib/date-range'
import { getDayClassNames, getDayMeta, DateMeta } from '../component/date-rendering'
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
  extraMountProps?: object
  extraDataAttrs?: object
}

interface MountProps {
  date: Date
  view: ViewApi
  [otherProp: string]: any
}

type DynamicProps = MountProps & DateMeta & {
  text: string
  navLinkData: string
}


export default class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header

  render(props: TableDateCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date, isDateDistinct } = props
    let dayMeta = isDateDistinct // if only one row of days, the classNames on the header can represent the specific days beneath
      ? getDayMeta(date, props.todayRange, props.dateProfile)
      : getDayMeta(date)

    let classNames = [ 'fc-day-header' ].concat(getDayClassNames(dayMeta, context.theme))
    let text = dateEnv.format(date, props.dayLabelFormat)

    // if colCnt is 1, we are already in a day-view and don't need a navlink
    let navLinkData = (options.navLinks && !dayMeta.isDisabled && isDateDistinct && props.colCnt > 1)
      ? buildNavLinkData(date)
      : null

    let mountProps: MountProps = {
      date: dateEnv.toDate(date),
      view: context.view,
      ...props.extraMountProps
    }

    let dynamicProps: DynamicProps = {
      ...mountProps,
      text,
      navLinkData,
      ...dayMeta
    }

    return (
      <RenderHook name='dayLabel' mountProps={mountProps} dynamicProps={dynamicProps} defaultInnerContent={renderInner}>
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


function renderInner(dynamicProps: DynamicProps) {
  if (!dynamicProps.isDisabled) {
    return (
      <a data-navlink={dynamicProps.navLinkData}>
        {dynamicProps.text}
      </a>
    )
  }
}

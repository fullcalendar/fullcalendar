import { DateRange } from '../datelib/date-range'
import { getDayClassNames, getDateMeta, DateMeta } from '../component/date-rendering'
import { DateMarker, addDays } from '../datelib/marker'
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
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  colCnt: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraDataAttrs?: object
  extraHookProps?: object
}

export interface DateHeaderCellHookProps extends DateMeta { // is used publicly as the standard header cell. TODO: move
  date: Date
  view: ViewApi
  text: string
  [otherProp: string]: any
}

const CLASS_NAME = 'fc-col-header-cell' // do the cushion too? no


export default class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header

  render(props: TableDateCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date } = props
    let dayMeta = getDateMeta(date, props.todayRange, null, props.dateProfile)

    let classNames = [ CLASS_NAME ].concat(
      getDayClassNames(dayMeta, context.theme)
    )
    let text = dateEnv.format(date, props.dayHeaderFormat)

    // if colCnt is 1, we are already in a day-view and don't need a navlink
    let navLinkData = (options.navLinks && !dayMeta.isDisabled && props.colCnt > 1)
      ? buildNavLinkData(date)
      : null

    let hookProps: DateHeaderCellHookProps = {
      date: dateEnv.toDate(date),
      view: context.view,
      ...props.extraHookProps,
      text,
      ...dayMeta
    }

    return (
      <RenderHook name='dayHeader' hookProps={hookProps} defaultContent={renderInner}>
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <th
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            data-date={!dayMeta.isDisabled ? formatDayString(date) : undefined}
            colSpan={props.colSpan}
            {...props.extraDataAttrs}
          >
            {!dayMeta.isDisabled &&
              <a
                data-navlink={navLinkData}
                class={[
                  'fc-col-header-cell-cushion',
                  props.isSticky ? 'fc-sticky' : ''
                ].join(' ')}
                ref={innerElRef}
              >
                {innerContent}
              </a>
            }
          </th>
        )}
      </RenderHook>
    )
  }

}


export interface TableDowCellProps {
  dow: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraHookProps?: object
  extraDataAttrs?: object
  extraClassNames?: string[]
}

export class TableDowCell extends BaseComponent<TableDowCellProps> {

  render(props: TableDowCellProps, state: {}, context: ComponentContext) {
    let { dow } = props
    let { dateEnv } = context

    let date = addDays(new Date(259200000), dow) // start with Sun, 04 Jan 1970 00:00:00 GMT

    let dateMeta: DateMeta = {
      dow,
      isDisabled: false,
      isFuture: false,
      isPast: false,
      isToday: false,
      isOther: false
    }

    let classNames = [ CLASS_NAME ].concat(
      getDayClassNames(dateMeta, context.theme),
      props.extraClassNames || []
    )

    let text = dateEnv.format(date, props.dayHeaderFormat)

    let hookProps: DateHeaderCellHookProps = {
      date,
      ...dateMeta,
      view: context.view,
      ...props.extraHookProps,
      text
    }

    return (
      <RenderHook name='dayHeader' hookProps={hookProps} defaultContent={renderInner}>
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <th
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            colSpan={props.colSpan}
            {...props.extraDataAttrs}
          >
            <a
              class={[
                'fc-col-header-cell-cushion',
                props.isSticky ? 'fc-sticky' : ''
              ].join(' ')}
              ref={innerElRef}
            >
              {innerContent}
            </a>
          </th>
        )}
      </RenderHook>
    )
  }

}


function renderInner(hookProps: DateHeaderCellHookProps) {
  return hookProps.text
}

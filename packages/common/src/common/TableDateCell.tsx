import { DateRange } from '../datelib/date-range'
import { getDayClassNames, getDateMeta, DateMeta } from '../component/date-rendering'
import { DateMarker, addDays } from '../datelib/marker'
import { createElement } from '../vdom'
import { __assign } from 'tslib'
import { DateFormatter } from '../datelib/DateFormatter'
import { formatDayString } from '../datelib/formatting-utils'
import { BaseComponent } from '../vdom-util'
import { RenderHook } from './render-hook'
import { buildNavLinkData } from './nav-link'
import { DateProfile } from '../DateProfileGenerator'
import { DayHeaderHookProps } from '../render-hook-misc'


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

const CLASS_NAME = 'fc-col-header-cell' // do the cushion too? no


export class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header

  render() {
    let { dateEnv, options, theme, viewApi } = this.context
    let { props } = this
    let { date, dateProfile } = props
    let dayMeta = getDateMeta(date, props.todayRange, null, dateProfile)

    let classNames = [ CLASS_NAME ].concat(
      getDayClassNames(dayMeta, theme)
    )
    let text = dateEnv.format(date, props.dayHeaderFormat)

    // if colCnt is 1, we are already in a day-view and don't need a navlink
    let navLinkData = (options.navLinks && !dayMeta.isDisabled && props.colCnt > 1)
      ? buildNavLinkData(date)
      : null

    let hookProps: DayHeaderHookProps = {
      date: dateEnv.toDate(date),
      view: viewApi,
      ...props.extraHookProps,
      text,
      ...dayMeta
    }

    return (
      <RenderHook
        hookProps={hookProps}
        classNames={options.dayHeaderClassNames}
        content={options.dayHeaderContent}
        defaultContent={renderInner}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
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
                className={[
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

  render() {
    let { props } = this
    let { dateEnv, theme, viewApi, options } = this.context

    let date = addDays(new Date(259200000), props.dow) // start with Sun, 04 Jan 1970 00:00:00 GMT

    let dateMeta: DateMeta = {
      dow: props.dow,
      isDisabled: false,
      isFuture: false,
      isPast: false,
      isToday: false,
      isOther: false
    }

    let classNames = [ CLASS_NAME ].concat(
      getDayClassNames(dateMeta, theme),
      props.extraClassNames || []
    )

    let text = dateEnv.format(date, props.dayHeaderFormat)

    let hookProps: DayHeaderHookProps = {
      date,
      ...dateMeta,
      view: viewApi,
      ...props.extraHookProps,
      text
    }

    return (
      <RenderHook
        hookProps={hookProps}
        classNames={options.dayHeaderClassNames}
        content={options.dayHeaderContent}
        defaultContent={renderInner}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <th
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            colSpan={props.colSpan}
            {...props.extraDataAttrs}
          >
            <a
              className={[
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


function renderInner(hookProps: DayHeaderHookProps) {
  return hookProps.text
}

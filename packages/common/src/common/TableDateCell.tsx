import { DateRange } from '../datelib/date-range'
import { getDayClassNames, getDateMeta } from '../component/date-rendering'
import { DateMarker } from '../datelib/marker'
import { createElement } from '../vdom'
import { DateFormatter } from '../datelib/DateFormatter'
import { formatDayString } from '../datelib/formatting-utils'
import { BaseComponent } from '../vdom-util'
import { RenderHook } from './render-hook'
import { buildNavLinkData } from './nav-link'
import { DateProfile } from '../DateProfileGenerator'
import { DayHeaderContentArg } from '../render-hook-misc'
import { Dictionary } from '../options'
import { CLASS_NAME, renderInner } from './table-cell-util'

export interface TableDateCellProps {
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  colCnt: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraDataAttrs?: Dictionary
  extraHookProps?: Dictionary
}

export class TableDateCell extends BaseComponent<TableDateCellProps> { // BAD name for this class now. used in the Header
  render() {
    let { dateEnv, options, theme, viewApi } = this.context
    let { props } = this
    let { date, dateProfile } = props
    let dayMeta = getDateMeta(date, props.todayRange, null, dateProfile)

    let classNames = [CLASS_NAME].concat(
      getDayClassNames(dayMeta, theme),
    )
    let text = dateEnv.format(date, props.dayHeaderFormat)

    // if colCnt is 1, we are already in a day-view and don't need a navlink
    let navLinkAttrs = (options.navLinks && !dayMeta.isDisabled && props.colCnt > 1)
      ? { 'data-navlink': buildNavLinkData(date), tabIndex: 0 }
      : {}

    let hookProps: DayHeaderContentArg = {
      date: dateEnv.toDate(date),
      view: viewApi,
      ...props.extraHookProps,
      text,
      ...dayMeta,
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
            <div className="fc-scrollgrid-sync-inner">
              {!dayMeta.isDisabled && (
                <a
                  ref={innerElRef}
                  className={[
                    'fc-col-header-cell-cushion',
                    props.isSticky ? 'fc-sticky' : '',
                  ].join(' ')}
                  {...navLinkAttrs}
                >
                  {innerContent}
                </a>
              )}
            </div>
          </th>
        )}
      </RenderHook>
    )
  }
}

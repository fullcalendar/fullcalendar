import { DateRange } from '../datelib/date-range.js'
import { getDayClassNames, getDateMeta } from '../component/date-rendering.js'
import { DateMarker } from '../datelib/marker.js'
import { createElement } from '../preact/index.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { formatDayString } from '../datelib/formatting-utils.js'
import { BaseComponent } from '../vdom-util.js'
import { RenderHook } from './render-hook.js'
import { buildNavLinkAttrs } from './nav-link.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { DayHeaderContentArg } from '../render-hook-misc.js'
import { Dictionary } from '../options.js'
import { CLASS_NAME, renderInner } from './table-cell-util.js'

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
    let navLinkAttrs = (!dayMeta.isDisabled && props.colCnt > 1)
      ? buildNavLinkAttrs(this.context, date)
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
            role="columnheader"
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

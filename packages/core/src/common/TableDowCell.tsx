import { getDayClassNames, DateMeta } from '../component/date-rendering.js'
import { addDays } from '../datelib/marker.js'
import { createElement } from '../preact/index.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { BaseComponent } from '../vdom-util.js'
import { RenderHook } from './render-hook.js'
import { Dictionary } from '../options.js'
import { CLASS_NAME, renderInner } from './table-cell-util.js'
import { DayHeaderContentArg } from '../render-hook-misc.js'
import { createFormatter } from '../datelib/formatting.js'

export interface TableDowCellProps {
  dow: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
}

const WEEKDAY_FORMAT = createFormatter({ weekday: 'long' })

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
      isOther: false,
    }
    let classNames = [CLASS_NAME].concat(
      getDayClassNames(dateMeta, theme),
      props.extraClassNames || [],
    )
    let text = dateEnv.format(date, props.dayHeaderFormat)
    let hookProps: DayHeaderContentArg = { // TODO: make this public?
      date,
      ...dateMeta,
      view: viewApi,
      ...props.extraHookProps,
      text,
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
            colSpan={props.colSpan}
            {...props.extraDataAttrs}
          >
            <div className="fc-scrollgrid-sync-inner">
              <a
                aria-label={dateEnv.format(date, WEEKDAY_FORMAT)}
                className={[
                  'fc-col-header-cell-cushion',
                  props.isSticky ? 'fc-sticky' : '',
                ].join(' ')}
                ref={innerElRef}
              >
                {innerContent}
              </a>
            </div>
          </th>
        )}
      </RenderHook>
    )
  }
}

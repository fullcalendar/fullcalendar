import { getDayClassNames, DateMeta } from '../component/date-rendering'
import { addDays } from '../datelib/marker'
import { createElement } from '../vdom'
import { DateFormatter } from '../datelib/DateFormatter'
import { BaseComponent } from '../vdom-util'
import { RenderHook } from './render-hook'
import { Dictionary } from '../options'
import { CLASS_NAME, renderInner } from './table-cell-util'
import { DayHeaderContentArg } from '../render-hook-misc'

export interface TableDowCellProps {
  dow: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
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
            className={classNames.concat(customClassNames).join(' ')}
            colSpan={props.colSpan}
            {...props.extraDataAttrs}
          >
            <div className="fc-scrollgrid-sync-inner">
              <a
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

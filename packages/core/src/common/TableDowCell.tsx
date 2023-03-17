import { getDayClassNames, DateMeta } from '../component/date-rendering.js'
import { addDays } from '../datelib/marker.js'
import { createElement } from '../preact.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { BaseComponent } from '../vdom-util.js'
import { Dictionary } from '../options.js'
import { CLASS_NAME, renderInner } from './table-cell-util.js'
import { DayHeaderContentArg } from '../render-hook-misc.js'
import { createFormatter } from '../datelib/formatting.js'
import { ContentContainer } from '../content-inject/ContentContainer.js'

export interface TableDowCellProps {
  dow: number
  dayHeaderFormat: DateFormatter
  colSpan?: number
  isSticky?: boolean // TODO: get this outta here somehow
  extraRenderProps?: Dictionary
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
    let text = dateEnv.format(date, props.dayHeaderFormat)
    let renderProps: DayHeaderContentArg = { // TODO: make this public?
      date,
      ...dateMeta,
      view: viewApi,
      ...props.extraRenderProps,
      text,
    }

    return (
      <ContentContainer
        elTag="th"
        elClasses={[
          CLASS_NAME,
          ...getDayClassNames(dateMeta, theme),
          ...(props.extraClassNames || []),
        ]}
        elAttrs={{
          role: 'columnheader',
          colSpan: props.colSpan,
          ...props.extraDataAttrs,
        }}
        renderProps={renderProps}
        generatorName="dayHeaderContent"
        customGenerator={options.dayHeaderContent}
        defaultGenerator={renderInner}
        classNameGenerator={options.dayHeaderClassNames}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(InnerContent) => (
          <div className="fc-scrollgrid-sync-inner">
            <InnerContent
              elTag="a"
              elClasses={[
                'fc-col-header-cell-cushion',
                props.isSticky && 'fc-sticky',
              ]}
              elAttrs={{
                'aria-label': dateEnv.format(date, WEEKDAY_FORMAT),
              }}
            />
          </div>
        )}
      </ContentContainer>
    )
  }
}

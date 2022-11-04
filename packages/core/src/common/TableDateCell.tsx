import { DateRange } from '../datelib/date-range.js'
import { getDayClassNames, getDateMeta } from '../component/date-rendering.js'
import { DateMarker } from '../datelib/marker.js'
import { createElement } from '../preact.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { formatDayString } from '../datelib/formatting-utils.js'
import { BaseComponent } from '../vdom-util.js'
import { buildNavLinkAttrs } from './nav-link.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { DayHeaderContentArg } from '../render-hook-misc.js'
import { Dictionary } from '../options.js'
import { CLASS_NAME, renderInner } from './table-cell-util.js'
import { ContentContainer } from '../content-inject/ContentContainer.js'

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
      <ContentContainer
        elTag="th"
        elClasses={classNames}
        elAttrs={{
          role: 'columnheader',
          colSpan: props.colSpan,
          'data-date': !dayMeta.isDisabled ? formatDayString(date) : undefined,
          ...props.extraDataAttrs,
        }}
        renderProps={hookProps}
        generatorName="dayHeaderContent"
        generator={options.dayHeaderContent || renderInner}
        classNameGenerator={options.dayHeaderClassNames}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(InnerContainer) => (
          <div className="fc-scrollgrid-sync-inner">
            {!dayMeta.isDisabled && (
              <InnerContainer
                elTag="a"
                elAttrs={navLinkAttrs}
                elClasses={[
                  'fc-col-header-cell-cushion',
                  props.isSticky ? 'fc-sticky' : '',
                ]}
              />
            )}
          </div>
        )}
      </ContentContainer>
    )
  }
}

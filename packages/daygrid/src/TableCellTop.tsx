import {
  DateMarker,
  DateRange,
  DayCellContentArg,
  DayCellContent,
  BaseComponent,
  DateProfile,
  Dictionary,
  buildNavLinkAttrs,
} from '@fullcalendar/core'
import { createElement, Fragment } from '@fullcalendar/core/preact'

interface TableCellTopProps {
  date: DateMarker
  dateProfile: DateProfile
  showDayNumber: boolean
  dayNumberId: string
  forceDayTop: boolean // hack to force-create an element with height (created by a nbsp)
  todayRange: DateRange
  extraHookProps?: Dictionary
}

export class TableCellTop extends BaseComponent<TableCellTopProps> {
  render() {
    let { props } = this
    let navLinkAttrs = buildNavLinkAttrs(this.context, props.date)

    return (
      <DayCellContent
        date={props.date}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        defaultContent={renderTopInner}
      >
        {(innerElRef, innerContent) => (
          (innerContent || props.forceDayTop) && (
            <div className="fc-daygrid-day-top" ref={innerElRef}>
              <a
                id={props.dayNumberId}
                className="fc-daygrid-day-number"
                {...navLinkAttrs}
              >
                {innerContent || <Fragment>&nbsp;</Fragment>}
              </a>
            </div>
          )
        )}
      </DayCellContent>
    )
  }
}

function renderTopInner(props: DayCellContentArg) {
  return props.dayNumberText
}

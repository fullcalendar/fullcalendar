import {
  createElement,
  DateMarker,
  DateRange,
  buildNavLinkData,
  DayCellContentArg,
  DayCellContent,
  BaseComponent,
  DateProfile,
  Dictionary,
  Fragment,
} from '@fullcalendar/common'

interface TableCellTopProps {
  date: DateMarker
  dateProfile: DateProfile
  showDayNumber: boolean
  forceDayTop: boolean // hack to force-create an element with height (created by a nbsp)
  todayRange: DateRange
  extraHookProps?: Dictionary
}

export class TableCellTop extends BaseComponent<TableCellTopProps> {
  render() {
    let { props } = this

    let navLinkAttrs = this.context.options.navLinks
      ? { 'data-navlink': buildNavLinkData(props.date), tabIndex: 0 }
      : {}

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
              <a className="fc-daygrid-day-number" {...navLinkAttrs}>
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

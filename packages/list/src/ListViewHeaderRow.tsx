import {
  BaseComponent, DateMarker, createElement, DateRange, getDateMeta,
  RenderHook, buildNavLinkData, DayHeaderContentArg, getDayClassNames, formatDayString, Fragment,
} from '@fullcalendar/common'

export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DayHeaderContentArg { // doesn't enforce much since DayCellContentArg allow extra props
  text: string
  sideText: string
}

export class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {
  render() {
    let { dayDate, todayRange } = this.props
    let { theme, dateEnv, options, viewApi } = this.context
    let dayMeta = getDateMeta(dayDate, todayRange)

    // will ever be falsy?
    let text = options.listDayFormat ? dateEnv.format(dayDate, options.listDayFormat) : ''

    // will ever be falsy? also, BAD NAME "alt"
    let sideText = options.listDaySideFormat ? dateEnv.format(dayDate, options.listDaySideFormat) : ''

    let navLinkData = options.navLinks
      ? buildNavLinkData(dayDate)
      : null

    let hookProps: HookProps = {
      date: dateEnv.toDate(dayDate),
      view: viewApi,
      text,
      sideText,
      navLinkData,
      ...dayMeta,
    }

    let classNames = ['fc-list-day'].concat(
      getDayClassNames(dayMeta, theme),
    )

    // TODO: make a reusable HOC for dayHeader (used in daygrid/timegrid too)
    return (
      <RenderHook<HookProps>
        hookProps={hookProps}
        classNames={options.dayHeaderClassNames}
        content={options.dayHeaderContent}
        defaultContent={renderInnerContent}
        didMount={options.dayHeaderDidMount}
        willUnmount={options.dayHeaderWillUnmount}
      >
        {(rootElRef, customClassNames, innerElRef, innerContent) => (
          <tr
            ref={rootElRef}
            className={classNames.concat(customClassNames).join(' ')}
            data-date={formatDayString(dayDate)}
          >
            <th colSpan={3}>
              <div className={'fc-list-day-cushion ' + theme.getClass('tableCellShaded')} ref={innerElRef}>
                {innerContent}
              </div>
            </th>
          </tr>
        )}
      </RenderHook>
    )
  }
}

function renderInnerContent(props: HookProps) {
  let navLinkAttrs = props.navLinkData // is there a type for this?
    ? { 'data-navlink': props.navLinkData, tabIndex: 0 }
    : {}

  return (
    <Fragment>
      {props.text && (
        <a className="fc-list-day-text" {...navLinkAttrs}>
          {props.text}
        </a>
      )}
      {props.sideText && (
        <a className="fc-list-day-side-text" {...navLinkAttrs}>
          {props.sideText}
        </a>
      )}
    </Fragment>
  )
}

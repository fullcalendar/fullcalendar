import {
  BaseComponent, DateMarker, h, DateRange, getDateMeta,
  RenderHook, buildNavLinkData, DayHeaderHookProps, getDayClassNames, formatDayString
} from '@fullcalendar/common'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DayHeaderHookProps { // doesn't enforce much since DayCellHookProps allow extra props
  text: string
  sideText: string
}


export class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {


  render() {
    let { dayDate, todayRange } = this.props
    let { theme, dateEnv, options, viewApi } = this.context

    let dayMeta = getDateMeta(dayDate, todayRange)
    let text = options.listDayFormat ? dateEnv.format(dayDate, options.listDayFormat) : '' // will ever be falsy?
    let sideText = options.listDaySideFormat ? dateEnv.format(dayDate, options.listDaySideFormat) : '' // will ever be falsy? also, BAD NAME "alt"

    let navLinkData = options.navLinks
      ? buildNavLinkData(dayDate)
      : null

    let hookProps: HookProps = {
      date: dateEnv.toDate(dayDate),
      view: viewApi,
      text,
      sideText,
      navLinkData,
      ...dayMeta
    }

    let classNames = [ 'fc-list-day' ].concat(
      getDayClassNames(dayMeta, theme)
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
              <div className={'fc-list-day-frame ' + theme.getClass('tableCellShaded')} ref={innerElRef}>
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
  return [
    props.text &&
      <a className='fc-list-day-text' data-navlink={props.navLinkData}>
        {props.text}
      </a>
    ,
    props.sideText &&
      <a className='fc-list-day-side-text' data-navlink={props.navLinkData}>
        {props.sideText}
      </a>
  ]
}

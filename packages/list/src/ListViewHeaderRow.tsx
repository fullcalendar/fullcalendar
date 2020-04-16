import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, DateRange, getDateMeta,
  RenderHook, buildNavLinkData, DateHeaderCellHookProps, getDayClassNames, formatDayString
} from '@fullcalendar/core'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DateHeaderCellHookProps { // doesn't enforce much since DayCellHookProps allow extra props
  text: string
  sideText: string
}


export class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {


  render(props: ListViewHeaderRowProps, state: {}, context: ComponentContext) {
    let { theme, dateEnv, options } = context
    let { dayDate } = props
    let dayMeta = getDateMeta(dayDate, props.todayRange)
    let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
    let sideFormat = createFormatter(options.listDaySideFormat) // TODO: cache
    let text = mainFormat ? dateEnv.format(dayDate, mainFormat) : '' // will ever be falsy?
    let sideText = sideFormat ? dateEnv.format(dayDate, sideFormat) : '' // will ever be falsy? also, BAD NAME "alt"

    let navLinkData = options.navLinks
      ? buildNavLinkData(dayDate)
      : null

    let hookProps: HookProps = {
      date: dateEnv.toDate(dayDate),
      view: context.viewApi,
      text,
      sideText,
      navLinkData,
      ...dayMeta
    }

    let classNames = [ 'fc-list-day' ].concat(
      getDayClassNames(dayMeta, context.theme)
    )

    // TODO: make a reusable HOC for dayHeader (used in daygrid/timegrid too)
    return (
      <RenderHook name='dayHeader' hookProps={hookProps} defaultContent={renderInnerContent}>
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

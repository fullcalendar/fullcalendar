import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, DateRange, DayRoot, buildNavLinkData
} from '@fullcalendar/core'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}


export default class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {

  render(props: ListViewHeaderRowProps, state: {}, context: ComponentContext) {
    let { theme, dateEnv, options } = context
    let { dayDate } = props
    let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
    let altFormat = createFormatter(options.listDayAltFormat) // TODO: cache
    let navLinkData = options.navLinks ? buildNavLinkData(dayDate) : null

    return (
      <DayRoot date={dayDate} todayRange={props.todayRange}>
        {(rootElRef, classNames, dataAttrs, innerElRef, innerContent) => (
          <tr
            ref={rootElRef}
            className={classNames.concat([ 'fc-list-heading' ]).join(' ')}
            {...dataAttrs}
          >
            <td colSpan={3} className={theme.getClass('tableCellShaded')}>
              {mainFormat &&
                <a data-navlink={navLinkData} className='fc-list-heading-main'>
                  {dateEnv.format(dayDate, mainFormat)}
                </a>
              }
              {innerContent &&
                <div class='fc-list-heading-misc' ref={innerElRef}>{innerContent}</div>
              }
              {altFormat &&
                <a data-navlink={navLinkData} className='fc-list-heading-alt'>
                  {dateEnv.format(dayDate, altFormat)}
                </a>
              }
            </td>
          </tr>
        )}
      </DayRoot>
    )
  }

}

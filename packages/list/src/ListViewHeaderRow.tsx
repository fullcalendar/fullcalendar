import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, GotoAnchor, DateRange, DayRoot
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
                <GotoAnchor
                  navLinks={options.navLinks}
                  gotoOptions={dayDate}
                  extraAttrs={{ 'class': 'fc-list-heading-main' }}
                >{dateEnv.format(dayDate, mainFormat)}</GotoAnchor>
              }
              {innerContent &&
                <div class='fc-list-heading-misc' ref={innerElRef}>{innerContent}</div>
              }
              {altFormat &&
                <GotoAnchor
                  navLinks={options.navLinks}
                  gotoOptions={dayDate}
                  extraAttrs={{ 'class': 'fc-list-heading-alt' }}
                >{dateEnv.format(dayDate, altFormat)}</GotoAnchor>
              }
            </td>
          </tr>
        )}
      </DayRoot>
    )
  }

}

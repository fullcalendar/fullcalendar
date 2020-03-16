import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, DateRange, DayCellRoot, DayCellDynamicProps
} from '@fullcalendar/core'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}

interface DynamicProps extends DayCellDynamicProps {
  mainText: string
  altText: string
}


export default class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {

  render(props: ListViewHeaderRowProps, state: {}, context: ComponentContext) {
    let { theme, dateEnv, options } = context
    let { dayDate } = props
    let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
    let altFormat = createFormatter(options.listDayAltFormat) // TODO: cache
    let mainText = mainFormat ? dateEnv.format(dayDate, mainFormat) : '' // will ever be falsy?
    let altText = altFormat ? dateEnv.format(dayDate, altFormat) : '' // will ever be falsy? also, BAD NAME "alt"

    return (
      <DayCellRoot date={dayDate}
        todayRange={props.todayRange}
        extraDynamicProps={{ mainText, altText }}
        defaultInnerContent={renderInnerContent}
      >
        {(rootElRef, classNames, dataAttrs, innerElRef, innerContent) => (
          <tr
            ref={rootElRef}
            className={[ 'fc-list-heading' ].concat(classNames).join(' ')}
            {...dataAttrs}
          >
            <td colSpan={3} className={theme.getClass('tableCellShaded')} ref={innerElRef}>
              {innerContent}
            </td>
          </tr>
        )}
      </DayCellRoot>
    )
  }

}


function renderInnerContent(props: DynamicProps) {
  return [
    props.mainText &&
      <a data-navlink={props.navLinkData} className='fc-list-heading-main'>
        {props.mainText}
      </a>
    ,
    props.altText &&
      <a data-navlink={props.navLinkData} className='fc-list-heading-alt'>
        {props.altText}
      </a>
  ]
}

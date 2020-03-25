import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, DateRange, DayCellRoot, DayCellHookProps, DayCellContent
} from '@fullcalendar/core'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}

interface HookProps extends DayCellHookProps { // doesn't enforce much since DayCellHookProps allow extra props
  text: string
  sideText: string
}


export default class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {

  render(props: ListViewHeaderRowProps, state: {}, context: ComponentContext) {
    let { theme, dateEnv, options } = context
    let { dayDate } = props
    let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
    let sideFormat = createFormatter(options.listDaySideFormat) // TODO: cache
    let text = mainFormat ? dateEnv.format(dayDate, mainFormat) : '' // will ever be falsy?
    let sideText = sideFormat ? dateEnv.format(dayDate, sideFormat) : '' // will ever be falsy? also, BAD NAME "alt"
    let extraHookProps = { text, sideText }
    return (
      <DayCellRoot date={dayDate} todayRange={props.todayRange} extraHookProps={extraHookProps}>
        {(rootElRef, classNames, dataAttrs) => (
          <tr
            ref={rootElRef}
            className={[ 'fc-list-day' ].concat(classNames).join(' ')}
            {...dataAttrs}
          >
            <DayCellContent date={dayDate} todayRange={props.todayRange} extraHookProps={extraHookProps} defaultContent={renderInnerContent}>
              {(innerElRef, innerContent) => (
                <td colSpan={3} className={theme.getClass('tableCellShaded')} ref={innerElRef}>
                  {innerContent}
                </td>
              )}
            </DayCellContent>
          </tr>
        )}
      </DayCellRoot>
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

import { h, StandardEvent, BaseComponent, MinimalEventProps } from '@fullcalendar/core'


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow'
}


export interface TableEventProps extends MinimalEventProps {
  defaultDisplayEventEnd: boolean
}

export default class TableEvent extends BaseComponent<TableEventProps> {

  render(props: TableEventProps) {
    return (
      <StandardEvent
        {...props}
        extraClassNames={[ 'fc-daygrid-event', 'fc-h-event' ]}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
        defaultDisplayEventEnd={props.defaultDisplayEventEnd}
        disableResizing={!props.seg.eventRange.def.allDay}
      />
    )
  }

}

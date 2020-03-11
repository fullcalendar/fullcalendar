import { h, StandardEvent, BaseComponent, MinimalEventProps } from '@fullcalendar/core'


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow'
}


export default class TableEvent extends BaseComponent<MinimalEventProps> {

  render(props: MinimalEventProps) {
    return (
      <StandardEvent
        {...props}
        extraClassNames={[ 'fc-daygrid-event', 'fc-h-event' ]}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
        defaultDisplayEventEnd={false}
        disableResizing={!props.seg.eventRange.def.allDay}
      />
    )
  }

}

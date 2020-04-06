import { h, StandardEvent, BaseComponent, MinimalEventProps } from '@fullcalendar/core'


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  meridiem: false
}


export default class TimeColEvent extends BaseComponent<MinimalEventProps> {

  render(props: MinimalEventProps) {
    return (
      <StandardEvent
        {...props}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
        extraClassNames={[ 'fc-timegrid-event', 'fc-v-event' ]}
      />
    )
  }

}

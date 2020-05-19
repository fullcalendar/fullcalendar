import { createElement, StandardEvent, BaseComponent, MinimalEventProps, createFormatter } from '@fullcalendar/common'


const DEFAULT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  meridiem: false
})


export class TimeColEvent extends BaseComponent<MinimalEventProps> {

  render() {
    return (
      <StandardEvent
        {...this.props}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
        extraClassNames={[ 'fc-timegrid-event', 'fc-v-event' ]}
      />
    )
  }

}

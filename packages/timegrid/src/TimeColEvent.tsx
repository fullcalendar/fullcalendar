import { StandardEvent, BaseComponent, MinimalEventProps, createFormatter } from '@fullcalendar/core/internal'
import { createElement } from '@fullcalendar/core/preact'

const DEFAULT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  meridiem: false,
})

export interface TimeColEventProps extends MinimalEventProps {
  isShort: boolean
}

export class TimeColEvent extends BaseComponent<TimeColEventProps> {
  render() {
    return (
      <StandardEvent
        {...this.props}
        elClasses={[
          'fc-timegrid-event',
          'fc-v-event',
          this.props.isShort && 'fc-timegrid-event-short',
        ]}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
      />
    )
  }
}

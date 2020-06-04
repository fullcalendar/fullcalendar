import { createElement, StandardEvent, BaseComponent, MinimalEventProps, createFormatter } from '@fullcalendar/common'


const DEFAULT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  meridiem: false
})


export interface TimeColEventProps extends MinimalEventProps {
  isCondensed: boolean
}

export class TimeColEvent extends BaseComponent<TimeColEventProps> {

  render() {
    let classNames = [
      'fc-timegrid-event',
      'fc-v-event'
    ]

    if (this.props.isCondensed) {
      classNames.push('fc-timegrid-event-condensed')
    }

    return (
      <StandardEvent
        {...this.props}
        defaultTimeFormat={DEFAULT_TIME_FORMAT}
        extraClassNames={classNames}
      />
    )
  }

}

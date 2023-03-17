import { EventContentArg } from '@fullcalendar/core'
import {
  BaseComponent,
  Seg,
  buildSegTimeText,
  EventContainer,
  getSegAnchorAttrs,
} from '@fullcalendar/core/internal'
import { createElement, Fragment } from '@fullcalendar/core/preact'
import { DEFAULT_TABLE_EVENT_TIME_FORMAT } from './event-rendering.js'

export interface DotTableEventProps {
  seg: Seg
  isDragging: boolean
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  defaultDisplayEventEnd: boolean
  children?: never
}

export class TableListItemEvent extends BaseComponent<DotTableEventProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg } = props
    let timeFormat = options.eventTimeFormat || DEFAULT_TABLE_EVENT_TIME_FORMAT
    let timeText = buildSegTimeText(
      seg,
      timeFormat,
      context,
      true,
      props.defaultDisplayEventEnd,
    )

    return (
      <EventContainer
        {...props}
        elTag="a"
        elClasses={['fc-daygrid-event', 'fc-daygrid-dot-event']}
        elAttrs={getSegAnchorAttrs(props.seg, context)}
        defaultGenerator={renderInnerContent}
        timeText={timeText}
        isResizing={false}
        isDateSelecting={false}
      />
    )
  }
}

function renderInnerContent(renderProps: EventContentArg) {
  return (
    <Fragment>
      <div
        className="fc-daygrid-event-dot"
        style={{ borderColor: renderProps.borderColor || renderProps.backgroundColor }}
      />
      {renderProps.timeText && (
        <div className="fc-event-time">{renderProps.timeText}</div>
      )}
      <div className="fc-event-title">
        {renderProps.event.title || <Fragment>&nbsp;</Fragment>}
      </div>
    </Fragment>
  )
}

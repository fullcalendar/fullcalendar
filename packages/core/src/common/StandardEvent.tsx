import { createElement, Fragment, Ref } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { buildSegTimeText, EventContentArg, getSegAnchorAttrs } from '../component/event-rendering.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { EventContainer } from './EventRoot.js'
import { Seg } from '../component/DateComponent.js'

export interface StandardEventProps {
  elRef?: Ref<HTMLElement>
  classNames?: string[]
  seg: Seg
  isDragging: boolean // rename to isMirrorDragging? make optional?
  isResizing: boolean // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  disableDragging?: boolean // defaults false
  disableResizing?: boolean // defaults false
  defaultTimeFormat: DateFormatter
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
}

// should not be a purecomponent
export class StandardEvent extends BaseComponent<StandardEventProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg } = props
    let timeFormat = options.eventTimeFormat || props.defaultTimeFormat
    let timeText = buildSegTimeText(
      seg,
      timeFormat,
      context,
      props.defaultDisplayEventTime,
      props.defaultDisplayEventEnd,
    )

    return (
      <EventContainer
        {...props /* includes children */}
        {...getSegAnchorAttrs(seg, context)}
        tagName="a"
        style={{
          borderColor: seg.ui.borderColor,
          backgroundColor: seg.ui.backgroundColor,
        }}
        defaultGenerator={renderInnerContent}
        timeText={timeText}
      >
        {(InnerContent, eventContentArg) => (
          <Fragment>
            <InnerContent
              className="fc-event-main"
              style={{ color: eventContentArg.textColor }}
            />
            {Boolean(eventContentArg.isStartResizable) && (
              <div className="fc-event-resizer fc-event-resizer-start" />
            )}
            {Boolean(eventContentArg.isEndResizable) && (
              <div className="fc-event-resizer fc-event-resizer-end" />
            )}
          </Fragment>
        )}
      </EventContainer>
    )
  }
}

function renderInnerContent(innerProps: EventContentArg) {
  return (
    <div className="fc-event-main-frame">
      {innerProps.timeText && (
        <div className="fc-event-time">{innerProps.timeText}</div>
      )}
      <div className="fc-event-title-container">
        <div className="fc-event-title fc-sticky">
          {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
        </div>
      </div>
    </div>
  )
}

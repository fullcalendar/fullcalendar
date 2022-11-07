import { createElement, Fragment } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { buildSegTimeText, EventContentArg, getSegAnchorAttrs } from '../component/event-rendering.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { EventContainer } from './EventContainer.js'
import { Seg } from '../component/DateComponent.js'
import { ElRef } from '../content-inject/ContentInjector.js'

export interface StandardEventProps {
  elRef?: ElRef
  elClasses?: string[]
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
    let { ui } = seg.eventRange
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
        {...props /* includes elRef */}
        elTag="a"
        elStyle={{
          borderColor: ui.borderColor,
          backgroundColor: ui.backgroundColor,
        }}
        elAttrs={getSegAnchorAttrs(seg, context)}
        defaultGenerator={renderInnerContent}
        timeText={timeText}
      >
        {(InnerContent, eventContentArg) => (
          <Fragment>
            <InnerContent
              elTag="div"
              elClasses={['fc-event-main']}
              elStyle={{ color: eventContentArg.textColor }}
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

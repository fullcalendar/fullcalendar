import { ComponentChildren, createElement, Fragment } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { buildSegTimeText, EventContentArg } from '../component/event-rendering'
import { EventRoot, MinimalEventProps } from './EventRoot'
import { Seg } from '../component/DateComponent'
import { DateFormatter } from '../datelib/DateFormatter'

export interface StandardEventProps extends MinimalEventProps {
  extraClassNames: string[]
  defaultTimeFormat: DateFormatter
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
  disableDragging?: boolean // default false
  disableResizing?: boolean // default false
  defaultContent?: (hookProps: EventContentArg) => ComponentChildren // not used by anyone yet
}

// should not be a purecomponent
export class StandardEvent extends BaseComponent<StandardEventProps> {
  render() {
    let { props, context } = this
    let { seg } = props
    let timeFormat = context.options.eventTimeFormat || props.defaultTimeFormat
    let timeText = buildSegTimeText(
      seg,
      timeFormat,
      context,
      props.defaultDisplayEventTime,
      props.defaultDisplayEventEnd,
    )

    return (
      <EventRoot
        seg={seg}
        timeText={timeText}
        disableDragging={props.disableDragging}
        disableResizing={props.disableResizing}
        defaultContent={props.defaultContent || renderInnerContent}
        isDragging={props.isDragging}
        isResizing={props.isResizing}
        isDateSelecting={props.isDateSelecting}
        isSelected={props.isSelected}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
      >
        {(rootElRef, classNames, innerElRef, innerContent, hookProps) => (
          <a
            className={props.extraClassNames.concat(classNames).join(' ')}
            style={{
              borderColor: hookProps.borderColor,
              backgroundColor: hookProps.backgroundColor,
            }}
            ref={rootElRef}
            {...getSegAnchorAttrs(seg)}
          >
            <div className="fc-event-main" ref={innerElRef} style={{ color: hookProps.textColor }}>
              {innerContent}
            </div>
            {hookProps.isStartResizable &&
              <div className="fc-event-resizer fc-event-resizer-start" />}
            {hookProps.isEndResizable &&
              <div className="fc-event-resizer fc-event-resizer-end" />}
          </a>
        )}
      </EventRoot>
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

function getSegAnchorAttrs(seg: Seg) {
  let { url } = seg.eventRange.def
  return url ? { href: url } : {}
}

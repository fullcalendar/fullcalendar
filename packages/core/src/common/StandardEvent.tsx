import { createElement, Fragment } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { buildSegTimeText, EventContentArg, getEventClassNames, getSegAnchorAttrs } from '../component/event-rendering.js'
import { DateFormatter } from '../datelib/DateFormatter.js'
import { buildEventContentArg, MinimalEventProps } from './EventRoot.js'
import { LifecycleMonitor } from '../content-inject/LifecycleMonitor.js'
import { ContentInjector } from '../content-inject/ContentInjector.js'

export interface StandardEventProps extends MinimalEventProps {
  extraClassNames: string[]
  defaultTimeFormat: DateFormatter
  defaultDisplayEventTime?: boolean // default true
  defaultDisplayEventEnd?: boolean // default true
  disableDragging?: boolean // default false
  disableResizing?: boolean // default false
}

// should not be a purecomponent
export class StandardEvent extends BaseComponent<StandardEventProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg } = props
    let timeFormat = context.options.eventTimeFormat || props.defaultTimeFormat
    let timeText = buildSegTimeText(
      seg,
      timeFormat,
      context,
      props.defaultDisplayEventTime,
      props.defaultDisplayEventEnd,
    )
    let eventContentArg = buildEventContentArg({ ...props, timeText }, context)
    let className = getEventClassNames(eventContentArg)
      .concat(seg.eventRange.ui.classNames)
      .concat(props.extraClassNames || [])
      .join(' ')

    return (
      <LifecycleMonitor
        didMount={options.eventDidMount}
        willUnmount={options.eventWillUnmount}
        renderProps={eventContentArg}
      >
        <a
          className={className}
          style={{
            borderColor: eventContentArg.borderColor,
            backgroundColor: eventContentArg.backgroundColor,
          }}
          {...getSegAnchorAttrs(seg, context)}
        >
          <ContentInjector
            className="fc-event-main"
            optionName="eventContent"
            style={{ color: eventContentArg.textColor }}
            renderProps={eventContentArg}
          >
            {renderInnerContent}
          </ContentInjector>
          {eventContentArg.isStartResizable &&
            <div className="fc-event-resizer fc-event-resizer-start" />}
          {eventContentArg.isEndResizable &&
            <div className="fc-event-resizer fc-event-resizer-end" />}
        </a>
      </LifecycleMonitor>
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

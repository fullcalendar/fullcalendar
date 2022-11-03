import {
  BaseComponent,
  Seg,
  buildSegTimeText,
  EventContentArg,
  getSegAnchorAttrs,
  buildEventContentArg,
  getEventClassNames,
  LifecycleMonitor,
  ContentInjector,
} from '@fullcalendar/core'
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
    let eventContentArg = buildEventContentArg({
      ...props,
      timeText,
      isResizing: false,
      isDateSelecting: false,
    }, context)
    let className = getEventClassNames(eventContentArg)
      .concat(seg.eventRange.ui.classNames)
      .concat(['fc-daygrid-event', 'fc-daygrid-dot-event'])
      .join(' ')

    return (
      <LifecycleMonitor
        didMount={options.eventDidMount}
        willUnmount={options.eventWillUnmount}
        renderProps={eventContentArg}
      >
        <ContentInjector
          tagName="a"
          className={className}
          extraAttrs={getSegAnchorAttrs(props.seg, context)}
          optionName="eventContent"
          renderProps={eventContentArg}
        >
          {renderInnerContent}
        </ContentInjector>
      </LifecycleMonitor>
    )
  }
}

function renderInnerContent(innerProps: EventContentArg) {
  return (
    <Fragment>
      <div
        className="fc-daygrid-event-dot"
        style={{ borderColor: innerProps.borderColor || innerProps.backgroundColor }}
      />
      {innerProps.timeText && (
        <div className="fc-event-time">{innerProps.timeText}</div>
      )}
      <div className="fc-event-title">
        {innerProps.event.title || <Fragment>&nbsp;</Fragment>}
      </div>
    </Fragment>
  )
}

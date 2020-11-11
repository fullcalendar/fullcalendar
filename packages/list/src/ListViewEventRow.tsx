import {
  MinimalEventProps, BaseComponent, ViewContext, createElement, AllDayContentArg,
  Seg, isMultiDayRange, DateFormatter, buildSegTimeText, createFormatter, EventContentArg, EventRoot, ComponentChildren, RenderHook,
} from '@fullcalendar/common'

const DEFAULT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  meridiem: 'short',
})

export class ListViewEventRow extends BaseComponent<MinimalEventProps> {
  render() {
    let { props, context } = this
    let { seg } = props

    let timeFormat = context.options.eventTimeFormat || DEFAULT_TIME_FORMAT

    return (
      <EventRoot
        seg={seg}
        timeText="" // BAD. because of all-day content
        disableDragging
        disableResizing
        defaultContent={renderEventInnerContent}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
        isSelected={props.isSelected}
        isDragging={props.isDragging}
        isResizing={props.isResizing}
        isDateSelecting={props.isDateSelecting}
      >
        {(rootElRef, classNames, innerElRef, innerContent, hookProps) => (
          <tr className={['fc-list-event', hookProps.event.url ? 'fc-event-forced-url' : ''].concat(classNames).join(' ')} ref={rootElRef}>
            {buildTimeContent(seg, timeFormat, context)}
            <td className="fc-list-event-graphic">
              <span className="fc-list-event-dot" style={{ borderColor: hookProps.borderColor || hookProps.backgroundColor }} />
            </td>
            <td className="fc-list-event-title" ref={innerElRef}>
              {innerContent}
            </td>
          </tr>
        )}
      </EventRoot>
    )
  }
}

function renderEventInnerContent(props: EventContentArg) {
  let { event } = props
  let url = event.url
  let anchorAttrs = url ? { href: url } : {}

  return (
    <a {...anchorAttrs}>
      {/* TODO: document how whole row become clickable */}
      {event.title}
    </a>
  )
}

function buildTimeContent(seg: Seg, timeFormat: DateFormatter, context: ViewContext): ComponentChildren {
  let { options } = context

  if (options.displayEventTime !== false) {
    let eventDef = seg.eventRange.def
    let eventInstance = seg.eventRange.instance
    let doAllDay = false
    let timeText: string

    if (eventDef.allDay) {
      doAllDay = true
    } else if (isMultiDayRange(seg.eventRange.range)) { // TODO: use (!isStart || !isEnd) instead?
      if (seg.isStart) {
        timeText = buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          eventInstance.range.start,
          seg.end,
        )
      } else if (seg.isEnd) {
        timeText = buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          seg.start,
          eventInstance.range.end,
        )
      } else {
        doAllDay = true
      }
    } else {
      timeText = buildSegTimeText(
        seg,
        timeFormat,
        context,
      )
    }

    if (doAllDay) {
      let hookProps: AllDayContentArg = {
        text: context.options.allDayText,
        view: context.viewApi,
      }

      return (
        <RenderHook<AllDayContentArg> // needed?
          hookProps={hookProps}
          classNames={options.allDayClassNames}
          content={options.allDayContent}
          defaultContent={renderAllDayInner}
          didMount={options.allDayDidMount}
          willUnmount={options.allDayWillUnmount}
        >
          {(rootElRef, classNames, innerElRef, innerContent) => (
            <td className={['fc-list-event-time'].concat(classNames).join(' ')} ref={rootElRef}>
              {innerContent}
            </td>
          )}
        </RenderHook>
      )
    }

    return (
      <td className="fc-list-event-time">
        {timeText}
      </td>
    )
  }

  return null
}

function renderAllDayInner(hookProps) {
  return hookProps.text
}

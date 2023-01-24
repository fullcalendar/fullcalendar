import { AllDayContentArg } from '@fullcalendar/core'
import {
  MinimalEventProps, BaseComponent, ViewContext,
  Seg, isMultiDayRange, DateFormatter, buildSegTimeText, createFormatter,
  getSegAnchorAttrs, EventContainer, ContentContainer,
} from '@fullcalendar/core/internal'
import {
  createElement,
  ComponentChildren,
  Fragment,
  ComponentChild,
} from '@fullcalendar/core/preact'

const DEFAULT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  meridiem: 'short',
})

export interface ListViewEventRowProps extends MinimalEventProps {
  timeHeaderId: string
  eventHeaderId: string
  dateHeaderId: string
}

export class ListViewEventRow extends BaseComponent<ListViewEventRowProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { seg, timeHeaderId, eventHeaderId, dateHeaderId } = props
    let timeFormat = options.eventTimeFormat || DEFAULT_TIME_FORMAT

    return (
      <EventContainer
        {...props}
        elTag="tr"
        elClasses={[
          'fc-list-event',
          seg.eventRange.def.url && 'fc-event-forced-url',
        ]}
        defaultGenerator={() => renderEventInnerContent(seg, context) /* weird */}
        seg={seg}
        timeText=""
        disableDragging={true}
        disableResizing={true}
      >
        {(InnerContent, eventContentArg) => (
          <Fragment>
            {buildTimeContent(seg, timeFormat, context, timeHeaderId, dateHeaderId)}
            <td aria-hidden className="fc-list-event-graphic">
              <span
                className="fc-list-event-dot"
                style={{
                  borderColor: eventContentArg.borderColor || eventContentArg.backgroundColor,
                }}
              />
            </td>
            <InnerContent
              elTag="td"
              elClasses={['fc-list-event-title']}
              elAttrs={{ headers: `${eventHeaderId} ${dateHeaderId}` }}
            />
          </Fragment>
        )}
      </EventContainer>
    )
  }
}

function renderEventInnerContent(seg: Seg, context: ViewContext) {
  let interactiveAttrs = getSegAnchorAttrs(seg, context)
  return (
    <a {...interactiveAttrs}>
      {/* TODO: document how whole row become clickable */}
      {seg.eventRange.def.title}
    </a>
  )
}

function buildTimeContent(
  seg: Seg,
  timeFormat: DateFormatter,
  context: ViewContext,
  timeHeaderId: string,
  dateHeaderId: string,
): ComponentChildren {
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
      let renderProps: AllDayContentArg = {
        text: context.options.allDayText,
        view: context.viewApi,
      }

      return (
        <ContentContainer
          elTag="td"
          elClasses={['fc-list-event-time']}
          elAttrs={{
            headers: `${timeHeaderId} ${dateHeaderId}`,
          }}
          renderProps={renderProps}
          generatorName="allDayContent"
          customGenerator={options.allDayContent}
          defaultGenerator={renderAllDayInner}
          classNameGenerator={options.allDayClassNames}
          didMount={options.allDayDidMount}
          willUnmount={options.allDayWillUnmount}
        />
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

function renderAllDayInner(renderProps: AllDayContentArg): ComponentChild {
  return renderProps.text
}

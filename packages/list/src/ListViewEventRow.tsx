import {
  MinimalEventProps, BaseComponent, ComponentContext, h,
  Seg, isMultiDayRange, DateFormatter, buildSegTimeText, createFormatter, EventMeta, EventRoot
} from "@fullcalendar/core"


const DEFAULT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  meridiem: 'short'
}


export default class ListViewEventRow extends BaseComponent<MinimalEventProps> {

  render(props: MinimalEventProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { seg } = props

    // TODO: avoid createFormatter, cache!!! see TODO in StandardEvent
    let timeFormat = createFormatter(
      options.eventTimeFormat || DEFAULT_TIME_FORMAT,
      options.defaultRangeSeparator
    )

    return (
      <EventRoot
        seg={seg}
        timeText={buildTimeText(seg, timeFormat, context)}
        defaultInnerContent={renderInnerContent}
        isPast={props.isPast}
        isFuture={props.isFuture}
        isToday={props.isToday}
        isSelected={props.isSelected}
        isDragging={props.isDragging}
        isResizing={props.isResizing}
        isDateSelecting={props.isDateSelecting}
      >
        {(rootElRef, classNames, style, innerElRef, innerContent, dynamicProps) => (
          <tr className={[ 'fc-list-item' ].concat(classNames).join(' ')} ref={rootElRef}>
            {dynamicProps.timeText &&
              <td class='fc-list-item-time'>
                {dynamicProps.timeText}
              </td>
            }
            <td class='fc-list-item-marker'>
              <span class='fc-event-dot' style={{
                backgroundColor: dynamicProps.event.backgroundColor
              }} />
            </td>
            <td class='fc-list-item-title' ref={innerElRef}>
              {innerContent}
            </td>
          </tr>
        )}
      </EventRoot>
    )
  }

}


function renderInnerContent(props: EventMeta) {
  let { event } = props
  let url = event.url
  let anchorAttrs = url ? { href: url } : {}

  return (
    <a {...anchorAttrs}>{/* TODO: document how whole row become clickable */}
      {event.title}
    </a>
  )
}


function buildTimeText(seg: Seg, timeFormat: DateFormatter, context: ComponentContext) {
  let { displayEventTime, allDayText } = context.options
  let eventDef = seg.eventRange.def
  let eventInstance = seg.eventRange.instance

  if (displayEventTime !== false) {

    if (eventDef.allDay) {
      return allDayText // TODO: allDayHtml?

    } else if (isMultiDayRange(seg.eventRange.range)) { // TODO: use (!isStart || !isEnd) instead?

      if (seg.isStart) {
        return buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          eventInstance.range.start,
          seg.end
        )

      } else if (seg.isEnd) {
        return buildSegTimeText(
          seg,
          timeFormat,
          context,
          null,
          null,
          seg.start,
          eventInstance.range.end
        )

      } else {
        return allDayText // TODO: allDayHtml?
      }

    } else {
      return buildSegTimeText(
        seg,
        timeFormat,
        context
      )
    }
  }

  return ''
}
